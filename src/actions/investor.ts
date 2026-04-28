"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { db } from "@/db";
import { users, auditLogs, investments, fundingRequests, transactions } from "@/db/schema";
import { eq, sum, sql, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();

const updateProfileSchema = z.object({
  fullName: z.string().min(2),
  panNumber: z.string(),
  aadhaarNumber: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  bankName: z.string(),
  accountNumber: z.string(),
  ifscCode: z.string(),
  accountHolderName: z.string(),
  nomineeName: z.string().optional(),
  nomineeRelation: z.string().optional(),
});

const investSchema = z.object({
  fundingRequestId: z.string().uuid(),
  amount: z.string(),
});

export const updateInvestorProfileAction = actionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      await db.update(users)
        .set({
          fullName: parsedInput.fullName,
          panNumber: parsedInput.panNumber,
          aadhaarNumber: parsedInput.aadhaarNumber,
          phoneNumber: parsedInput.phoneNumber,
          address: parsedInput.address,
          city: parsedInput.city,
          state: parsedInput.state,
          pincode: parsedInput.pincode,
          bankName: parsedInput.bankName,
          accountNumber: parsedInput.accountNumber,
          ifscCode: parsedInput.ifscCode,
          accountHolderName: parsedInput.accountHolderName,
          nomineeName: parsedInput.nomineeName || null,
          nomineeRelation: parsedInput.nomineeRelation || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      revalidatePath("/dashboard/investor/kyc");
      return { success: true, message: "Profile updated successfully" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const investInInvoiceAction = actionClient
  .schema(investSchema)
  .action(async ({ parsedInput: { fundingRequestId, amount } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      const investmentAmount = parseFloat(amount);
      if (isNaN(investmentAmount) || investmentAmount < 1000) {
        throw new Error("Minimum investment amount is ₹1,000");
      }

      // 1. Get user record and check KYC status
      const userRecord = await db.query.users.findFirst({
        where: eq(users.id, user.id)
      });

      if (!userRecord || userRecord.kycStatus !== "approved") {
        throw new Error("Your KYC must be approved before you can invest.");
      }

      // 2. Check wallet balance
      if (parseFloat(userRecord.walletBalance) < investmentAmount) {
        throw new Error("Insufficient wallet balance. Please add funds.");
      }

      // 3. Get funding request and check remaining limit
      const request = await db.query.fundingRequests.findFirst({
        where: eq(fundingRequests.id, fundingRequestId)
      });

      if (!request || request.status !== "open") {
        throw new Error("This funding request is no longer open for investment.");
      }

      const totalInvested = await db
        .select({ sum: sum(investments.amount) })
        .from(investments)
        .where(eq(investments.fundingRequestId, fundingRequestId));
      
      const currentSum = parseFloat(totalInvested[0]?.sum || "0");
      const requestedAmt = parseFloat(request.requestedAmount);
      const remainingLimit = requestedAmt - currentSum;

      if (investmentAmount > remainingLimit) {
        throw new Error(`Investment exceeds remaining limit of ${remainingLimit.toLocaleString()}`);
      }

      // 4. Atomic Transaction: Update Wallet, Record Investment, Record Transaction, Update Request Status if filled
      await db.transaction(async (tx) => {
        // Deduct from wallet
        await tx.update(users)
          .set({ 
            walletBalance: sql`${users.walletBalance} - ${amount}` 
          })
          .where(eq(users.id, user.id));

        // Create investment record
        await tx.insert(investments).values({
          investorId: user.id,
          fundingRequestId: fundingRequestId,
          amount: amount,
          status: "active",
        });

        // Record in ledger
        await tx.insert(transactions).values({
          userId: user.id,
          type: "investment",
          amount: amount,
          description: `Investment in Funding Request ${fundingRequestId}`,
          referenceId: fundingRequestId,
        });

        // Check if now fully funded
        const newTotal = currentSum + investmentAmount;
        if (newTotal >= requestedAmt) {
          await tx.update(fundingRequests)
            .set({ status: "filled" })
            .where(eq(fundingRequests.id, fundingRequestId));
        }
      });

      revalidatePath("/dashboard/investor/marketplace");
      revalidatePath(`/dashboard/investor/marketplace/${fundingRequestId}`);
      revalidatePath("/dashboard/investor/portfolio");
      revalidatePath("/dashboard/investor/wallet");

      return { success: true, message: "Investment successful!" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const getInvestorAnalytics = async (userId: string) => {
  try {
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, userId)
    });

    if (!userRecord) return null;

    const activeInvestments = await db.query.investments.findMany({
      where: and(eq(investments.investorId, userId), eq(investments.status, 'active')),
      with: {
        fundingRequest: {
          with: {
            invoice: true
          }
        }
      }
    });

    const totalInvested = activeInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    
    // Expected returns calculation
    const expectedReturns = activeInvestments.reduce((sum, inv) => {
      const principal = parseFloat(inv.amount);
      const rate = parseFloat(inv.fundingRequest.yieldRate) / 100;
      const now = new Date();
      const due = new Date(inv.fundingRequest.invoice.dueDate);
      const tenureDays = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      return sum + (principal * rate * (tenureDays / 365));
    }, 0);

    const totalReceivedTx = await db.query.transactions.findMany({
      where: and(eq(transactions.userId, userId), eq(transactions.type, 'repayment'))
    });
    const totalReceived = totalReceivedTx.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

    // Overdue check (default exposure)
    const overdueInvestments = activeInvestments.filter(inv => {
      const due = new Date(inv.fundingRequest.invoice.dueDate);
      return due < new Date();
    });
    const defaultExposure = activeInvestments.length > 0 
      ? (overdueInvestments.length / activeInvestments.length) * 100 
      : 0;

    return {
      totalInvested,
      activeInvestments: activeInvestments.length,
      walletBalance: parseFloat(userRecord.walletBalance),
      expectedReturns,
      totalReceived,
      defaultExposure,
      kycStatus: userRecord.kycStatus,
    };
  } catch (error) {
    console.error("Error fetching investor analytics:", error);
    return null;
  }
};

export const handleWalletOperationAction = actionClient
  .schema(z.object({
    amount: z.string(),
    type: z.enum(["deposit", "withdrawal"]),
  }))
  .action(async ({ parsedInput: { amount, type } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      const operationAmount = parseFloat(amount);
      if (isNaN(operationAmount) || operationAmount <= 0) {
        throw new Error("Invalid amount");
      }

      await db.transaction(async (tx) => {
        const userRecord = await tx.query.users.findFirst({
          where: eq(users.id, user.id)
        });

        if (type === "withdrawal") {
          if (!userRecord || parseFloat(userRecord.walletBalance) < operationAmount) {
            throw new Error("Insufficient balance for withdrawal.");
          }
          
          await tx.update(users)
            .set({ 
              walletBalance: sql`${users.walletBalance} - ${amount}` 
            })
            .where(eq(users.id, user.id));
        } else {
          await tx.update(users)
            .set({ 
              walletBalance: sql`${users.walletBalance} + ${amount}` 
            })
            .where(eq(users.id, user.id));
        }

        await tx.insert(transactions).values({
          userId: user.id,
          type: type,
          amount: amount,
          description: `${type.charAt(0).toUpperCase() + type.slice(1)} of funds`,
        });
      });

      revalidatePath("/dashboard/investor/wallet");
      return { success: true, message: "Transaction successful" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });
