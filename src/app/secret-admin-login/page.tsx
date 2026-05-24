"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { signInAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { ShieldAlert, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function SecretAdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const { execute, isPending, result } = useAction(signInAction, {
    onSuccess: ({ data }) => {
      const resultData = data as any;
      if (resultData?.unverified) {
        toast.info("Please verify your email address.");
        router.push(`/auth/verify?email=${encodeURIComponent(resultData.email)}`);
      } else {
        toast.success("Authentication successful. Welcome to Control Center.");
        router.push("/admin");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Invalid administrator credentials");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    execute({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden bg-black select-none">
      {/* Cybersecurity aesthetics / Ambient background grid & glows */}
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/">
            <Logo className="scale-110 mb-2" />
          </Link>
          
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-black uppercase tracking-widest text-primary backdrop-blur-xl">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Secure Admin Terminal</span>
          </div>

          <h1 className="text-3xl font-black tracking-tighter text-gradient leading-none">
            Control Center Authorization
          </h1>
          <p className="text-xs text-muted-foreground/80 font-bold uppercase tracking-wider">
            Restricted access portal for systems administrators
          </p>
        </div>

        <div className="glass-dark border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
          {/* Subtle neon corner border highlight */}
          <div className="absolute top-0 left-0 w-8 h-px bg-primary" />
          <div className="absolute top-0 left-0 w-px h-8 bg-primary" />
          <div className="absolute bottom-0 right-0 w-8 h-px bg-primary" />
          <div className="absolute bottom-0 right-0 w-px h-8 bg-primary" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Admin Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@invoiceflow.in"
                required
                className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium"
              />
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  required
                  className="h-12 bg-white/5 border-white/10 focus:border-primary/50 rounded-xl font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 relative"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4 inline" />
                  Authenticate
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-muted-foreground hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors">
            ← Return to public website
          </Link>
        </div>
      </div>
    </div>
  );
}
