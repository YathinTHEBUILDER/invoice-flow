"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/lib/server";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

import { revalidatePath } from "next/cache";

const actionClient = createSafeActionClient();


const walletSchema = z.object({
  amount: z.string(),
});

export const depositFundsAction = actionClient
  .schema(walletSchema)
  .action(async ({ parsedInput: { amount } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      // Transactional update: Add balance and record transaction
      await db.transaction(async (tx) => {
        await tx.update(users)
          .set({ 
            walletBalance: sql`${users.walletBalance} + ${amount}` 
          })
          .where(eq(users.id, user.id));

        await tx.insert(transactions).values({
          userId: user.id,
          type: "deposit",
          amount,
          description: "Manual wallet deposit (Simulation)",
        });
      });

      revalidatePath("/dashboard", "layout");
      return { success: true, message: "Funds deposited successfully." };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });

export const withdrawFundsAction = actionClient
  .schema(walletSchema)
  .action(async ({ parsedInput: { amount } }) => {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Unauthorized");

      const userRecord = await db.query.users.findFirst({
        where: eq(users.id, user.id)
      });

      if (parseFloat(userRecord?.walletBalance || "0") < parseFloat(amount)) {
        throw new Error("Insufficient balance.");
      }

      await db.transaction(async (tx) => {
        await tx.update(users)
          .set({ 
            walletBalance: sql`${users.walletBalance} - ${amount}` 
          })
          .where(eq(users.id, user.id));

        await tx.insert(transactions).values({
          userId: user.id,
          type: "withdrawal",
          amount,
          description: "Wallet withdrawal",
        });
      });

      revalidatePath("/dashboard", "layout");
      return { success: true, message: "Funds withdrawn successfully." };

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  });
