"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

export async function uploadInvoiceAction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { error: "Unauthorized" };

  // Strict KYC Check
  const { data: profile } = await supabase
    .from("profiles")
    .select("kyc_status")
    .eq("id", user.id)
    .single();

  if (profile?.kyc_status !== 'verified') {
    return { error: "KYC approval required before uploading invoices." };
  }

  const invoiceNumber = formData.get("invoice_number") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const buyerName = formData.get("buyer_name") as string;
  const buyerGstin = formData.get("buyer_gstin") as string;
  const dueDate = formData.get("due_date") as string;
  const tenureDays = parseInt(formData.get("tenure_days") as string);

  const { data, error } = await supabase
    .from("invoices")
    .insert([
      {
        msme_id: user.id,
        invoice_number: invoiceNumber,
        amount: amount,
        discount_rate: 0.12,
        tenure_days: tenureDays,
        buyer_name: buyerName,
        buyer_gstin: buyerGstin,
        due_date: dueDate,
        status: "pending_verification"
      }
    ])
    .select();

  if (error) {
    console.error("Invoice upload error:", error);
    return { error: error.message };
  }

  revalidatePath("/msme/invoices");
  return { success: true, data };
}

export async function submitKYCAction(formData: FormData, documentUrls: Record<string, string>) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { error: "Unauthorized" };

  const gstin = formData.get("gstin") as string;
  const pan = formData.get("pan") as string;
  const bankAccountNo = formData.get("bank_account_no") as string;
  const ifscCode = formData.get("ifsc_code") as string;
  const companyAddress = formData.get("company_address") as string;

  // 1. Update Profile
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      gstin,
      pan,
      bank_account_no: bankAccountNo,
      ifsc_code: ifscCode,
      company_address: companyAddress,
      kyc_status: "pending",
      kyc_notes: null // Clear previous rejection notes on resubmission
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  // 2. Create/Update KYC Request
  const { error: kycError } = await supabase
    .from("kyc_requests")
    .upsert({
      user_id: user.id,
      status: "pending",
      documents: documentUrls,
      notes: "Identity and business documents submitted for review.",
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }); // Assuming unique constraint on user_id for kyc_requests

  if (kycError) return { error: kycError.message };

  revalidatePath("/msme/kyc");
  return { success: true };
}

export async function createSupportTicketAction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { error: "Unauthorized" };

  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const category = formData.get("category") as string;
  const priority = formData.get("priority") as string;

  const { error } = await supabase
    .from("support_tickets")
    .insert([
      {
        user_id: user.id,
        subject,
        message,
        category,
        priority,
        status: "open"
      }
    ]);

  if (error) return { error: error.message };

  revalidatePath("/msme/support");
  return { success: true };
}

export async function getMSMEStats() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return null;

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("*")
    .eq("msme_id", user.id);

  if (invoicesError || !invoices) return null;

  const totalSubmitted = invoices.length;
  const underReview = invoices.filter(i => i.status === "pending_verification").length;
  const funded = invoices.filter(i => i.status === "funded").length;
  const totalFundedAmount = invoices.filter(i => i.status === "funded").reduce((sum, i) => sum + Number(i.amount), 0);
  
  // Repayments
  const { data: repayments, error: repaymentsError } = await supabase
    .from("repayments")
    .select("*, invoices!inner(*)")
    .eq("invoices.msme_id", user.id);

  if (repaymentsError) {
    console.error("Repayments fetch error:", repaymentsError);
  }

  const safeRepayments = repayments || [];
  const pendingRepayments = safeRepayments.filter(r => r.status === "scheduled").length;
  const totalOutstanding = safeRepayments.filter(r => r.status === "scheduled").reduce((sum, r) => sum + Number(r.amount_due), 0);

  const { data: profile } = await supabase
    .from("profiles")
    .select("kyc_status, kyc_notes")
    .eq("id", user.id)
    .single();

  return {
    totalSubmitted,
    underReview,
    funded,
    totalFundedAmount,
    pendingRepayments,
    totalOutstanding,
    kycStatus: profile?.kyc_status || 'not_started',
    kycNotes: profile?.kyc_notes
  };
}
