"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";

/**
 * Internal helper to create a notification
 */
export async function createNotification(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', link?: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    message,
    type,
    link
  });

  if (error) {
    console.error("Failed to create notification:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

/**
 * Fetch notifications for current user
 */
export async function getMyNotifications() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Fetch notifications error:", error);
    return [];
  }

  return data;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
  return { success: true };
}
