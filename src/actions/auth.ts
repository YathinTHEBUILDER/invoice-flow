"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createClient } from "@/lib/server";

const actionClient = createSafeActionClient();

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://invoiceflowindia.tech";

// ----------------------------------------------------------------------
// SCHEMAS
// ----------------------------------------------------------------------

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["admin", "investor", "msme"]),
  fullName: z.string().min(2, { message: "Full name is required" }),
  companyName: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, { message: "Password is required" }),
});

const signInOtpSchema = z.object({
  email: z.string().email(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6, { message: "OTP must be exactly 6 digits" }),
  type: z.enum(["signup", "recovery", "magiclink", "email", "login"]),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
  type: z.enum(["signup", "login", "recovery"]),
});

// ----------------------------------------------------------------------
// ACTIONS
// ----------------------------------------------------------------------

export const signUpAction = actionClient
  .schema(signUpSchema)
  .action(async ({ parsedInput: { email, password, role, fullName, companyName } }) => {
    try {
      const supabase = await createClient();
      
      // 1. Strict Duplicate Check: Check if user already exists in public.users
      // We check this first to provide a friendly "Account exists" message instead of a generic signup error
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id, role")
        .eq("email", email.toLowerCase())
        .single();

      if (existingUser) {
        return { 
          success: false, 
          error: "An account with this email already exists. Please login instead.",
          exists: true 
        };
      }

      // 2. Perform Signup
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${APP_URL}/auth/callback`,
          data: {
            role,
            full_name: fullName,
            company_name: companyName || null,
          },
        },
      });

      if (error) {
        // If Supabase returns an error that email is already registered (even if check above missed it somehow)
        if (error.message.toLowerCase().includes("already registered") || error.message.toLowerCase().includes("unique constraint")) {
          return { 
            success: false, 
            error: "An account with this email already exists. Please login instead.",
            exists: true 
          };
        }
        return { success: false, error: error.message };
      }
      
      return { 
        success: true, 
        message: "Signup initiated. A verification code has been sent to your email.",
      };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const verifyOtpAction = actionClient
  .schema(verifyOtpSchema)
  .action(async ({ parsedInput: { email, token, type } }) => {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: type === "login" ? "email" : type as any, // Supabase uses 'email' for OTP login
      });

      if (error) return { success: false, error: error.message };

      return { success: true, message: "Verification successful!" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const signInAction = actionClient
  .schema(signInSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    try {
      const supabase = await createClient();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          return { 
            success: false, 
            error: "Email not verified. Please check your inbox or resend the verification code.", 
            needsVerification: true,
            email: email.toLowerCase()
          };
        }
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Invalid email or password. Please try again." };
        }
        return { success: false, error: error.message };
      }

      // Check if email is confirmed (extra safety for session management)
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: "Email not verified. Please verify your email to continue.", 
          needsVerification: true,
          email: email.toLowerCase()
        };
      }

      return { success: true, message: "Signed in successfully" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const signInWithOtpAction = actionClient
  .schema(signInOtpSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${APP_URL}/auth/callback`,
          shouldCreateUser: false, // Login only
        },
      });

      if (error) return { success: false, error: error.message };

      return { success: true, message: "A secure login code has been sent to your email." };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const resendOtpAction = actionClient
  .schema(resendOtpSchema)
  .action(async ({ parsedInput: { email, type } }) => {
    try {
      const supabase = await createClient();
      let error;

      if (type === "signup") {
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: `${APP_URL}/auth/callback`,
          },
        });
        error = resendError;
      } else if (type === "login") {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${APP_URL}/auth/callback`,
            shouldCreateUser: false,
          },
        });
        error = otpError;
      }

      if (error) return { success: false, error: error.message };

      return { success: true, message: "Verification code resent successfully." };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const signOutAction = actionClient
  .schema(z.object({}))
  .action(async () => {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();
      
      if (error) return { success: false, error: error.message };

      return { success: true, message: "Signed out successfully" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const requestPasswordResetAction = actionClient
  .schema(forgotPasswordSchema)
  .action(async ({ parsedInput: { email } }) => {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${APP_URL}/auth/callback?next=/reset-password`,
      });

      if (error) return { success: false, error: error.message };

      return { success: true, message: "Password reset link sent to your email" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });

export const resetPasswordAction = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput: { password } }) => {
    try {
      const supabase = await createClient();
      
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) return { success: false, error: error.message };

      return { success: true, message: "Password updated successfully" };
    } catch (error: any) {
      return { success: false, error: error.message || "An unexpected error occurred" };
    }
  });
