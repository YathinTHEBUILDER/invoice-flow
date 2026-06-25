"use server";

import { createAdminClient, createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const MAX_INVOICE_FILE_BYTES = 10 * 1024 * 1024;

const allowedInvoiceMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const invoiceUploadSchema = z.object({
  invoiceNumber: z.string().trim().min(3).max(60).regex(/^[A-Z0-9][A-Z0-9/_-]*$/i, "Invoice number can only contain letters, numbers, /, _ and -."),
  amount: z.coerce.number().positive().max(100000000, "Invoice amount is too high."),
  buyerName: z.string().trim().min(2).max(160),
  buyerGstin: z.string().trim().toUpperCase().regex(/^[0-9A-Z]{15}$/, "Enter a valid 15-character GSTIN."),
  dueDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid due date."),
  tenureDays: z.coerce.number().int().min(1).max(365),
});

function generateInvoiceNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `INV-${dateStr}-${rand}`;
}

function getSafeFileExtension(file: File) {
  const byType: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
  };

  return byType[file.type] || file.name.split(".").pop()?.toLowerCase() || "bin";
}

export async function uploadInvoiceAction(formData: FormData) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return { success: false, error: "Unauthorized. Please sign in again." };
  }

  const rawFile = formData.get("invoice_file");
  const invoiceFile = rawFile instanceof File ? rawFile : null;

  if (!invoiceFile || invoiceFile.size === 0) {
    return { success: false, error: "Invoice document is required." };
  }

  if (!allowedInvoiceMimeTypes.has(invoiceFile.type)) {
    return { success: false, error: "Only PDF, JPG, JPEG, or PNG invoice documents are allowed." };
  }

  if (invoiceFile.size > MAX_INVOICE_FILE_BYTES) {
    return { success: false, error: "Invoice document must be 10 MB or smaller." };
  }

  const payload = invoiceUploadSchema.safeParse({
    invoiceNumber: String(formData.get("invoice_number") || generateInvoiceNumber()).trim().toUpperCase(),
    amount: formData.get("amount"),
    buyerName: formData.get("buyer_name"),
    buyerGstin: formData.get("buyer_gstin"),
    dueDate: formData.get("due_date"),
    tenureDays: formData.get("tenure_days"),
  });

  if (!payload.success) {
    return { success: false, error: payload.error.issues[0]?.message || "Invalid invoice details." };
  }

  const dueDate = new Date(`${payload.data.dueDate}T00:00:00.000Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  if (Number.isNaN(dueDate.getTime()) || dueDate <= today) {
    return { success: false, error: "Due date must be a future date." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, kyc_status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, error: "Profile not found. Please refresh and try again." };
  }

  if (profile.role !== "msme") {
    return { success: false, error: "Only MSME accounts can upload invoices." };
  }

  if (profile.kyc_status !== "verified") {
    return { success: false, error: "KYC approval required before uploading invoices." };
  }

  const { data: settings } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "default_discount_rate")
    .maybeSingle();

  const discountRate = Number(settings?.value || 0.12);

  const { data: existingInvoice } = await supabase
    .from("invoices")
    .select("id")
    .eq("msme_id", user.id)
    .eq("invoice_number", payload.data.invoiceNumber)
    .maybeSingle();

  if (existingInvoice) {
    return { success: false, error: `Invoice number ${payload.data.invoiceNumber} has already been uploaded.` };
  }

  const fileExt = getSafeFileExtension(invoiceFile);
  const storagePath = `${user.id}/${payload.data.invoiceNumber}/${crypto.randomUUID()}.${fileExt}`;

  let storageClient = supabase;
  try {
    storageClient = await createAdminClient();
  } catch {
    // Fall back to the user-scoped client when the service role key is not available locally.
  }

  const { data: uploadData, error: uploadError } = await storageClient.storage
    .from("invoice-documents")
    .upload(storagePath, invoiceFile, {
      cacheControl: "3600",
      contentType: invoiceFile.type,
      upsert: false,
    });

  if (uploadError || !uploadData?.path) {
    console.error("Invoice storage upload error:", uploadError);
    return { success: false, error: uploadError?.message || "Failed to upload invoice document." };
  }

  const { data: insertedInvoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      msme_id: user.id,
      invoice_number: payload.data.invoiceNumber,
      amount: payload.data.amount,
      verified_amount: null,
      funded_amount: 0,
      discount_rate: discountRate,
      tenure_days: payload.data.tenureDays,
      buyer_name: payload.data.buyerName,
      buyer_gstin: payload.data.buyerGstin,
      due_date: payload.data.dueDate,
      status: "pending_verification",
      documents: {
        invoice_path: uploadData.path,
        invoice_file_name: invoiceFile.name,
        invoice_mime_type: invoiceFile.type,
        invoice_size_bytes: invoiceFile.size,
      },
    })
    .select()
    .single();

  if (invoiceError) {
    console.error("Invoice insert error:", invoiceError);
    try {
      await storageClient.storage.from("invoice-documents").remove([uploadData.path]);
    } catch (cleanupError) {
      console.error("Invoice storage cleanup error:", cleanupError);
    }
    return { success: false, error: invoiceError.message };
  }

  revalidatePath("/msme/invoices");
  revalidatePath("/msme");
  revalidatePath("/admin");

  return { success: true, data: insertedInvoice };
}
