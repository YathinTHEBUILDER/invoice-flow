"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";

export async function uploadInvoiceAction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { error: "Unauthorized" };

  // Strict Role & KYC Check
  const { data: profile } = await supabase
    .from("profiles")
    .select("kyc_status, role, company_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== 'msme') {
    return { error: "Only MSME accounts can upload invoices." };
  }

  if (profile?.kyc_status !== 'verified') {
    return { error: "KYC approval required before uploading invoices." };
  }

  const invoiceNumber = formData.get("invoice_number") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const buyerName = formData.get("buyer_name") as string;
  const buyerGstin = formData.get("buyer_gstin") as string;
  const dueDate = formData.get("due_date") as string;
  const tenureDays = parseInt(formData.get("tenure_days") as string);

  // Check for duplicate invoice number
  const { data: existing } = await supabase
    .from("invoices")
    .select("id")
    .eq("msme_id", user.id)
    .eq("invoice_number", invoiceNumber)
    .maybeSingle();

  if (existing) {
    return { error: `Invoice number ${invoiceNumber} has already been uploaded.` };
  }

  // Fetch default discount rate from settings
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'default_discount_rate')
    .single();
  
  const discountRate = Number(settings?.value || 0.12);

  const { data, error } = await supabase
    .from("invoices")
    .insert([
      {
        msme_id: user.id,
        invoice_number: invoiceNumber,
        amount: amount,
        discount_rate: discountRate,
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

  // Notify Admins
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
  if (admins) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Asset Uploaded 📄",
        `${profile.company_name} uploaded Invoice #${invoiceNumber} for verification.`,
        "info",
        "/admin?tab=invoices"
      );
    }
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

  // Notify Admins
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
  if (admins) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Support Ticket 🎫",
        `Ticket raised: ${subject} (${priority})`,
        "warning",
        "/admin?tab=disputes"
      );
    }
  }

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
    .select("kyc_status, kyc_notes, role")
    .eq("id", user.id)
    .single();

  // Fetch platform limit from settings or use default
  const { data: settings } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'default_credit_limit')
    .single();
  
  const platformLimit = Number(settings?.value || 5000000);

  return {
    totalSubmitted,
    underReview,
    funded,
    totalFundedAmount,
    pendingRepayments,
    totalOutstanding,
    kycStatus: profile?.kyc_status || 'not_started',
    kycNotes: profile?.kyc_notes,
    userRole: profile?.role,
    platformLimit
  };
}

export async function getRecentMSMEInvoices(limit = 5) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("msme_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Recent invoices fetch error:", error);
    return [];
  }

  return data;
}

/**
 * Submit Repayment Proof Action
 */
export async function submitRepaymentProofAction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { error: "Unauthorized" };

  const repaymentId = formData.get("repayment_id") as string;
  const utr = formData.get("utr") as string;
  const amountPaid = parseFloat(formData.get("amount_paid") as string);

  if (!repaymentId || !utr || isNaN(amountPaid)) {
    return { error: "Missing required repayment details (UTR/Amount)." };
  }

  const { error } = await supabase
    .from("repayments")
    .update({
      payment_reference: utr,
      amount_paid: amountPaid,
      payment_date: new Date().toISOString(),
      status: "paid", // Moving to paid status (admin will verify later)
      updated_at: new Date().toISOString()
    })
    .eq("id", repaymentId);

  if (error) return { error: error.message };

  // Notify Admins
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
  if (admins) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "Payment Settlement Submitted 💰",
        `UTR ${utr} submitted for verification. Amount: ${amountPaid}`,
        "success",
        "/admin"
      );
    }
  }

  revalidatePath("/msme/repayments");
  return { success: true };
}

/**
 * Raise Dispute Action
 */
export async function raiseDisputeAction(formData: FormData) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return { error: "Unauthorized" };

  const invoiceId = formData.get("invoice_id") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;

  if (!invoiceId || !subject || !message) {
    return { error: "Missing required dispute details." };
  }

  const { error } = await supabase
    .from("disputes")
    .insert([
      {
        invoice_id: invoiceId,
        raised_by: user.id,
        subject,
        message,
        status: "open"
      }
    ]);

  if (error) return { error: error.message };

  // Notify Admins
  const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
  if (admins) {
    for (const admin of admins) {
      await createNotification(
        admin.id,
        "New Dispute Raised ⚖️",
        `Dispute on Invoice #${invoiceId.split('-')[0].toUpperCase()}: ${subject}`,
        "error",
        "/admin?tab=disputes"
      );
    }
  }

  revalidatePath("/msme/invoices");
  return { success: true };
}
