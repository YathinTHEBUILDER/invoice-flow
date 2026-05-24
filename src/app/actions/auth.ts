"use server";

import { createClient } from "@/lib/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actionClient } from "@/lib/safe-action";
import { z } from "zod";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

// --- VALIDATION SCHEMAS ---

const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Password must contain at least one uppercase letter").regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z.string().min(2, "Full name is too short"),
  role: z.enum(["msme", "investor", "admin"]),
  companyName: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().min(10, "PAN must be 10 characters").max(10, "PAN must be 10 characters").toUpperCase(),
  bankAccountNo: z.string().min(9, "Bank account number is too short").max(18, "Bank account number is too long"),
  ifscCode: z.string().min(11, "IFSC code must be 11 characters").max(11, "IFSC code must be 11 characters").toUpperCase(),
  companyAddress: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === "msme") {
    if (!data.companyName || data.companyName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company name is required for MSMEs",
        path: ["companyName"],
      });
    }
    if (!data.companyAddress || data.companyAddress.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Company address is required for MSMEs",
        path: ["companyAddress"],
      });
    }
    if (!data.gstin || !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(data.gstin)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
        path: ["gstin"],
      });
    }
  }
});

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6).max(8, "Token must be between 6 and 8 digits"),
  type: z.enum(["signup", "recovery", "email_change"]).default("signup"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// --- HELPER: GET IP ---
async function getClientIp() {
  const headerList = await headers();
  return headerList.get("x-forwarded-for") || "unknown";
}

// --- HELPER: GET SITE URL ---
async function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  try {
    const headerList = await headers();
    const host = headerList.get("host");
    const proto = headerList.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    if (host) {
      return `${proto}://${host}`;
    }
  } catch (e) {
    // Ignore
  }
  return "http://localhost:3000";
}

// --- ACTIONS ---

export const signUpAction = actionClient
  .schema(signUpSchema)
  .action(async ({ parsedInput }) => {
    const { email, password, fullName, role, companyName, gstin, pan, bankAccountNo, ifscCode, companyAddress } = parsedInput;
    const ip = await getClientIp();
    const limit = await rateLimit(`signup:${ip}`, 10, 3600000); // 10 signups per hour per IP (relaxed for testing)

    if (!limit.success) {
      throw new Error("Too many account creation attempts. Please try again later.");
    }

     const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
          company_name: companyName,
          gstin,
          pan,
          bank_account_no: bankAccountNo,
          ifsc_code: ifscCode,
          company_address: companyAddress,
        },
      },
    });

    if (error) throw new Error(error.message);

    return { success: true, email };
  });

export const signInAction = actionClient
  .schema(signInSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    const ip = await getClientIp();
    // Use both IP and Email to prevent targeted brute force
    const limitIp = await rateLimit(`signin:ip:${ip}`, 10, 60000); // 10 attempts per min per IP
    const limitEmail = await rateLimit(`signin:email:${email}`, 5, 300000); // 5 attempts per 5 mins per email

    if (!limitIp.success || !limitEmail.success) {
      throw new Error("Too many login attempts. Please wait a few minutes.");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        return { unverified: true, email };
      }
      // Return a generic error to prevent user enumeration if needed, 
      // but Supabase usually returns "Invalid login credentials" anyway.
      throw new Error("Invalid login credentials");
    }

    revalidatePath("/", "layout");
    return { success: true };
  });

export const verifyEmailOtpAction = actionClient
  .schema(verifyOtpSchema)
  .action(async ({ parsedInput: { email, token, type } }) => {
    const ip = await getClientIp();
    const limit = await rateLimit(`verify:${email}:${ip}`, 5, 300000); // 5 attempts per 5 mins

    if (!limit.success) {
      throw new Error("Too many verification attempts. Please try again later.");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as any,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/", "layout");
    return { success: true };
  });

export const resendOtpAction = actionClient
  .schema(z.object({ email: z.string().email(), type: z.string().default("signup") }))
  .action(async ({ parsedInput: { email, type } }) => {
    const ip = await getClientIp();
    const limit = await rateLimit(`resend:${email}:${ip}`, 3, 600000); // 3 resends per 10 mins

    if (!limit.success) {
      throw new Error("Please wait before requesting another code.");
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: type as any,
      email,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  });

export const forgotPasswordAction = actionClient
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    const ip = await getClientIp();
    const limit = await rateLimit(`forgot:${email}:${ip}`, 3, 3600000); // 3 per hour

    if (!limit.success) {
      throw new Error("Too many password reset requests. Please try again later.");
    }

    const siteUrl = await getSiteUrl();
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/auth/reset-password`,
    });

    // We return success even if the email doesn't exist to prevent enumeration
    if (error && !error.message.includes("User not found")) {
      throw new Error(error.message);
    }

    return { success: true };
  });

export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password } }) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  });

export const updateEmailAction = actionClient
  .schema(z.object({ newEmail: z.string().email() }))
  .action(async ({ parsedInput: { newEmail } }) => {
    const siteUrl = await getSiteUrl();
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    }, {
      emailRedirectTo: `${siteUrl}/auth/callback?next=/settings`,
    });

    if (error) throw new Error(error.message);

    return { success: true };
  });

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
};
