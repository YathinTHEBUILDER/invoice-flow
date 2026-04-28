"use client";

import { useState } from "react";
import { resetPasswordAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await resetPasswordAction({ password });

    if (result?.data?.success) {
      toast.success("Password updated successfully! Redirecting...");
      // Password updated successfully, they are automatically logged in by Supabase Auth!
      router.push("/dashboard");
    } else {
      toast.error(result?.data?.error || "Failed to update password. Link may have expired.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-2">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            New Password
          </h1>
          <p className="text-muted-foreground">
            Establish a new secure credential for your account
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> New Secure Password
                </label>
                <Input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 bg-background/50"
                />
                <p className="text-xs text-muted-foreground">Must be at least 8 characters long.</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || password.length < 8}
              className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 group"
            >
              {loading ? "Updating..." : "Update & Sign In"}
              {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
