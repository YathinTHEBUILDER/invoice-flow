"use client";

import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { AlertTriangle, ChevronLeft } from "lucide-react";

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative">
      <div className="fixed inset-0 w-full h-full hero-gradient pointer-events-none -z-10 opacity-40" />
      
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/login" className="absolute top-8 left-8 flex items-center text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
          
          <Link href="/">
            <Logo className="scale-110 mb-4" />
          </Link>
          
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/10">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <span className="text-sm font-black uppercase tracking-widest text-destructive">
              Authentication Error
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gradient leading-none">
            Oops! Link Expired.
          </h1>
          
          <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
            The authentication link you clicked might be expired or already used. Please try requesting a new link.
          </p>
        </div>

        <div className="glass-dark border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden text-center">
          <p className="text-sm font-bold mb-6">What happened?</p>
          <ul className="text-xs text-muted-foreground space-y-2 text-left list-disc list-inside mb-8">
            <li>The link is only valid for a limited time</li>
            <li>The link can only be used once</li>
            <li>Your browser might have blocked the redirect</li>
          </ul>
          
          <Link 
            href="/auth/forgot-password"
            className="inline-flex items-center justify-center h-14 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
          >
            Request New Link
          </Link>
        </div>
      </div>
    </div>
  );
}
