"use client";

import { AuthCard } from "@/components/auth/auth-card";
import { Building2, LineChart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";

export default function GetStartedPage() {
  const router = useRouter();

  const handleSelect = (role: string) => {
    router.push(`/signup?role=${role}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient gradients */}
      <div className="absolute top-0 left-0 right-0 h-screen w-full hero-gradient pointer-events-none -z-10 opacity-40" />
      
      <div className="w-full max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-6">
          <Link href="/">
            <Logo className="scale-125 mb-8" />
          </Link>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gradient leading-none">
            Choose your path.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-xl">
            Select the account type that best fits your needs. You can always change this later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <AuthCard
            title="For MSMEs"
            description="Access instant liquidity by discounting your verified invoices. Scale your business without debt."
            icon={Building2}
            onClick={() => handleSelect("msme")}
          />
          <AuthCard
            title="For Investors"
            description="Discover secure, asset-backed yields. Deploy capital into verified supply chain assets."
            icon={LineChart}
            onClick={() => handleSelect("investor")}
          />
        </div>

        <div className="text-center pt-8">
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline ml-2">
              Login here <ArrowRight className="inline-block w-3 h-3 ml-1" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
