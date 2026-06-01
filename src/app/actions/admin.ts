"use server";

import { createNotification } from "./notifications";

import { createClient, createAdminClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

// --- SCHEMAS ---

const updateKYCSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["pending", "verified", "rejected", "under_review"]),
  notes: z.string().optional(),
});

const updateSettingSchema = z.object({
  key: z.string(),
  value: z.any(),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is too short"),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  bankAccountNo: z.string().optional(),
  ifscCode: z.string().optional(),
});

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("is_admin");
  if (error || data !== true) {
    throw new Error("Unauthorized: Admin access required");
  }
  
  return user;
}

async function logAdminAction(action: string, entityType: string, entityId: string | null, details: any = {}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  
  if (!user) return;

  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: "internal"
  });
}

// --- ACTIONS ---

/**
 * Fetch all stats for the admin dashboard.
 */
export async function getAdminStats() {
  await ensureAdmin();
  const supabase = await createClient();

  // 1. Calculate GMV (Sum of all active/funded/repaid invoices)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, status')
    .in('status', ['approved', 'partially_funded', 'funded', 'repaid']);
  
  const gmv = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  
  // 2. Calculate Projected Revenue (0.42% on withdrawals, modeled as 0.42% of GMV for projection)
  const commission = 0.0042;
  const revenue = gmv * commission;

  // 3. User counts
  const { count: msmeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'msme');

  const { count: investorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'investor');

  // 4. Active Assets (Approved & Funded)
  const { count: activeInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .in('status', ['approved', 'partially_funded', 'funded']);

  // 5. Pending KYC
  const { count: pendingKYC } = await supabase
    .from('kyc_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 6. Disputes
  const { count: disputes } = await supabase
    .from('disputes')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'resolved');

  return {
    gmv,
    revenue,
    msmeCount: msmeCount || 0,
    investorCount: investorCount || 0,
    activeInvoices: activeInvoices || 0,
    pendingKYC: pendingKYC || 0,
    disputes: disputes || 0,
    commissionPercent: commission * 100
  };
}

/**
 * Fetch KYC verification queue
 */
export async function getKYCQueue() {
  await ensureAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kyc_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        company_name,
        role,
        email,
        pan,
        gstin,
        bank_account_no,
        ifsc_code,
        company_address
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("KYC Queue Fetch Error:", error);
    throw new Error(`KYC fetch failed: ${error.message}`);
  }

  let supabaseAdmin;
  try {
    supabaseAdmin = await createAdminClient();
  } catch (e) {
    console.warn("Admin client initialization failed, skipping signed URLs:", e);
    return data || [];
  }

  // Generate signed URLs for private documents
  const enrichedData = await Promise.all((data || []).map(async (req) => {
    const enrichedDocs: Record<string, string> = {};
    if (req.documents && typeof req.documents === 'object') {
      const docs = req.documents as Record<string, string>;
      for (const [key, path] of Object.entries(docs)) {
        if (!path) continue;
        
        try {
          let signedUrl = null;
          
          if (supabaseAdmin) {
            const { data: signedData } = await supabaseAdmin.storage
              .from('kyc-documents')
              .createSignedUrl(path, 300);
              
            if (signedData) {
              signedUrl = signedData.signedUrl;
            }
          }

          if (signedUrl) {
            enrichedDocs[key] = signedUrl;
          } else {
            enrichedDocs[key] = "";
          }
        } catch (storageErr) {
          console.error(`Storage retrieval error for ${key}:`, storageErr);
          enrichedDocs[key] = "";
        }
      }
    }
    return { ...req, documents: enrichedDocs };
  }));

  return enrichedData;
}


/**
 * Fetch Invoices for monitoring
 */
