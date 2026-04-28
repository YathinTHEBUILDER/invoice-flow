"use client";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { ShieldAlert, ChevronLeft } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-screen w-full hero-gradient pointer-events-none -z-10 opacity-40" />
      
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/login" className="absolute top-8 left-8 flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
          
          <Link href="/">
            <Logo className="scale-110 mb-4" />
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest">
              Security Update
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gradient leading-none">
            New Password.
          </h1>
          
          <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
            Please choose a strong password that you haven't used before.
          </p>
        </div>

        <div className="glass-dark border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
          
          <ResetPasswordForm />
        </div>

        <div className="text-center">
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Ensure your new password is at least 8 characters long.
          </p>
        </div>
      </div>
    </div>
  );
}
