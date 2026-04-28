"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInAction, signInWithOtpAction, verifyOtpAction } from "@/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, Mail, Lock, ArrowRight, Fingerprint, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"password" | "otp" | "verify_otp">("password");
  const router = useRouter();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signInAction({ email, password });

    if (result?.data?.success) {
      toast.success("Access granted. Authenticated successfully.");
      router.push("/dashboard");
    } else if (result?.data?.needsVerification) {
      toast.info("Security check: Email verification required.");
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } else {
      toast.error(result?.data?.error || "Authentication failed. Please check credentials.");
    }
    setLoading(false);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signInWithOtpAction({ email });

    if (result?.data?.success) {
      toast.success("Security code dispatched to your email.");
      setMode("verify_otp");
    } else {
      toast.error(result?.data?.error || "Dispatch failed.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyOtpAction({
      email,
      token: otp,
      type: "email",
    });

    if (result?.data?.success) {
      toast.success("OTP Verified. Session established.");
      router.push("/dashboard");
    } else {
      toast.error(result?.data?.error || "Invalid or expired security code.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-lg shadow-primary/10">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
            InvoiceFlow
          </h1>
          <p className="text-muted-foreground max-w-[80%] mx-auto font-medium">
            {mode === "verify_otp" 
              ? "Verify the secure code sent to your email" 
              : "Institutional-grade invoice discounting terminal"}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl transition-all hover:shadow-primary/5">
          {mode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" /> Official Email
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" /> Credential
                    </label>
                    {loading ? (
                      <span className="text-xs text-muted-foreground font-bold">Forgot Password?</span>
                    ) : (
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline font-bold transition-all">
                        Forgot Password?
                      </Link>
                    )}
                  </div>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 group"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to Terminal"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">
                  <span className="bg-card px-3">Secure Access</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => setMode("otp")}
                className="w-full h-12 border-primary/20 bg-background/50 hover:bg-primary/5 hover:text-primary transition-all font-bold"
              >
                <Fingerprint className="mr-2 h-5 w-5" />
                Single-Use Security Code
              </Button>
            </form>
          )}

          {mode === "otp" && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-xl font-black">OTP Authentication</h2>
                <p className="text-sm text-muted-foreground font-medium">We'll dispatch a one-time security code for direct access.</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-foreground/80">Official Email</label>
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
                className="w-full h-14 font-black text-lg shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Dispatch Security Code"}
              </Button>

              <button
                type="button"
                onClick={() => setMode("password")}
                className="w-full text-center text-sm text-muted-foreground hover:text-primary transition-all font-bold"
              >
                Back to Password Login
              </button>
            </form>
          )}

          {mode === "verify_otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2 text-center mb-6">
                <h2 className="text-2xl font-black">Verify Identity</h2>
                <p className="text-sm text-muted-foreground">Sent to <span className="text-foreground font-bold">{email}</span></p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="h-20 text-center text-4xl tracking-[0.6em] font-mono font-black bg-background/50 border-2"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full h-14 font-black text-lg shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm & Establish Session"}
              </Button>

              <button
                type="button"
                onClick={() => setMode("otp")}
                className="w-full text-center text-sm text-primary hover:underline font-bold"
              >
                Request New Code
              </button>
            </form>
          )}
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground font-medium">
            New Business?{" "}
            <Link href="/register/msme" className="text-primary hover:underline font-black">
              Register MSME
            </Link>
          </p>
          <div className="h-1 w-1 rounded-full bg-muted-foreground/20" />
          <p className="text-center text-sm text-muted-foreground font-medium">
            New Investor?{" "}
            <Link href="/register/investor" className="text-primary hover:underline font-black">
              Join Network
            </Link>
          </p>
        </div>
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold opacity-40">
          Encrypted Authentication Terminal v4.1
        </p>
      </div>
    </div>
  );
}