export async function getInvoices() {
  await ensureAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profiles:msme_id (
        company_name
      ),
      investments (
        amount,
        investor_id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  let supabaseAdmin;
  try {
    supabaseAdmin = await createAdminClient();
  } catch (e) {
    console.warn("Admin client initialization failed, skipping signed URLs for invoices:", e);
    return data || [];
  }

  const enrichedInvoices = await Promise.all((data || []).map(async (inv: any) => {
    let invoiceUrl = "";
    if (inv.documents && typeof inv.documents === 'object') {
      const docs = inv.documents as Record<string, string>;
      const path = docs.invoice_path || docs.invoice_url;
      if (path && !path.startsWith('http')) {
        try {
          const { data: signedData } = await supabaseAdmin.storage
            .from('invoice-documents')
            .createSignedUrl(path, 300);
          if (signedData) {
            invoiceUrl = signedData.signedUrl;
          }
        } catch (err) {
          console.error("Error signing invoice URL:", err);
        }
      } else if (path) {
        invoiceUrl = path;
      }
    }
    return {
      ...inv,
      documents: {
        ...inv.documents,
        invoice_url: invoiceUrl
      }
    };
  }));

  return enrichedInvoices;
}

/**
 * Fetch Platform Settings
 */
export async function getPlatformSettings() {
  await ensureAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*');

  if (error) throw new Error(error.message);
  
  // Convert array to object for easier use
  const settingsObj: Record<string, any> = {};
  data?.forEach(s => {
    settingsObj[s.key] = s.value;
  });
  return settingsObj;
}

export const updateSettingAction = actionClient
  .schema(updateSettingSchema)
  .action(async ({ parsedInput: { key, value } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    const { error } = await supabase
      .from('platform_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) throw new Error(error.message);
    
    await logAdminAction('update_setting', 'setting', null, { key, value });
    
    revalidatePath("/admin");
    return { success: true };
  });

/**
 * Fetch Disputes
 */
export async function getDisputeRecords() {
  await ensureAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      invoices (invoice_number),
      profiles:raised_by (full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch Audit Logs
 */
export async function getAuditLogs() {
  await ensureAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:admin_id (full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data;
}

export const approveKYCAction = actionClient
  .schema(z.object({ 
    userId: z.string().uuid(),
    requestId: z.string().uuid()
  }))
  .action(async ({ parsedInput: { userId, requestId } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // Call the safe atomic RPC
    const { data, error: rpcError } = await supabase.rpc('approve_kyc_request', {
      p_user_id: userId,
      p_request_id: requestId
    });

    if (rpcError) throw new Error(rpcError.message);
    const result = data as any;
    if (!result || !result.success) {
      throw new Error(result?.error || "Failed to approve KYC.");
    }
    
    const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', userId).single();

    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/kyc");
    revalidatePath("/investor");
    revalidatePath("/investor/kyc");

    // Notify User
    if (userProfile?.role === 'msme') {
      await createNotification(
        userId,
        "KYC Approved! ✅",
        "Your business profile has been verified. You can now upload invoices and seek funding.",
        "success",
        "/msme"
      );
    } else if (userProfile?.role === 'investor') {
      await createNotification(
        userId,
        "Verification Cleared! 🛡️",
        "Your investor credentials have been formally checked. Investing money is now unlocked.",
        "success",
        "/investor"
      );
    }

    return { success: true };
  });

export const rejectKYCAction = actionClient
  .schema(z.object({ 
    userId: z.string().uuid(),
    requestId: z.string().uuid(),
    notes: z.string().min(5, "Please provide a detailed rejection reason")
  }))
  .action(async ({ parsedInput: { userId, requestId, notes } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // Call the safe atomic RPC
    const { data, error: rpcError } = await supabase.rpc('reject_kyc_request', {
      p_user_id: userId,
      p_request_id: requestId,
      p_notes: notes
    });

    if (rpcError) throw new Error(rpcError.message);
    const result = data as any;
    if (!result || !result.success) {
      throw new Error(result?.error || "Failed to reject KYC.");
    }
    
    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/kyc");
    revalidatePath("/investor");
    revalidatePath("/investor/kyc");

    // Notify User
    await createNotification(
      userId,
      "Verification Issue ⚠️",
      `Your verification request was not approved. Reason: ${notes}`,
      "error",
      "/profile"
    );

    return { success: true };
  });

/**
 * Update Profile Action
 */
export const updateProfileAction = actionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase.rpc('update_own_profile_details', {
      p_full_name: parsedInput.fullName, 
      p_company_name: parsedInput.companyName || null,
      p_company_address: parsedInput.companyAddress || null,
      p_gstin: parsedInput.gstin || null,
      p_pan: parsedInput.pan || null,
      p_bank_account_no: parsedInput.bankAccountNo || null,
      p_ifsc_code: parsedInput.ifscCode || null
    });

    if (error) throw new Error(error.message);
    
    // Also update auth metadata
    await supabase.auth.updateUser({
      data: { 
        full_name: parsedInput.fullName, 
        company_name: parsedInput.companyName,
        company_address: parsedInput.companyAddress,
        gstin: parsedInput.gstin,
        pan: parsedInput.pan,
        bank_account_no: parsedInput.bankAccountNo,
        ifsc_code: parsedInput.ifscCode
      }
    });

    revalidatePath("/profile");
    return { success: true };
  });

/**
 * Approve Invoice Action
 */
export const approveInvoiceAction = actionClient
  .schema(z.object({ 
    invoiceId: z.string().uuid(),
    verifiedAmount: z.number().positive().optional()
  }))
  .action(async ({ parsedInput: { invoiceId, verifiedAmount } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // Call safe atomic RPC
    const { data, error: rpcError } = await supabase.rpc('approve_invoice_request', {
      p_invoice_id: invoiceId,
      p_verified_amount: verifiedAmount || null
    });

    if (rpcError) throw new Error(rpcError.message);
    const result = data as any;
    if (!result || !result.success) {
      throw new Error(result?.error || "Failed to approve invoice.");
    }
    
    revalidatePath("/admin");

    // Fetch MSME ID to notify
    const { data: inv } = await supabase.from('invoices').select('msme_id, invoice_number').eq('id', invoiceId).single();
    if (inv) {
      await createNotification(
        inv.msme_id,
        "Invoice Verified 📄",
        `Invoice #${inv.invoice_number} has been verified and is now live for funding.`,
        "success",
        "/msme/invoices"
      );
    }

    return { success: true };
  });

/**
 * Reject Invoice Action
 */
export const rejectInvoiceAction = actionClient
  .schema(z.object({ 
    invoiceId: z.string().uuid(), 
    notes: z.string().min(5, "Reason required") 
  }))
  .action(async ({ parsedInput: { invoiceId, notes } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // Call safe atomic RPC
    const { data, error: rpcError } = await supabase.rpc('reject_invoice_request', {
      p_invoice_id: invoiceId,
      p_notes: notes
    });

    if (rpcError) throw new Error(rpcError.message);
    const result = data as any;
    if (!result || !result.success) {
      throw new Error(result?.error || "Failed to reject invoice.");
    }
    
    revalidatePath("/admin");

    // Fetch MSME ID to notify
    const { data: inv } = await supabase.from('invoices').select('msme_id, invoice_number').eq('id', invoiceId).single();
    if (inv) {
      await createNotification(
        inv.msme_id,
        "Invoice Rejected ⚠️",
        `Invoice #${inv.invoice_number} was rejected. Reason: ${notes}`,
        "warning",
        "/msme/invoices"
      );
    }

    return { success: true };
  });

/**
 * Resolve Dispute Action
 */
export const resolveDisputeAction = actionClient
  .schema(z.object({ 
    disputeId: z.string().uuid(),
    resolution: z.string().min(10, "Detail required")
  }))
  .action(async ({ parsedInput: { disputeId, resolution } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // 1. Fetch dispute details before resolving to send notifications
    const { data: dispute } = await supabase
      .from('disputes')
      .select('raised_by, invoice_id, subject, invoices(invoice_number)')
      .eq('id', disputeId)
      .single();

    // 2. Resolve Dispute
    const { error } = await supabase
      .from('disputes')
      .update({ 
        status: 'resolved', 
        resolution,
        updated_at: new Date().toISOString() 
      })
      .eq('id', disputeId);

    if (error) throw new Error(error.message);
    
    await logAdminAction('resolve_dispute', 'dispute', disputeId, { resolution });
    
    // 3. Notify Creator
    if (dispute) {
      const disp = dispute as any;
      const invNum = disp.invoices?.invoice_number || (Array.isArray(disp.invoices) ? disp.invoices[0]?.invoice_number : 'Asset');

      await createNotification(
        disp.raised_by,
        "Dispute Resolved ⚖️",
        `The dispute on Invoice #${invNum} has been resolved: "${disp.subject}"`,
        "success",
        "/msme/invoices"
      );

      // 4. Notify funded investors
      if (disp.invoice_id) {
        const { data: investments } = await supabase
          .from('investments')
          .select('investor_id')
          .eq('invoice_id', disp.invoice_id);

        if (investments) {
          for (const inv of investments) {
            await createNotification(
              inv.investor_id,
              "Invoice Dispute Resolved ✅",
              `The dispute on your invested Invoice #${invNum} has been fully resolved.`,
              "success",
              "/investor/portfolio"
            );
          }
        }
      }
    }

    // 5. Revalidate all related dashboards so it updates globally in real-time
    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/invoices");
    revalidatePath("/msme/support");
    revalidatePath("/msme/repayments");
    revalidatePath("/investor");
    revalidatePath("/investor/portfolio");
    revalidatePath("/investor/wallet");

    return { success: true };
  });

/**
 * Fetch Settlements (Repayments pending verification)
 */
export async function getSettlements() {
  await ensureAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('repayments')
    .select(`
      *,
      invoices!inner(
        invoice_number,
        msme_id,
        profiles:msme_id(company_name)
      )
    `)
    .eq('status', 'pending_verification') 
    .order('updated_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Verify Settlement Action
 */
export const verifySettlementAction = actionClient
  .schema(z.object({ 
    repaymentId: z.string().uuid(),
    status: z.enum(['repaid', 'overdue'])
  }))
  .action(async ({ parsedInput: { repaymentId, status } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    const { data: repayment } = await supabase
      .from('repayments')
      .select('*, invoices!inner(msme_id, invoice_number, verified_amount, amount)')
      .eq('id', repaymentId)
      .single();

    if (!repayment) throw new Error("Repayment record not found.");

    // 1. Call Atomic RPC for settlement
    const { data, error: rpcError } = await supabase.rpc('settle_repayment', {
      p_repayment_id: repaymentId,
      p_status: status
    });

    if (rpcError) throw new Error(rpcError.message);
    if (!data.success) throw new Error(data.error || "Settlement failed.");

    if (status === 'repaid') {
      // 2. Notify MSME
      await createNotification(
        repayment.invoices.msme_id,
        "Payment Confirmed! 🏦",
        `Your payment for Invoice #${repayment.invoices.invoice_number} has been verified. Asset is now fully repaid.`,
        "success",
        "/msme/repayments"
      );

      // 3. Notify Participating Investors (Batch)
      const { data: investments } = await supabase
        .from('investments')
        .select('investor_id, amount')
        .eq('invoice_id', repayment.invoice_id);

      if (investments) {
        for (const inv of investments) {
          const totalFace = Number(repayment.invoices.verified_amount || repayment.invoices.amount || 1);
          const share = Number(inv.amount) / totalFace;
          const payout = Math.round(Number(repayment.amount_paid - (repayment.penalty_amount || 0)) * share);

          await createNotification(
            inv.investor_id,
            "Repayment Received! 💰",
            `₹${payout.toLocaleString('en-IN')} credited for Invoice #${repayment.invoices.invoice_number}.`,
            "success",
            "/investor/portfolio"
          );
        }
      }
    }

    await logAdminAction('verify_settlement', 'repayment', repaymentId, { status });
    
    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/repayments");
    revalidatePath("/msme/invoices");
    revalidatePath("/investor");
    revalidatePath("/investor/portfolio");
    revalidatePath("/investor/wallet");
    
    return { success: true };
  });

/**
 * Fetch All Transactions for Admin
 */
export async function getTransactions() {
  await ensureAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        company_name,
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch All Withdrawal Requests for Admin
 */
export async function getWithdrawalRequests() {
  await ensureAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('withdrawals')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        company_name,
        wallet_balance,
        bank_account_no,
        ifsc_code
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Approve/Complete Withdrawal Action
 */
export const approveWithdrawalAction = actionClient
  .schema(z.object({ withdrawalId: z.string().uuid() }))
  .action(async ({ parsedInput: { withdrawalId } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // 1. Update status to completed
    const { data: withdrawal, error: updateError } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString() 
      })
      .eq('id', withdrawalId)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);
    
    await logAdminAction('approve_withdrawal', 'withdrawal', withdrawalId, { status: 'completed' });
    
    // 2. Notify User
    await createNotification(
      withdrawal.user_id,
      "Withdrawal Completed! 🏦",
      `Your withdrawal of ₹${withdrawal.amount.toLocaleString('en-IN')} has been processed to your bank account.`,
      "success",
      "/investor/wallet"
    );

    revalidatePath("/admin");
    revalidatePath("/investor/wallet");
    
    return { success: true };
  });

/**
 * Reject Withdrawal Action (Refunds balance)
 */
export const rejectWithdrawalAction = actionClient
  .schema(z.object({ 
    withdrawalId: z.string().uuid(),
    notes: z.string().min(5, "Reason required")
  }))
  .action(async ({ parsedInput: { withdrawalId, notes } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // 1. Fetch withdrawal details
    const { data: withdrawal } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single();

    if (!withdrawal) throw new Error("Withdrawal record not found.");
    if (withdrawal.status !== 'pending') throw new Error("Only pending withdrawals can be rejected.");

    // 2. Update status to rejected
    const { error: updateError } = await supabase
      .from('withdrawals')
      .update({ 
        status: 'rejected',
        notes: notes,
        updated_at: new Date().toISOString() 
      })
      .eq('id', withdrawalId);

    if (updateError) throw new Error(updateError.message);
    
    // 3. Refund Wallet Balance
    const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', withdrawal.user_id).single();
    const refundAmount = Number(withdrawal.amount);
    
    await supabase
      .from('profiles')
      .update({ wallet_balance: Number(profile?.wallet_balance || 0) + refundAmount })
      .eq('id', withdrawal.user_id);

    // 4. Create Refund Transaction
    await supabase.from('transactions').insert({
      user_id: withdrawal.user_id,
      amount: refundAmount,
      type: 'funding', // Or 'refund'
      description: `Refund: Withdrawal Request #${withdrawalId.split('-')[0].toUpperCase()} Rejected`,
      reference_id: withdrawalId
    });

    await logAdminAction('reject_withdrawal', 'withdrawal', withdrawalId, { status: 'rejected', notes });
    
    // 5. Notify User
    await createNotification(
      withdrawal.user_id,
      "Withdrawal Rejected ⚠️",
      `Your withdrawal of ₹${withdrawal.amount.toLocaleString('en-IN')} was rejected. Reason: ${notes}. Funds have been refunded to your wallet.`,
      "error",
      "/investor/wallet"
    );

    revalidatePath("/admin");
    revalidatePath("/investor/wallet");
    
    return { success: true };
  });

/**
 * Fetch Pre-closure Requests
 */
export async function getPreClosureRequests() {
  await ensureAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('pre_closure_requests')
    .select(`
      *,
      invoices!inner(
        invoice_number,
        msme_id,
        profiles:msme_id(company_name)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Approve Pre-closure Request
 */
export const approvePreClosureAction = actionClient
  .schema(z.object({ requestId: z.string().uuid() }))
  .action(async ({ parsedInput: { requestId } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // 1. Fetch request details
    const { data: request } = await supabase
      .from('pre_closure_requests')
      .select('*, invoices!inner(msme_id, invoice_number)')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error("Request not found.");

    // 2. Update Request status
    await supabase
      .from('pre_closure_requests')
      .update({ status: 'approved', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    // 3. Create a scheduled repayment for the pre-closure amount
    await supabase
      .from('repayments')
      .update({ status: 'cancelled' })
      .eq('invoice_id', request.invoice_id)
      .eq('status', 'scheduled');

    await supabase.from('repayments').insert({
      invoice_id: request.invoice_id,
      amount_due: request.pre_closure_amount,
      due_date: new Date().toISOString(),
      status: 'scheduled',
      penalty_amount: request.penalty_amount
    });

    // 4. Notify MSME
    await createNotification(
      request.invoices.msme_id,
      "Pre-closure Approved! 🛡️",
      `Your request for Invoice #${request.invoices.invoice_number} is approved. Total payment: ₹${request.pre_closure_amount.toLocaleString('en-IN')}.`,
      "success",
      "/msme/repayments"
    );

    await logAdminAction('approve_preclosure', 'pre_closure_request', requestId, { status: 'approved' });
    
    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/repayments");
    revalidatePath("/msme/invoices");
    revalidatePath("/investor");
    revalidatePath("/investor/portfolio");
    return { success: true };
  });

/**
 * Disburse Funds to MSME (After Invoice is Fully Funded)
 */
export const disburseToMSMEAction = actionClient
  .schema(z.object({ invoiceId: z.string().uuid() }))
  .action(async ({ parsedInput: { invoiceId } }) => {
    const user = await ensureAdmin();
    const supabase = await createClient();

    // Call the RPC we created
    const { data, error: rpcError } = await supabase.rpc('disburse_to_msme', {
      p_invoice_id: invoiceId
    });

    if (rpcError) {
      console.error("RPC Error (disburse_to_msme):", rpcError);
      throw new Error(rpcError.message);
    }

    const result = data as any;
    if (!result.success) {
      throw new Error(result.error || "Payment failed.");
    }

    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/invoices");

    return { success: true, payout: result.payout };
  });
/**
 * Fetch Support Tickets for Admin
 */
export async function getSupportTickets() {
  await ensureAdmin();
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        company_name,
        role
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Resolve Support Ticket Action
 */
export const resolveSupportTicketAction = actionClient
  .schema(z.object({ 
    ticketId: z.string().uuid(),
    resolution: z.string().min(5, "Resolution required")
  }))
  .action(async ({ parsedInput: { ticketId, resolution } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('support_tickets')
      .update({ 
        status: 'resolved', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', ticketId);

    if (error) throw new Error(error.message);
    
    await logAdminAction('resolve_support_ticket', 'support_ticket', ticketId, { resolution });
    
    // Fetch User ID and profile role to notify
    const { data: ticket } = await supabase
      .from('support_tickets')
      .select('user_id, subject, profiles:user_id(role)')
      .eq('id', ticketId)
      .single();

    if (ticket) {
      const isInvestor = (ticket.profiles as any)?.role === 'investor';
      const redirectUrl = isInvestor ? '/investor' : '/msme/support';
      
      await createNotification(
        ticket.user_id,
        "Support Ticket Resolved ✅",
        `Your ticket "${ticket.subject}" has been marked as resolved.`,
        "success",
        redirectUrl
      );
    }

    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/support");
    revalidatePath("/investor");
    return { success: true };
  });
