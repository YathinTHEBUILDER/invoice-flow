"use client";

import { useState } from "react";
import { requestPasswordResetAction } from "@/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await requestPasswordResetAction({ email });

    if (result?.data?.success) {
      setSuccess(true);
      toast.success("Password reset link sent!");
    } else {
      toast.error(result?.data?.error || "Failed to request password reset.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <KeyRound className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Reset Password
          </h1>
          <p className="text-muted-foreground">
            {success 
              ? "We've sent a recovery link to your inbox" 
              : "Enter your official email to recover your account"}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl transition-all hover:shadow-primary/5">
          {success ? (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-primary animate-in zoom-in duration-300" />
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-sm text-foreground">
                Please check your email <span className="font-bold">{email}</span> for a secure link to reset your password. The link will expire in 1 hour.
              </div>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full h-12">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" /> Official Email
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-12 bg-background/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
              >
                {loading ? "Sending link..." : "Send Reset Link"}
              </Button>
              
              <Link href="/login" className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
