"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { db } from "@/db";
import { users, auditLogs, fraudFlags, disputes, invoices, fundingRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

// ----------------------------------------------------------------------
// SECURITY UTILITY
// ----------------------------------------------------------------------

async function ensureAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized: No session found.");

  // Hard verification against Database
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });

  if (userRecord?.role !== "admin") {
    throw new Error("Forbidden: High-level admin privileges required.");
  }

  return user;
}

async function logAdminAction(adminId: string, action: string, entityType: string, entityId: string, oldData?: any, newData?: any) {
  await db.insert(auditLogs).values({
    adminId,
    action,
    entityType,
    entityId,
    oldData: oldData ? JSON.stringify(oldData) : null,
    newData: newData ? JSON.stringify(newData) : null,
  });
}

// ----------------------------------------------------------------------
// SCHEMAS
// ----------------------------------------------------------------------

const userStatusSchema = z.object({
  userId: z.string().uuid(),
  isSuspended: z.boolean(),
  reason: z.string().optional(),
});

const fraudFlagSchema = z.object({
  entityType: z.enum(["user", "invoice"]),
  entityId: z.string().uuid(),
  reason: z.string().min(5),
  severity: z.enum(["low", "medium", "high", "critical"]),
});

// ----------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------

export const toggleUserSuspensionAction = actionClient
  .schema(userStatusSchema)
  .action(async ({ parsedInput: { userId, isSuspended, reason } }) => {
    try {
      const admin = await ensureAdmin();

      const oldUser = await db.query.users.findFirst({ where: eq(users.id, userId) });

      await db.update(users)
        .set({ isSuspended, suspensionReason: isSuspended ? reason : null })
        .where(eq(users.id, userId));

      await logAdminAction(
        admin.id,
        isSuspended ? "suspend_user" : "activate_user",
        "users",
        userId,
        { isSuspended: oldUser?.isSuspended },
        { isSuspended, reason }
      );

      revalidatePath("/dashboard/admin/users");
      return { success: true, message: `User ${isSuspended ? 'suspended' : 'activated'} successfully.` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const createFraudFlagAction = actionClient
  .schema(fraudFlagSchema)
  .action(async ({ parsedInput: { entityType, entityId, reason, severity } }) => {
    try {
      const admin = await ensureAdmin();

      await db.insert(fraudFlags).values({
        entityType,
        entityId,
        flaggedBy: admin.id,
        reason,
        severity,
        status: "active",
      });

      await logAdminAction(admin.id, "flag_fraud", entityType, entityId, null, { reason, severity });

      revalidatePath("/dashboard/admin/fraud");
      return { success: true, message: "Fraud flag raised successfully." };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const resolveDisputeAction = actionClient
  .schema(z.object({ disputeId: z.string().uuid() }))
  .action(async ({ parsedInput: { disputeId } }) => {
    try {
      const admin = await ensureAdmin();

      await db.update(disputes)
        .set({ status: "resolved", resolvedBy: admin.id })
        .where(eq(disputes.id, disputeId));

      await logAdminAction(admin.id, "resolve_dispute", "disputes", disputeId);

      revalidatePath("/dashboard/admin/disputes");
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const verifyInvoiceAction = actionClient
  .schema(z.object({ 
    invoiceId: z.string().uuid(), 
    status: z.enum(["approved", "rejected"]),
    rejectionReason: z.string().optional() 
  }))
  .action(async ({ parsedInput: { invoiceId, status, rejectionReason } }) => {
    try {
      const admin = await ensureAdmin();

      const [updatedInvoice] = await db.update(invoices)
        .set({ 
          status, 
          verifiedBy: admin.id, 
          updatedAt: new Date() 
        })
        .where(eq(invoices.id, invoiceId))
        .returning();

      // If approved, make the funding request visible (if we have a status for that, currently it's just 'open')
      // In a real system, we might have 'draft' -> 'open'
      
      await logAdminAction(admin.id, `verify_invoice_${status}`, "invoices", invoiceId, null, { status, rejectionReason });

      revalidatePath("/dashboard/admin/invoices");
      return { success: true, message: `Invoice ${status} successfully.` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
