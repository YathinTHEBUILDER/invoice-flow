"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpAction, resendOtpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, Mail, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyForm() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is missing. Please try logging in again.");
      return;
    }
    
    setLoading(true);
    const result = await verifyOtpAction({
      email,
      token: otp,
      type: "signup",
    });

    if (result?.data?.success) {
      toast.success("Email verified successfully! Welcome aboard.");
      router.push("/dashboard");
    } else {
      toast.error(result?.data?.error || "Invalid verification code.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing.");
      return;
    }

    setResending(true);
    const result = await resendOtpAction({
      email,
      type: "signup",
    });

    if (result?.data?.success) {
      toast.success("Verification code resent to your email.");
    } else {
      toast.error(result?.data?.error || "Failed to resend code.");
    }
    setResending(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            Identity Check
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            A 6-digit secure code was dispatched to <span className="text-foreground font-bold">{email || "your inbox"}</span>
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  className="text-center text-3xl tracking-[0.6em] h-20 font-mono font-black bg-background/50 border-2 focus:border-primary/50 transition-all"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                />
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none opacity-20">
                  <Mail className="h-6 w-6" />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 group"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <>
                  Verify Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="flex flex-col items-center gap-4 pt-4">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary hover:underline font-bold disabled:opacity-50 transition-all"
              >
                {resending ? "Dispatching..." : "Resend Security Code"}
              </button>
              
              <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold opacity-40">
          Secure Verification Protocol v2.4
        </p>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <VerifyForm />
    </Suspense>
  );
}

