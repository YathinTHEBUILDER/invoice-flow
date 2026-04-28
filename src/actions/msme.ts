"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { db } from "@/db";
import { invoices, fundingRequests, repayments, transactions, activityLogs, users, disputes, preClosureRequests, notifications, kycDocuments } from "@/db/schema";
import { eq, and, desc, sum, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

// ----------------------------------------------------------------------
// SCHEMAS
// ----------------------------------------------------------------------

const uploadInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Invalid amount"),
  dueDate: z.string().min(1, "Due date is required"),
  filePath: z.string().min(1, "Invoice file is required"),
});

const requestFinancingSchema = z.object({
  invoiceId: z.string().uuid(),
  requestedAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, "Invalid amount"),
  yieldRate: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, "Invalid yield rate"),
  fundingDeadline: z.string().min(1, "Funding deadline is required"),
});

const repayInvoiceSchema = z.object({
  repaymentId: z.string().uuid(),
});

const preClosureRequestSchema = z.object({
  fundingRequestId: z.string().uuid(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

const disputeSchema = z.object({
  referenceId: z.string().uuid().optional(),
  title: z.string().min(5, "Title too short"),
  description: z.string().min(20, "Description too short"),
  type: z.enum(["payment", "invoice", "kyc", "technical", "other"]),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name required"),
  companyName: z.string().min(1, "Company name required"),
});

// ----------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------

export const uploadInvoiceAction = actionClient
  .schema(uploadInvoiceSchema)
  .action(async ({ parsedInput: { invoiceNumber, amount, dueDate, filePath } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // Verify user is MSME and KYC approved
      const userRecord = await db.query.users.findFirst({ where: eq(users.id, user.id) });
      if (userRecord?.role !== "msme") throw new Error("Only MSMEs can upload invoices");
      if (userRecord?.kycStatus !== "approved") throw new Error("KYC must be approved to upload invoices");

      const [newInvoice] = await db.insert(invoices).values({
        msmeId: user.id,
        invoiceNumber,
        amount,
        dueDate: new Date(dueDate),
        fileUrl: filePath,
        status: "pending_verification",
      }).returning();

      await db.insert(activityLogs).values({
        userId: user.id,
        action: "upload_invoice",
        details: `Uploaded invoice ${invoiceNumber} for ₹${amount}`,
      });

      revalidatePath("/dashboard/msme/invoices");
      return { success: true, data: newInvoice, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const requestFinancingAction = actionClient
  .schema(requestFinancingSchema)
  .action(async ({ parsedInput: { invoiceId, requestedAmount, yieldRate, fundingDeadline } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      // Check invoice ownership and status
      const invoice = await db.query.invoices.findFirst({
        where: and(eq(invoices.id, invoiceId), eq(invoices.msmeId, user.id))
      });

      if (!invoice) throw new Error("Invoice not found");
      if (invoice.status !== "approved") throw new Error("Invoice must be approved by admin before financing");

      // Check if already requested
      const existingRequest = await db.query.fundingRequests.findFirst({
        where: eq(fundingRequests.invoiceId, invoiceId)
      });
      if (existingRequest) throw new Error("Financing already requested for this invoice");

      const [request] = await db.insert(fundingRequests).values({
        invoiceId,
        requestedAmount,
        yieldRate,
        fundingDeadline: new Date(fundingDeadline),
        status: "open",
      }).returning();

      await db.insert(activityLogs).values({
        userId: user.id,
        action: "request_financing",
        details: `Requested ₹${requestedAmount} for invoice ${invoice.invoiceNumber}`,
      });

      revalidatePath("/dashboard/msme/financing");
      return { success: true, data: request, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const repayInvoiceAction = actionClient
  .schema(repayInvoiceSchema)
  .action(async ({ parsedInput: { repaymentId } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const repayment = await db.query.repayments.findFirst({
        where: eq(repayments.id, repaymentId),
        with: {
          fundingRequest: {
            with: {
              invoice: true
            }
          }
        }
      });

      if (!repayment) throw new Error("Repayment schedule not found");
      // @ts-ignore - Drizzle types might be tricky with relations if not defined in schema
      if (repayment.fundingRequest.invoice.msmeId !== user.id) throw new Error("Unauthorized");
      if (repayment.status === "completed") throw new Error("Already repaid");

      // Check wallet balance
      const userRecord = await db.query.users.findFirst({ where: eq(users.id, user.id) });
      const balance = parseFloat(userRecord?.walletBalance || "0");
      const amountToPay = parseFloat(repayment.amount);

      if (balance < amountToPay) throw new Error("Insufficient wallet balance. Please top up.");

      // Transactional update
      await db.transaction(async (tx) => {
        // Deduct from wallet
        await tx.update(users)
          .set({ walletBalance: (balance - amountToPay).toString() })
          .where(eq(users.id, user.id));

        // Mark repayment as completed
        await tx.update(repayments)
          .set({ status: "completed", paidAt: new Date() })
          .where(eq(repayments.id, repaymentId));

        // Create transaction record
        await tx.insert(transactions).values({
          userId: user.id,
          type: "repayment",
          amount: repayment.amount,
          description: `Repayment for Funding Request ${repayment.fundingRequestId}`,
          referenceId: repayment.id,
        });

        // Add activity log
        await tx.insert(activityLogs).values({
          userId: user.id,
          action: "repay_invoice",
          details: `Repaid ₹${repayment.amount} for funding request ${repayment.fundingRequestId}`,
        });
      });

      revalidatePath("/dashboard/msme/repayments");
      return { success: true, message: "Repayment successful", error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const requestPreClosureAction = actionClient
  .schema(preClosureRequestSchema)
  .action(async ({ parsedInput: { fundingRequestId, reason } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      await db.insert(preClosureRequests).values({
        fundingRequestId,
        requestedBy: user.id,
        reason,
        status: "pending",
      });

      await db.insert(notifications).values({
        userId: user.id,
        title: "Pre-closure Request Submitted",
        message: "Your request for early repayment is being reviewed by admin.",
        type: "system",
      });

      revalidatePath("/dashboard/msme/financing");
      return { success: true, message: "Pre-closure request submitted", error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const raiseDisputeAction = actionClient
  .schema(disputeSchema)
  .action(async ({ parsedInput: { referenceId, title, description, type } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      await db.insert(disputes).values({
        userId: user.id,
        referenceId: referenceId || user.id, // Fallback if no specific ref
        title,
        description,
        type,
        status: "open",
      });

      revalidatePath("/dashboard/msme/support");
      revalidatePath("/dashboard/investor/support");
      return { success: true, message: "Dispute raised successfully", error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const updateProfileAction = actionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput: { fullName, companyName } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      await db.update(users)
        .set({ fullName, companyName })
        .where(eq(users.id, user.id));

      await db.insert(activityLogs).values({
        userId: user.id,
        action: "update_profile",
        details: "Updated profile information",
      });

      revalidatePath("/dashboard/msme/settings");
      return { success: true, message: "Profile updated", error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export async function getMSMEKycDocuments(userId: string) {
  try {
    return await db.query.kycDocuments.findMany({
      where: eq(kycDocuments.userId, userId),
    });
  } catch (error) {
    console.error("Error fetching KYC documents:", error);
    return [];
  }
}

export async function getMSMEAnalytics(userId: string) {
  try {
    const totalFunded = await db.select({ value: sum(invoices.amount) })
      .from(invoices)
      .where(and(eq(invoices.msmeId, userId), eq(invoices.status, "funded")));

    const activeInvoicesCount = await db.select({ value: count() })
      .from(invoices)
      .where(and(eq(invoices.msmeId, userId), eq(invoices.status, "approved")));

    const repaidCount = await db.select({ value: count() })
      .from(invoices)
      .where(and(eq(invoices.msmeId, userId), eq(invoices.status, "repaid")));

    const pendingRepayments = await db.select({ value: sum(repayments.amount) })
      .from(repayments)
      .innerJoin(fundingRequests, eq(repayments.fundingRequestId, fundingRequests.id))
      .innerJoin(invoices, eq(fundingRequests.invoiceId, invoices.id))
      .where(and(eq(invoices.msmeId, userId), eq(repayments.status, "pending")));

    return {
      totalFunded: totalFunded[0]?.value || "0.00",
      activeInvoices: activeInvoicesCount[0]?.value || 0,
      repaidSuccessfully: repaidCount[0]?.value || 0,
      pendingRepayments: pendingRepayments[0]?.value || "0.00",
    };
  } catch (error) {
    console.error("Error fetching MSME analytics:", error);
    return null;
  }
}
