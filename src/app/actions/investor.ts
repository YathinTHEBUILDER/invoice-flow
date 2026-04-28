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

  // 1. Fetch investments (we need a way to track which investor funded which invoice)
  // For now, let's assume we add an 'investor_id' column to the invoices table
  // or a separate 'investments' table. 
  // Let's check the schema again or just use 'investor_id' on invoices for simplicity if it exists.
  
  const { data: myInvestments } = await supabase
    .from('invoices')
    .select('amount, status')
    .eq('investor_id', user.id);

  const totalInvested = myInvestments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  const activeAssets = myInvestments?.filter(inv => inv.status === 'funded').length || 0;

  // 2. Fetch Wallet Balance (from profiles or a dedicated table)
  const { data: profile } = await supabase
    .from('profiles')
    .select('wallet_balance')
    .eq('id', user.id)
    .single();

  return {
    totalInvested,
    activeAssets,
    walletBalance: profile?.wallet_balance || 0,
    expectedARR: 14.5 // Hardcoded for now
  };
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
 * Fund Invoice Action
 */
export const fundInvoiceAction = actionClient
  .schema(z.object({ invoiceId: z.string().uuid() }))
  .action(async ({ parsedInput: { invoiceId } }) => {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) throw new Error("Not authenticated");

    // 1. Check if invoice is still available
    const { data: invoice } = await supabase
      .from('invoices')
      .select('amount, status, msme_id, invoice_number')
      .eq('id', invoiceId)
      .single();

    if (!invoice || invoice.status !== 'approved') {
      throw new Error("Asset no longer available for liquidity.");
    }

    // 2. Check investor balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if ((profile?.wallet_balance || 0) < Number(invoice.amount)) {
      throw new Error("Insufficient wallet liquidity to fund this asset.");
    }

    // 3. Perform atomic update (deduct balance and mark funded)
    // Note: In production, use a Postgres RPC/Function for atomicity
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

    // 5. Create Repayment Schedule for MSME
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 45); // Standard 45-day tenure
    
    await supabase.from('repayments').insert({
      invoice_id: invoiceId,
      amount_due: Number(invoice.amount) * 1.02, // 2% markup for example
      due_date: dueDate.toISOString(),
      status: 'scheduled'
    });

    // 6. Notifications
    await createNotification(
      user.id,
      "Investment Successful! 🚀",
      `You have successfully funded Invoice #${invoice.invoice_number}.`,
      "success",
      "/investor"
    );

    await createNotification(
      invoice.msme_id,
      "Invoice Funded! 💰",
      `Your Invoice #${invoice.invoice_number} has been funded by an investor. Funds will be disbursed shortly.`,
      "success",
      "/msme"
    );

    revalidatePath("/investor");
    revalidatePath("/msme");
    return { success: true };
  });
