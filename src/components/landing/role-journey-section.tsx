"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, CheckCircle2, Landmark, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function RoleJourneySection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.6, 
        ease: "easeOut" as const
      } 
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-b border-white/[0.03] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/15 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
          Ecosystem Journeys
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white">
          Built for both sides of invoice financing
        </h2>
        <p className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          MSMEs get faster access to working capital. Investors get transparent access to manually reviewed invoice-backed opportunities.
        </p>
      </div>

      {/* Cards container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
      >
        {/* MSME Journey Card */}
        <motion.div 
          variants={cardVariants}
          className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_15px_40px_rgba(59,130,246,0.08)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
          <div className="space-y-8 relative z-10">
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Landmark className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-500/5 border border-blue-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Capital Receiver
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">For MSMEs</h3>
              <p className="text-xs text-neutral-400 font-medium">Unshackle cash tied up in outstanding buyer payments.</p>
            </div>

            <ul className="space-y-4">
              {[
                "1. Complete business KYC",
                "2. Upload invoice and purchase order",
                "3. Wait for manual verification",
                "4. Receive marketplace funding",
                "5. Track buyer repayment status"
              ].map((step, index) => (
                <li key={index} className="flex items-center gap-3 text-xs text-neutral-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 relative z-10">
            <Button 
              asChild 
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl shadow-lg shadow-blue-600/10 transition-transform group-hover:scale-[1.01]"
            >
              <Link href="/get-started?role=msme">
                Get Working Capital <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Investor Journey Card */}
        <motion.div 
          variants={cardVariants}
          className="group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 hover:border-emerald-500/30 hover:shadow-[0_15px_40px_rgba(16,185,129,0.08)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
          <div className="space-y-8 relative z-10">
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Capital Allocator
              </span>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white tracking-tight">For Investors</h3>
              <p className="text-xs text-neutral-400 font-medium">Acquire stable returns backed by verified receivables.</p>
            </div>

            <ul className="space-y-4">
              {[
                "1. Complete investor KYC",
                "2. Add funds to wallet",
                "3. Review verified invoice listings",
                "4. Invest manually",
                "5. Track repayment and status updates"
              ].map((step, index) => (
                <li key={index} className="flex items-center gap-3 text-xs text-neutral-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-8 relative z-10">
            <Button 
              asChild 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl shadow-lg shadow-emerald-600/10 transition-transform group-hover:scale-[1.01]"
            >
              <Link href="/get-started?role=investor">
                Start Investing <ArrowUpRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
