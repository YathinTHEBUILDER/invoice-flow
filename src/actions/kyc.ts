"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { db } from "@/db";
import { kycDocuments, users, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const actionClient = createSafeActionClient();

// ----------------------------------------------------------------------
// SCHEMAS
// ----------------------------------------------------------------------

const submitKycSchema = z.object({
  documentType: z.enum(["pan", "gstin", "udyam", "bank_statement"]),
  filePath: z.string().min(1, { message: "File path is required" }),
});


const reviewKycSchema = z.object({
  documentId: z.string().uuid(),
  userId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  rejectionReason: z.string().optional(),
});

// ----------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------

export const submitKycDocumentAction = actionClient
  .schema(submitKycSchema)
  .action(async ({ parsedInput: { documentType, filePath } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      // Check if document already exists and is pending or approved
      const existingDoc = await db.query.kycDocuments.findFirst({
        where: and(
          eq(kycDocuments.userId, user.id),
          eq(kycDocuments.documentType, documentType)
        )
      });

      if (existingDoc && (existingDoc.status === "pending" || existingDoc.status === "approved")) {
        return { success: false, error: "Document already submitted and is pending or approved." };
      }

      // Insert new KYC document
      await db.insert(kycDocuments).values({
        userId: user.id,
        documentType,
        fileUrl: filePath,
        status: "pending",
      });


      // Update user status if it's currently rejected or nothing
      await db.update(users)
        .set({ kycStatus: "pending" })
        .where(eq(users.id, user.id));

      return { success: true, message: "Document submitted successfully for verification." };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const reviewKycDocumentAction = actionClient
  .schema(reviewKycSchema)
  .action(async ({ parsedInput: { documentId, userId, status, rejectionReason } }) => {
    try {
      const supabase = await createClient();
      const { data: { user: adminUser } } = await supabase.auth.getUser();

      if (!adminUser) throw new Error("Unauthorized");

      // Verify admin role securely via DB
      const adminRecord = await db.query.users.findFirst({
        where: eq(users.id, adminUser.id)
      });

      if (adminRecord?.role !== "admin") {
        throw new Error("Forbidden: Admin access required");
      }

      // Update document
      await db.update(kycDocuments)
        .set({
          status,
          rejectionReason: status === "rejected" ? rejectionReason : null,
          verifiedBy: adminUser.id,
          verifiedAt: new Date(),
        })
        .where(eq(kycDocuments.id, documentId));

      // Re-evaluate overall user KYC status
      const userDocs = await db.query.kycDocuments.findMany({
        where: eq(kycDocuments.userId, userId)
      });

      // Simple logic: if any are rejected, status is rejected.
      // If all required (PAN, GSTIN/Udyam, Bank) are approved, status is approved.
      // Else pending.
      const hasRejected = userDocs.some(d => d.status === "rejected");
      const hasPending = userDocs.some(d => d.status === "pending");
      
      let overallStatus: "pending" | "approved" | "rejected" = "pending";
      
      if (hasRejected) {
        overallStatus = "rejected";
      } else if (!hasPending && userDocs.length >= 3) {
        // Assuming at least 3 docs means fully submitted and all are approved
        overallStatus = "approved";
      }

      await db.update(users)
        .set({ kycStatus: overallStatus })
        .where(eq(users.id, userId));

      // Audit Log
      await db.insert(auditLogs).values({
        adminId: adminUser.id,
        action: `verify_kyc_doc_${status}`,
        entityType: "kyc_documents",
        entityId: documentId,
        newData: JSON.stringify({ status, overallStatus }),
      });

      return { success: true, message: `Document ${status} successfully.` };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const getSignedKycUrlAction = actionClient
  .schema(z.object({ filePath: z.string() }))
  .action(async ({ parsedInput: { filePath } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      // Verify admin role
      const adminRecord = await db.query.users.findFirst({
        where: eq(users.id, user.id)
      });

      if (adminRecord?.role !== "admin") {
        throw new Error("Forbidden: Admin access required");
      }

      const { data, error } = await supabase.storage
        .from("kyc_documents")
        .createSignedUrl(filePath, 60);

      if (error) throw error;
      return { success: true, signedUrl: data.signedUrl };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

