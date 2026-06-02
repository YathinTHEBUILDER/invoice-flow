"use client";

import { useSearchParams } from "next/navigation";
import { OtpForm } from "@/components/auth/otp-form";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { Mail, ChevronLeft, Loader2 } from "lucide-react";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = (searchParams.get("type") as 'signup' | 'recovery' | 'email_change') || "signup";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative">
      <div className="fixed inset-0 w-full h-full hero-gradient pointer-events-none -z-10 opacity-40" />
      
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/login" className="absolute top-8 left-8 flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
          
          <Link href="/" aria-label="Go to InvoiceFlow home">
            <Logo variant="full" theme="dark" priority className="scale-110 mb-4" />
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest">
              Email Verification
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gradient leading-none">
            Check Your Email.
          </h1>
          
          <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
            We&apos;ve sent an 8-digit verification code to <span className="text-foreground font-bold">{email}</span>. Please enter it below to continue.
          </p>
        </div>

        <div className="glass-dark border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
          
          <OtpForm email={email} type={type} />
        </div>

        <div className="text-center">
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Didn&apos;t receive the code? Check your spam folder or click resend.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
