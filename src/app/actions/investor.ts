"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { createNotification } from "./notifications";

/**
 * Fetch Investor Dashboard Stats
 */
export async function getInvestorStats() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return null;

  // 1. Fetch investments participation
  const { data: investments } = await supabase
    .from('investments')
    .select('*, invoices(*)')
    .eq('investor_id', user.id);

  const totalInvestedFaceValue = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const activeAssets = investments?.filter(inv => inv.status === 'active').length || 0;
  
  // 2. Calculate actual deployment costs (What investor actually paid)
  const totalDeployed = investments?.reduce((sum, inv) => {
    // These must exist for any verified/active investment
    const rate = Number(inv.invoices?.discount_rate);
    const tenure = Number(inv.invoices?.tenure_days);
    
    if (isNaN(rate) || isNaN(tenure)) {
      console.warn(`Missing financial terms for investment ${inv.id}`);
      return sum + Number(inv.amount); 
    }

    // Calculation: Face Value - Discount
    const discount = Number(inv.amount) * rate * (tenure / 365);
    return sum + (Number(inv.amount) - discount);
  }, 0) || 0;

  // 3. Fetch Payouts (Face Value received back)
  const { data: payoutTxs } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'payout');

  const totalReceived = payoutTxs?.reduce((sum, tx) => sum + Number(tx.amount), 0) || 0;
  
  // 4. Calculate Net Profit (Yield)
  // For realized investments: Payout - Deployment
  // For unrealized: (Face Value - Deployment) is projected profit
  const realizedInvestments = investments?.filter(inv => inv.status === 'repaid') || [];
  const realizedProfit = realizedInvestments.reduce((sum, inv) => {
    const rate = inv.invoices?.discount_rate || 0.12;
    const tenure = inv.invoices?.tenure_days || 45;
    return sum + (Number(inv.amount) * rate * (tenure / 365));
  }, 0);

  // 3. Fetch Wallet Balance & KYC Status & Recent Transactions
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance, locked_balance, kyc_status, bank_account_no, ifsc_code')
    .eq('id', user.id)
    .single();

  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    totalInvested: totalInvestedFaceValue,
    activeAssets,
    totalDeployed,
    realizedProfit,
    totalReceived,
    walletBalance: profile?.wallet_balance || 0,
    lockedBalance: profile?.locked_balance || 0,
    kycStatus: profile?.kyc_status || 'not_started',
    bankDetails: {
      accountNo: profile?.bank_account_no,
      ifscCode: profile?.ifsc_code
    },
    recentTransactions: recentTransactions || []
  };
};

/**
 * Fetch Detailed Portfolio
 */
export async function getInvestorPortfolio() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from('investments')
    .select(`
      *,
      invoices (
        *,
        profiles:msme_id (company_name)
      )
    `)
    .eq('investor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch Marketplace Invoices (Available for Funding)
 */
export async function getMarketplaceInvoices() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profiles:msme_id (
        company_name,
        kyc_status
      )
    `)
    .in('status', ['approved', 'partially_funded'])
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Helper to upload KYC documents to Supabase Storage
 */
async function uploadKYCDocument(supabase: any, userId: string, file: File | Blob, type: string) {
  const fileName = `${userId}/${type}-${Date.now()}`;
  const { data, error } = await supabase.storage
    .from('kyc_documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw new Error(`Upload failed for ${type}: ${error.message}`);
  
  const { data: { publicUrl } } = supabase.storage
    .from('kyc_documents')
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Submit Investor KYC Action
 */
export async function submitInvestorKYCAction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { error: "Unauthorized" };

  try {
    const documents: Record<string, string> = {};
    
    // Process File Uploads
    const panFile = formData.get("pan") as File | null;
    const aadhaarFile = formData.get("aadhaar") as File | null;
    const bankFile = formData.get("bank_proof") as File | null;
    const addressFile = formData.get("address_proof") as File | null;
    const selfieBlob = formData.get("selfie") as Blob | null;

    if (panFile) documents.pan = await uploadKYCDocument(supabase, user.id, panFile, "pan");
    if (aadhaarFile) documents.aadhaar = await uploadKYCDocument(supabase, user.id, aadhaarFile, "aadhaar");
    if (bankFile) documents.bank_proof = await uploadKYCDocument(supabase, user.id, bankFile, "bank");
    if (addressFile) documents.address_proof = await uploadKYCDocument(supabase, user.id, addressFile, "address");
    if (selfieBlob) documents.selfie = await uploadKYCDocument(supabase, user.id, selfieBlob, "selfie");

    const { error: kycError } = await supabase
      .from('kyc_requests')
      .upsert({
        user_id: user.id,
        status: 'pending',
        documents,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (kycError) throw new Error(kycError.message);

    await supabase
      .from('profiles')
      .update({ kyc_status: 'pending' })
      .eq('id', user.id);

    // Notify Admins
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    if (admins) {
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "Investor Documents Submitted 🛡️",
          `Investor ${user.email} has submitted credentials for manual audit.`,
          "info",
          "/admin?tab=kyc"
        );
      }
    }

    revalidatePath("/investor/kyc");
    revalidatePath("/investor");
    return { success: true };
  } catch (error: any) {
    console.error("KYC Submission Error:", error);
    return { error: error.message };
  }
}

/**
 * Fund Invoice Action
 */
export const fundInvoiceAction = actionClient
  .schema(z.object({ 
    invoiceId: z.string().uuid(),
    amount: z.number().positive("Amount must be greater than zero")
  }))
  .action(async ({ parsedInput: { invoiceId, amount } }) => {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) throw new Error("Not authenticated");

    // 1. Check Profile & KYC
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance, kyc_status')
      .eq('id', user.id)
      .single();

    if (profile?.kyc_status !== 'verified') {
      throw new Error("Compliance Clearance Required. Please complete KYC verification.");
    }

    // 2. Call Atomic RPC for investment
    const { data, error: rpcError } = await supabase.rpc('invest_in_invoice', {
      p_investor_id: user.id,
      p_invoice_id: invoiceId,
      p_amount: amount
    });

    if (rpcError) throw new Error(rpcError.message);
    if (!data.success) throw new Error(data.error || "Investment execution failed.");

    // 3. Notifications
    await createNotification(
      user.id,
      "Investment Successful! 🚀",
      `You have committed ₹${amount.toLocaleString('en-IN')} to Invoice #${data?.invoice_number || 'Asset'}.`,
      "success",
      "/investor"
    );

    revalidatePath("/investor");
    revalidatePath("/msme");
    return { success: true };
  });

