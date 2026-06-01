"use server";

import { createClient } from "@/lib/server";

/**
 * Supabase database-backed rate limiter
 * @param key Unique key to track (e.g., IP + Action Name)
 * @param limit Number of allowed requests in the window
 * @param windowMs Window size in milliseconds
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const supabase = await createClient();
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds
  });

  if (error) {
    console.error("Rate limit check error:", error);
    // Fallback: allow request if rate limiter database call fails
    return { success: true, remaining: 0 };
  }

  const result = data as { success: boolean; remaining: number } | null;
  return {
    success: result?.success ?? true,
    remaining: result?.remaining ?? 0
  };
}
