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

  // 1. Fetch investments (Invoices funded by this investor)
  const { data: myInvoices } = await supabase
    .from('invoices')
    .select('*, repayments(*)')
    .eq('investor_id', user.id);

  const totalInvested = myInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const activeAssets = myInvoices?.filter(inv => inv.status === 'funded').length || 0;

  // 2. Fetch Repayment Data for Yields
  const { data: repayments } = await supabase
    .from('repayments')
    .select('*, invoices!inner(*)')
    .eq('invoices.investor_id', user.id);

  const totalReturns = repayments?.filter(r => r.status === 'paid').reduce((sum, r) => sum + (Number(r.amount_paid) - Number(r.invoices.amount)), 0) || 0;
  const pendingReturns = repayments?.filter(r => r.status === 'scheduled').reduce((sum, r) => sum + (Number(r.amount_due) - Number(r.invoices.amount)), 0) || 0;
  const receivedPayouts = repayments?.filter(r => r.status === 'paid').reduce((sum, r) => sum + Number(r.amount_paid), 0) || 0;

  // 3. Fetch Wallet Balance & KYC Status
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance, kyc_status')
    .eq('id', user.id)
    .single();

  return {
    totalInvested,
    activeAssets,
    totalReturns,
    pendingReturns,
    receivedPayouts,
    walletBalance: profile?.wallet_balance || 0,
    kycStatus: profile?.kyc_status || 'not_started',
    expectedARR: 14.5
  };
}

/**
 * Fetch Detailed Portfolio
 */
export async function getInvestorPortfolio() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profiles:msme_id (company_name),
      repayments (*)
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
    .eq('status', 'approved')
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
  .schema(z.object({ invoiceId: z.string().uuid() }))
  .action(async ({ parsedInput: { invoiceId } }) => {
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

    // 2. Check if invoice is still available
    const { data: invoice } = await supabase
      .from('invoices')
      .select('amount, status, msme_id, invoice_number, discount_rate, tenure_days')
      .eq('id', invoiceId)
      .single();

    if (!invoice || invoice.status !== 'approved') {
      throw new Error("Asset no longer available for liquidity.");
    }

    if ((profile?.wallet_balance || 0) < Number(invoice.amount)) {
      throw new Error("Insufficient wallet liquidity to fund this asset.");
    }

    // 3. Perform atomic update (In RPC for production)
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ 
        status: 'funded', 
        investor_id: user.id,
        updated_at: new Date().toISOString() 
      })
      .eq('id', invoiceId);

    if (updateError) throw new Error(updateError.message);

    await supabase
      .from('profiles')
      .update({ 
        wallet_balance: (profile?.wallet_balance || 0) - Number(invoice.amount) 
      })
      .eq('id', user.id);

    // 4. Create Transaction Log
    await supabase.from('transactions').insert({
      user_id: user.id,
      amount: -Number(invoice.amount),
      type: 'investment',
      description: `Funded Invoice #${invoice.invoice_number}`,
      reference_id: invoiceId
    });

    // 5. Create Repayment Schedule (Principal + Yield)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (invoice.tenure_days || 45));
    
    // Simple yield calculation for example
    const yieldAmount = Number(invoice.amount) * ((invoice.discount_rate || 0.12) / 365 * (invoice.tenure_days || 45));
    
    await supabase.from('repayments').insert({
      invoice_id: invoiceId,
      amount_due: Number(invoice.amount) + yieldAmount,
      due_date: dueDate.toISOString(),
      status: 'scheduled'
    });

    // 6. Notifications
    await createNotification(
      user.id,
      "Investment Successful! 🚀",
      `You have funded Invoice #${invoice.invoice_number}. Target Yield: ${((yieldAmount/Number(invoice.amount))*100).toFixed(2)}%`,
      "success",
      "/investor"
    );

    revalidatePath("/investor");
    revalidatePath("/msme");
    return { success: true };
  });