/**
 * Add Funds to Wallet Action
 */
export const addFundsAction = actionClient
  .schema(z.object({ 
    amount: z.number().min(100, "Minimum amount is ₹100"),
    description: z.string().optional()
  }))
  .action(async ({ parsedInput: { amount, description } }) => {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) throw new Error("Not authenticated");

    // 1. Fetch current balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    const newBalance = Number(profile?.wallet_balance || 0) + amount;

    // 2. Update Balance
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        wallet_balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) throw new Error(updateError.message);

    // 3. Create Transaction Log
    const { error: txError } = await supabase.from('transactions').insert({
      user_id: user.id,
      amount: amount,
      type: 'funding',
      description: description || "Wallet Funding (Manual Upload)",
    });

    if (txError) {
      // Rollback balance (not truly atomic here but better than nothing)
      await supabase
        .from('profiles')
        .update({ wallet_balance: profile?.wallet_balance })
        .eq('id', user.id);
      throw new Error(txError.message);
    }

    // 4. Notification
    await createNotification(
      user.id,
      "Funds Added! 💰",
      `₹${amount.toLocaleString('en-IN')} has been successfully credited to your liquidity wallet.`,
      "success",
      "/investor/wallet"
    );

    revalidatePath("/investor/wallet");
    revalidatePath("/investor");
    return { success: true, newBalance };
  });

/**
 * Withdraw Funds from Wallet Action
 */
export const withdrawFundsAction = actionClient
  .schema(z.object({ 
    amount: z.number().min(100, "Minimum withdrawal is ₹100"),
    description: z.string().optional()
  }))
  .action(async ({ parsedInput: { amount, description } }) => {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) throw new Error("Not authenticated");

    // 1. Fetch current balance and bank details
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance, bank_account_no, ifsc_code, kyc_status')
      .eq('id', user.id)
      .single();

    if (profile?.kyc_status !== 'verified') {
      throw new Error("KYC verification required for withdrawals.");
    }

    if (!profile?.bank_account_no || !profile?.ifsc_code) {
      throw new Error("Bank account details not found. Please update your profile.");
    }

    const currentBalance = Number(profile?.wallet_balance || 0);

    if (currentBalance < amount) {
      throw new Error("Insufficient liquidity for this withdrawal.");
    }

    // Call Atomic RPC for withdrawal
    const { data: withdrawalId, error: rpcError } = await supabase.rpc('create_withdrawal_request', {
      p_user_id: user.id,
      p_amount: amount,
      p_description: description || "Wallet Withdrawal Request"
    });

    if (rpcError) {
      throw new Error(rpcError.message);
    }

    // 3. Notifications
    // To Investor
    await createNotification(
      user.id,
      "Withdrawal Requested 💸",
      `Your request for ₹${amount.toLocaleString('en-IN')} is being processed. Funds have been reserved.`,
      "info",
      "/investor/wallet"
    );

    // To Admins
    const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
    if (admins) {
      for (const admin of admins) {
        await createNotification(
          admin.id,
          "New Withdrawal Request ⚠️",
          `Investor ${user.email} requested ₹${amount.toLocaleString('en-IN')}.`,
          "info",
          "/admin?tab=withdrawals"
        );
      }
    }

    revalidatePath("/investor/wallet");
    revalidatePath("/investor");
    revalidatePath("/admin");
    
    // Fetch new balance for UI update
    const { data: newProfile } = await supabase.from('profiles').select('wallet_balance').eq('id', user.id).single();

    return { success: true, newBalance: newProfile?.wallet_balance, withdrawalId };
  });
