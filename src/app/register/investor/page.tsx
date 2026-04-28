"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpAction, verifyOtpAction, resendOtpAction } from "@/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Wallet, Mail, Lock, User, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";

export default function InvestorRegistrationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signUpAction({
      email: formData.email,
      password: formData.password,
      role: "investor",
      fullName: formData.fullName,
    });

    if (result?.data?.success) {
      toast.success("Account created! Verification code dispatched.");
      setStep("verify");
    } else {
      if (result?.data?.exists) {
        toast.error(result?.data?.error, {
          action: {
            label: "Login Instead",
            onClick: () => router.push("/login"),
          },
        });
      } else {
        toast.error(result?.data?.error || "Registration failed.");
      }
    }
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await verifyOtpAction({
      email: formData.email,
      token: otp,
      type: "signup"
    });

    if (result?.data?.success) {
      toast.success("Identity verified! Welcome to InvoiceFlow.");
      router.push("/dashboard");
    } else {
      toast.error(result?.data?.error || "Invalid verification code.");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    const result = await resendOtpAction({
      email: formData.email,
      type: "signup"
    });
    if (result?.data?.success) {
      toast.success("Security code resent.");
    } else {
      toast.error(result?.data?.error || "Failed to resend code.");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl">
            {step === "register" ? "Investor Access" : "Identity Check"}
          </h1>
          <p className="text-muted-foreground max-w-xs mx-auto">
            {step === "register" 
              ? "Deploy capital into high-yield invoice discounting assets" 
              : `A 6-digit secure code was sent to ${formData.email}`}
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/50 p-8 shadow-2xl backdrop-blur-xl">
          {step === "register" ? (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                    <User className="h-4 w-4 text-primary" /> Full Name / Entity
                  </label>
                  <Input
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Individual or Fund Name"
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                    <Mail className="h-4 w-4 text-primary" /> Official Email
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@domain.com"
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
                    <Lock className="h-4 w-4 text-primary" /> Security Credential
                  </label>
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 group">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initialize Account"}
                {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                    <ShieldCheck className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <Input
                  type="text"
                  required
                  autoFocus
                  maxLength={6}
                  className="text-center text-4xl tracking-[0.6em] h-20 font-mono font-black bg-background/50 border-2"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                />
              </div>
              <Button type="submit" disabled={loading || otp.length !== 6} className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Identity"}
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-sm text-primary hover:underline font-bold"
                >
                  Resend Security Code
                </button>
              </div>
            </form>
          )}
        </div>

        {step === "register" && (
          <p className="text-center text-sm text-muted-foreground">
            Existing Investor?{" "}
            <Link href="/login" className="text-primary hover:underline font-extrabold">
              Sign In
            </Link>
          </p>
        )}
        
        <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-semibold opacity-40">
          Institutional Onboarding Protocol v1.9
        </p>
      </div>
    </div>
  );
}


