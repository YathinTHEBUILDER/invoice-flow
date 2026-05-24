import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { MSMESection } from "@/components/landing/msme-section";
import { InvestorSection } from "@/components/landing/investor-section";
import { TrustSection } from "@/components/landing/trust-section";
import { ProductPreview } from "@/components/landing/product-preview";
import { CTASection } from "@/components/landing/cta-section";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InvoiceFlow | Invoice Financing for Indian MSMEs",
  description: "Access working capital in 48 hours. InvoiceFlow connects high credit quality Indian MSMEs with capital partners through verified receivables financing.",
};

export default async function LandingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const role = user?.user_metadata?.role || "investor";

  return (
    <div className="flex flex-col w-full items-center bg-[#05070A] selection:bg-blue-500/30 overflow-hidden font-sans min-h-screen">
      <Navbar />

      {/* Background ambient grid layout */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none -z-10" />
      <div className="absolute top-0 left-0 right-0 h-[1000px] w-full hero-gradient pointer-events-none -z-10 opacity-20" />
      <div className="absolute top-0 right-[15%] w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Core Homepage Modular Sections */}
      <HeroSection user={user} role={role} />
      <HowItWorks />
      <MSMESection />
      <InvestorSection />
      <TrustSection />
      <ProductPreview />
      <CTASection user={user} role={role} />

      <Footer />
    </div>
  );
}
