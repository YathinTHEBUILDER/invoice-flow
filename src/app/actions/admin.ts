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
});

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    // Second check: check metadata just in case
    const { data: userDetails } = await supabase.auth.getUser();
    const metadataRole = userDetails.user?.app_metadata?.role || userDetails.user?.user_metadata?.role;
    if (metadataRole !== 'admin') {
      throw new Error("Unauthorized: Admin access required");
    }
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
        email
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
        
        // If it's already a full URL, use it (backward compatibility)
        if (typeof path === 'string' && path.startsWith('http')) {
          enrichedDocs[key] = path;
          continue;
        }
        
        try {
          let signedUrl = null;
          
          if (supabaseAdmin) {
            // Try primary bucket (hyphen)
            const { data: signedData } = await supabaseAdmin.storage
              .from('kyc-documents')
              .createSignedUrl(path, 3600);
              
            if (signedData) {
              signedUrl = signedData.signedUrl;
            } else {
              // Fallback to secondary bucket (underscore)
              const { data: fallbackData } = await supabaseAdmin.storage
                .from('kyc_documents')
                .createSignedUrl(path, 3600);
              
              if (fallbackData) {
                signedUrl = fallbackData.signedUrl;
              }
            }
          }

          // Ultimate Fallback: Public URL
          if (!signedUrl) {
            const supabase = await createClient();
            const { data: { publicUrl } } = supabase.storage
              .from('kyc-documents')
              .getPublicUrl(path);
            signedUrl = publicUrl;
          }

          enrichedDocs[key] = signedUrl;
        } catch (storageErr) {
          console.error(`Storage retrieval error for ${key}:`, storageErr);
          // Last resort: try to construct a public URL manually if path is relative
          if (path && !path.startsWith('http')) {
            const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            enrichedDocs[key] = `${baseUrl}/storage/v1/object/public/kyc-documents/${path}`;
          }
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
  return data;
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
    
    // 1. Update Profile status and reset rejection tracking
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        kyc_status: 'verified', 
        kyc_notes: 'KYC verified successfully.',
        kyc_rejection_count: 0,
        last_kyc_rejected_at: null
      })
      .eq('id', userId);

    if (profileError) throw new Error(profileError.message);

    // 2. Update KYC Request status
    const { error: kycError } = await supabase
      .from('kyc_requests')
      .update({ status: 'verified', updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (kycError) throw new Error(kycError.message);

    // 3. Log Platform Fee (1% of the default facility limit of 50 Lakhs = 50,000)
    // The user rules specify Platform Fee = Invoice Value * 1% but charged ONLY at KYC.
    // We treat this as a one-time onboarding fee based on the standard credit limit.
    await supabase.from('transactions').insert({
      user_id: userId,
      amount: -50000,
      type: 'platform_fee' as any, // Cast to any if 'platform_fee' is not in the enum yet
      description: 'One-time Platform Onboarding Fee (1% of facility limit)',
      reference_id: requestId
    });

    await logAdminAction('approve_kyc', 'profile', userId, { requestId, fee: 50000 });
    
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
        "Compliance Cleared! 🛡️",
        "Your investor credentials have been formally vetted. Capital deployment is now unlocked.",
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
    
    // 1. Fetch current rejection stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('kyc_rejection_count')
      .eq('id', userId)
      .single();

    const newCount = (profile?.kyc_rejection_count || 0) + 1;

    // 2. Update Profile status and tracking
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        kyc_status: 'rejected', 
        kyc_notes: notes,
        kyc_rejection_count: newCount,
        last_kyc_rejected_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) throw new Error(profileError.message);

    // 2. Update KYC Request status
    const { error: kycError } = await supabase
      .from('kyc_requests')
      .update({ status: 'rejected', notes, updated_at: new Date().toISOString() })
      .eq('id', requestId);

    if (kycError) throw new Error(kycError.message);

    await logAdminAction('reject_kyc', 'profile', userId, { requestId, notes });
    
    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/kyc");
    revalidatePath("/investor");
    revalidatePath("/investor/kyc");

    // Notify User
    await createNotification(
      userId,
      "Compliance Issue ⚠️",
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
  .action(async ({ parsedInput: { fullName, companyName } }) => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        company_name: companyName,
        updated_at: new Date().toISOString() 
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    
    // Also update auth metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName, company_name: companyName }
    });

    revalidatePath("/profile");
    return { success: true };
  });

/**
 * Approve Invoice Action
 */
export const approveInvoiceAction = actionClient
  .schema(z.object({ invoiceId: z.string().uuid() }))
  .action(async ({ parsedInput: { invoiceId } }) => {
    await ensureAdmin();
    const supabase = await createClient();
    
    // 1. Fetch invoice to check verified_amount
    const { data: currentInv } = await supabase
      .from('invoices')
      .select('amount, verified_amount')
      .eq('id', invoiceId)
      .single();

    const updatePayload: any = { 
      status: 'approved', 
      updated_at: new Date().toISOString() 
    };

    // If admin hasn't explicitly set a verified amount, default to the original face value
    if (currentInv && (currentInv.verified_amount === null || currentInv.verified_amount === undefined)) {
      updatePayload.verified_amount = currentInv.amount;
    }

    const { error } = await supabase
      .from('invoices')
      .update(updatePayload)
      .eq('id', invoiceId);

    if (error) throw new Error(error.message);
    
    await logAdminAction('approve_invoice', 'invoice', invoiceId, { 
      status: 'approved',
      verified_amount: updatePayload.verified_amount || currentInv?.verified_amount 
    });
    
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
    
    const { error } = await supabase
      .from('invoices')
      .update({ 
        status: 'rejected', 
        admin_notes: notes,
        updated_at: new Date().toISOString() 
      })
      .eq('id', invoiceId);

    if (error) throw new Error(error.message);
    
    await logAdminAction('reject_invoice', 'invoice', invoiceId, { status: 'rejected', notes });
    
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
    
    revalidatePath("/admin");
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
      p_admin_id: (await supabase.auth.getUser()).data.user?.id,
      p_status: status
    });

    if (rpcError) throw new Error(rpcError.message);
    if (!data.success) throw new Error(data.error || "Settlement failed.");

    if (status === 'repaid') {
      // 2. Notify MSME
      await createNotification(
        repayment.invoices.msme_id,
        "Settlement Confirmed! 🏦",
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
        wallet_balance
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
      `Your request for Invoice #${request.invoices.invoice_number} is approved. Total settlement: ₹${request.pre_closure_amount.toLocaleString('en-IN')}.`,
      "success",
      "/msme/repayments"
    );

    await logAdminAction('approve_preclosure', 'pre_closure_request', requestId, { status: 'approved' });
    
    revalidatePath("/admin");
    revalidatePath("/msme/investments");
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
      p_invoice_id: invoiceId,
      p_admin_id: user.id
    });

    if (rpcError) {
      console.error("RPC Error (disburse_to_msme):", rpcError);
      throw new Error(rpcError.message);
    }

    const result = data as any;
    if (!result.success) {
      throw new Error(result.error || "Disbursement failed.");
    }

    revalidatePath("/admin");
    revalidatePath("/msme");
    revalidatePath("/msme/invoices");

    return { success: true, payout: result.payout };
  });
