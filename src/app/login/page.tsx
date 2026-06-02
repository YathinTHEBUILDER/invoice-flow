"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { Building2, LineChart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LoginPage() {
  const [role, setRole] = useState("investor");
  const router = useRouter();

  const handleSuccess = (data: any) => {
    if (data?.unverified) {
      toast.info("Please verify your email address.");
      router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`);
      return;
    }
    toast.success("Welcome back!");
    router.push("/");
  };

  const roles = [
    { id: "msme", label: "MSME", icon: Building2 },
    { id: "investor", label: "Investor", icon: LineChart },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 relative">
      <div className="fixed inset-0 w-full h-full hero-gradient pointer-events-none -z-10 opacity-40" />
      
      <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/" aria-label="Go to InvoiceFlow home">
            <Logo variant="full" theme="dark" priority className="scale-110 mb-4" />
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-none">
            Welcome Back.
          </h1>

          {/* Role Selector Tabs */}
          <div className="flex p-1.5 rounded-2xl bg-white/5 border border-white/10 w-full max-w-sm">
            {roles.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                  role === r.id 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <r.icon className="w-3.5 h-3.5" />
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="glass-dark p-8 md:p-12 rounded-2xl shadow-2xl relative overflow-hidden group">
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all duration-1000" />
          
          <AuthForm 
            type="login" 
            role={role} 
            action={signInAction} 
            onSuccess={handleSuccess} 
          />
        </div>

        <div className="text-center">
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Don&apos;t have an account?{" "}
            <Link href="/get-started" className="text-primary hover:underline ml-2">
              Get Started <ArrowRight className="inline-block w-3 h-3 ml-1" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
