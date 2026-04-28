"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

// --- SCHEMAS ---

const updateKYCSchema = z.object({
  requestId: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected", "under_review"]),
  notes: z.string().optional(),
});

const updateSettingSchema = z.object({
  key: z.string(),
  value: z.any(),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Full name is too short"),
  companyName: z.string().optional(),
});

// --- HELPERS ---

async function logAdminAction(action: string, entityType: string, entityId: string | null, details: any = {}) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  
  if (!user) return;

  await supabase.from('audit_logs').insert({
    admin_id: user.id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    ip_address: "internal" // In a real app, get from headers
  });
}

// --- ACTIONS ---

/**
 * Fetch all stats for the admin dashboard.
 */
export async function getAdminStats() {
  const supabase = await createClient();

  // 1. Calculate GMV (Sum of all active/funded invoices)
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount, status')
    .in('status', ['active', 'funded', 'repaid']);
  
  const gmv = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
  
  // 2. Fetch platform commission from settings
  const { data: settingsData } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'platform_commission')
    .single();
  
  const commission = Number(settingsData?.value || 1.0) / 100;
  const revenue = gmv * commission;

  // 3. User counts
  const { count: msmeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'msme');

  const { count: investorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'investor');

  // 4. Active Invoices
  const { count: activeInvoices } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // 5. Pending KYC
  const { count: pendingKYC } = await supabase
    .from('kyc_requests')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 6. Disputes
  const { count: disputes } = await supabase
    .from('disputes')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'resolved');

  return {
    gmv,
    revenue,
    msmeCount: msmeCount || 0,
    investorCount: investorCount || 0,
    activeInvoices: activeInvoices || 0,
    pendingKYC: pendingKYC || 0,
    disputes: disputes || 0,
    commissionPercent: commission * 100
  };
}

/**
 * Fetch KYC verification queue
 */
export async function getKYCQueue() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('kyc_requests')
    .select(`
      *,
      profiles:user_id (
        full_name,
        company_name,
        role,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export const updateKYCAction = actionClient
  .schema(updateKYCSchema)
  .action(async ({ parsedInput: { requestId, status, notes } }) => {
    const supabase = await createClient();
    const { error } = await supabase
      .from('kyc_requests')
      .update({ 
        status, 
        notes, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', requestId);

    if (error) throw new Error(error.message);
    
    await logAdminAction('update_kyc', 'kyc', requestId, { status, notes });
    
    revalidatePath("/admin");
    return { success: true };
  });

/**
 * Fetch Invoices for monitoring
 */
export async function getInvoices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profiles:msme_id (
        company_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch Platform Settings
 */
export async function getPlatformSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*');

  if (error) throw new Error(error.message);
  
  // Convert array to object for easier use
  const settingsObj: Record<string, any> = {};
  data?.forEach(s => {
    settingsObj[s.key] = s.value;
  });
  return settingsObj;
}

export const updateSettingAction = actionClient
  .schema(updateSettingSchema)
  .action(async ({ parsedInput: { key, value } }) => {
    const supabase = await createClient();
    const { error } = await supabase
      .from('platform_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);

    if (error) throw new Error(error.message);
    
    await logAdminAction('update_setting', 'setting', null, { key, value });
    
    revalidatePath("/admin");
    return { success: true };
  });

/**
 * Fetch Disputes
 */
export async function getDisputes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      invoices (invoice_number),
      profiles:raised_by (full_name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetch Audit Logs
 */
export async function getAuditLogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      *,
      profiles:admin_id (full_name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Update Profile Action
 */
export const updateProfileAction = actionClient
  .schema(updateProfileSchema)
  .action(async ({ parsedInput: { fullName, companyName } }) => {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('profiles')
      .update({ 
        full_name: fullName, 
        company_name: companyName,
        updated_at: new Date().toISOString() 
      })
      .eq('id', user.id);

    if (error) throw new Error(error.message);
    
    // Also update auth metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName, company_name: companyName }
    });

    revalidatePath("/profile");
    return { success: true };
  });
