"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Zap, ArrowUpRight, FileText, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";

interface HeroSectionProps {
  user: User | null;
  role: string;
}

export function HeroSection({ user, role }: HeroSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
      } 
    }
  };

  return (
    <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-28 md:pb-24 overflow-hidden">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left Column: Headline, subhead, CTAs, trust microcopy */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 flex flex-col space-y-6 text-left"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants} 
            className="inline-flex self-start items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-[11px] font-medium tracking-wide text-blue-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Verified Supply Chain Invoice Discounting
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants} 
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance font-sans"
          >
            Unlock Working Capital <br className="hidden md:inline" />
            From <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-200 to-emerald-400 font-extrabold">Unpaid Invoices</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            variants={itemVariants} 
            className="text-base text-neutral-400 max-w-xl leading-relaxed font-sans"
          >
            Convert verified B2B receivables into fast, transparent working capital with manual review, clear fees, and invoice-backed funding. Built for growing Indian MSMEs and smart investors.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2"
          >
            {user ? (
              <Button 
                size="lg" 
                asChild 
                className="h-11 px-8 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/10"
              >
                <Link href={`/dashboard/${role}`}>
                  Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  asChild 
                  className="h-11 px-6 text-xs font-semibold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-600/10"
                >
                  <Link href="/get-started?role=msme">
                    Get Working Capital <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild 
                  className="h-11 px-6 text-xs font-semibold uppercase tracking-wider bg-white/[0.02] border-white/5 hover:bg-white/5 text-white rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Link href="/get-started?role=investor">
                    Start Investing <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </motion.div>

          {/* Trust Microcopy */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium pt-2 border-t border-white/[0.04]"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Manual verification
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Invoice-backed assets
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-500" /> Fixed platform fee
            </span>
          </motion.div>
        </motion.div>

        {/* Right Column: Premium Fintech Mockup Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="lg:col-span-5 relative"
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-emerald-500/5 blur-3xl rounded-[3rem] -z-10 opacity-30" />
          
          {/* Floating Card UI */}
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            whileHover={{ scale: 1.02, y: -12 }}
            transition={{ 
              y: { duration: 6, ease: "easeInOut", repeat: Infinity },
              scale: { duration: 0.3, ease: "easeOut" }
            }}
            className="w-full bg-[#0D1117]/80 backdrop-blur-xl border border-white/[0.06] hover:border-blue-500/30 rounded-[2rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] transition-all duration-300 relative overflow-hidden text-left cursor-pointer group"
          >
            {/* Top border shine */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Header info */}
            <div className="flex items-center justify-between border-b border-white/[0.04] pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider block">Receivables Listing</span>
                  <h3 className="text-xs font-bold text-white mt-0.5">Tata Motors Ltd — INV/804</h3>
                </div>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                Audit Verified
              </span>
            </div>

            {/* Grid stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#101622]/50 border border-white/[0.03] rounded-xl p-3 group-hover:border-white/[0.06] transition-colors">
                <span className="text-[9px] font-medium text-neutral-500 uppercase block tracking-wider">Receivable Value</span>
                <div className="text-base font-bold text-white mt-0.5">₹25,00,000</div>
              </div>
              <div className="bg-[#101622]/50 border border-white/[0.03] rounded-xl p-3 group-hover:border-white/[0.06] transition-colors">
                <span className="text-[9px] font-medium text-neutral-500 uppercase block tracking-wider">Tenure / Yield</span>
                <div className="text-base font-bold text-white mt-0.5">45 Days / 13.5%</div>
              </div>
            </div>

            {/* Validation items */}
            <div className="space-y-2 mb-4 bg-[#080B10]/40 rounded-xl p-3.5 border border-white/[0.04]">
              <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1.5">Manual Verification Trail</span>
              <div className="space-y-2">
                {[
                  "Purchase Order (PO) Match & Buyer Signoff",
                  "E-Way Logistics Ledger Verified",
                  "GST Portal Registry Confirmation"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-[11px] text-neutral-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Funding slider preview */}
            <div className="space-y-1.5 bg-[#101622]/30 p-3 rounded-xl border border-white/[0.03] mb-4">
              <div className="flex justify-between text-[10px] font-semibold text-neutral-400">
                <span>Funding Progress</span>
                <span className="text-emerald-400 font-bold">75% raised (₹18.75L)</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  whileInView={{ width: "75%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" 
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="flex justify-between items-center text-[10px] text-neutral-500">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-neutral-500" /> Payout: <strong>48h</strong></span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3 text-neutral-500" /> Pool: <strong>14 Providers</strong></span>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
