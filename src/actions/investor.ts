"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { db } from "@/db";
import { 
  users, 
  invoices, 
  fundingRequests, 
  investments, 
  transactions, 
  activityLogs, 
  kycDocuments,
  notifications
} from "@/db/schema";
import { eq, and, desc, sum, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

// ----------------------------------------------------------------------
// SCHEMAS
// ----------------------------------------------------------------------

const walletOperationSchema = z.object({
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  type: z.enum(["deposit", "withdrawal"]),
});

const investmentSchema = z.object({
  fundingRequestId: z.string().uuid(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Investment amount must be a positive number",
  }),
});

// ----------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------

export const handleWalletOperationAction = actionClient
  .schema(walletOperationSchema)
  .action(async ({ parsedInput: { amount, type } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const numericAmount = parseFloat(amount);

      await db.transaction(async (tx) => {
        const userRecord = await tx.query.users.findFirst({
          where: eq(users.id, user.id),
        });

        if (!userRecord) throw new Error("User record not found");

        if (type === "withdrawal") {
          const currentBalance = parseFloat(userRecord.walletBalance);
          if (currentBalance < numericAmount) {
            throw new Error("Insufficient funds for withdrawal");
          }
          
          await tx.update(users)
            .set({ walletBalance: sql`${users.walletBalance} - ${amount}` })
            .where(eq(users.id, user.id));
        } else {
          await tx.update(users)
            .set({ walletBalance: sql`${users.walletBalance} + ${amount}` })
            .where(eq(users.id, user.id));
        }

        // Record Transaction
        await tx.insert(transactions).values({
          userId: user.id,
          type: type as any,
          amount: amount,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} to wallet`,
        });

        // Activity Log
        await tx.insert(activityLogs).values({
          userId: user.id,
          action: `wallet_${type}`,
          details: `${type} of ₹${amount} processed.`,
        });
      });

      revalidatePath("/dashboard/investor/wallet");
      revalidatePath("/dashboard/investor");
      return { success: true, error: null };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const investInInvoiceAction = actionClient
  .schema(investmentSchema)
  .action(async ({ parsedInput: { fundingRequestId, amount } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Unauthorized");

      const numericAmount = parseFloat(amount);

      const result = await db.transaction(async (tx) => {
        // 1. Fetch User and verify role/balance
        const userRecord = await tx.query.users.findFirst({
          where: eq(users.id, user.id),
        });

        if (!userRecord || userRecord.role !== "investor") throw new Error("Only investors can participate.");
        if (parseFloat(userRecord.walletBalance) < numericAmount) throw new Error("Insufficient wallet balance.");

        // 2. Fetch Funding Request and verify status/limit
        const request = await tx.query.fundingRequests.findFirst({
          where: eq(fundingRequests.id, fundingRequestId),
          with: {
            invoice: true,
          }
        });

        if (!request || request.status !== "open") throw new Error("Funding request is no longer open.");

        const totalInvested = await tx
          .select({ sum: sum(investments.amount) })
          .from(investments)
          .where(eq(investments.fundingRequestId, fundingRequestId));
        
        const currentTotal = parseFloat(totalInvested[0]?.sum || "0");
        const remainingLimit = parseFloat(request.requestedAmount) - currentTotal;

        if (numericAmount > remainingLimit) {
          throw new Error(`Exceeds remaining limit. Max allowed: ₹${remainingLimit.toFixed(2)}`);
        }

        // 3. Process Investment
        const [inv] = await tx.insert(investments).values({
          fundingRequestId,
          investorId: user.id,
          amount,
          status: "active",
        }).returning();

        // 4. Update Wallet Balance
        await tx.update(users)
          .set({ walletBalance: sql`${users.walletBalance} - ${amount}` })
          .where(eq(users.id, user.id));

        // 5. Record Transaction
        await tx.insert(transactions).values({
          userId: user.id,
          type: "investment",
          amount,
          description: `Investment in Invoice #${request.invoice.invoiceNumber}`,
          referenceId: inv.id,
        });

        // 6. Check if fully funded and update status
        if (currentTotal + numericAmount >= parseFloat(request.requestedAmount)) {
          await tx.update(fundingRequests)
            .set({ status: "filled" })
            .where(eq(fundingRequests.id, fundingRequestId));
          
          await tx.update(invoices)
            .set({ status: "funded" })
            .where(eq(invoices.id, request.invoiceId));
          
          // Notify MSME
          await tx.insert(notifications).values({
            userId: request.invoice.msmeId,
            title: "Invoice Fully Funded!",
            message: `Your invoice #${request.invoice.invoiceNumber} has been fully funded and is moving to disbursement.`,
            type: "funding",
            link: `/dashboard/msme/invoices/${request.invoiceId}`,
          });
        }

        // 7. Activity Log
        await tx.insert(activityLogs).values({
          userId: user.id,
          action: "invest",
          details: `Invested ₹${amount} in Invoice #${request.invoice.invoiceNumber}`,
        });

        return { success: true, error: null };
      });

      revalidatePath("/dashboard/investor/marketplace");
      revalidatePath("/dashboard/investor");
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export async function getInvestorAnalytics(userId: string) {
  try {
    const totalInvested = await db.select({ value: sum(investments.amount) })
      .from(investments)
      .where(eq(investments.investorId, userId));
    
    const activeInvestmentsCount = await db.select({ value: count() })
      .from(investments)
      .where(and(eq(investments.investorId, userId), eq(investments.status, "active")));
    
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    // Calculate expected returns based on yield rates
    // This is a simplified calculation for the dashboard
    const yieldStats = await db
      .select({ 
        amount: investments.amount, 
        rate: fundingRequests.yieldRate 
      })
      .from(investments)
      .innerJoin(fundingRequests, eq(investments.fundingRequestId, fundingRequests.id))
      .where(and(eq(investments.investorId, userId), eq(investments.status, "active")));

    const expectedReturns = yieldStats.reduce((sum, item) => {
      const amt = parseFloat(item.amount);
      const rate = parseFloat(item.rate) / 100;
      // Simplified: Assume 90 days tenure for display purposes if not explicit
      return sum + (amt * rate * (90/365));
    }, 0);

    return {
      totalInvested: parseFloat(totalInvested[0]?.value || "0"),
      activeInvestments: activeInvestmentsCount[0]?.value || 0,
      walletBalance: parseFloat(userRecord?.walletBalance || "0"),
      expectedReturns: expectedReturns,
      kycStatus: userRecord?.kycStatus || "pending",
    };
  } catch (error) {
    console.error("Error fetching investor analytics:", error);
    return null;
  }
}
