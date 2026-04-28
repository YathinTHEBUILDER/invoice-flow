"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { Mail, ChevronLeft, Loader2, KeyRound } from "lucide-react";
import { forgotPasswordAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const { execute, isPending } = useAction(forgotPasswordAction, {
    onSuccess: () => {
      toast.success("Reset link sent!");
      setSubmitted(true);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Something went wrong");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    execute({ email });
  };

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
            <KeyRound className="w-5 h-5 text-primary" />
            <span className="text-sm font-black uppercase tracking-widest">
              Recovery
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-gradient leading-none">
            Reset Password.
          </h1>
          
          <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">
            {submitted 
              ? "We've sent a recovery link to your email. Please click the link to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        <div className="glass-dark border-white/5 p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
          
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isPending}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-bold text-foreground">Check your inbox</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
