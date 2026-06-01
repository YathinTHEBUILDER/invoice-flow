"use client";

import Link from "next/link";
import { ArrowRight, AlertTriangle, ShieldCheck, Clock, FileWarning, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function RiskSection() {
  const risks = [
    {
      title: "Verification risk",
      desc: "Documents are manually reviewed, but incorrect or incomplete information may still affect approval and repayment timelines.",
      icon: ShieldCheck,
      border: "hover:border-blue-500/30"
    },
    {
      title: "Buyer delay risk",
      desc: "If the buyer delays payment, investor repayment may also be delayed.",
      icon: Clock,
      border: "hover:border-amber-500/30"
    },
    {
      title: "Dispute risk",
      desc: "Invoices may face disputes related to delivery, quality, pricing, or acceptance.",
      icon: FileWarning,
      border: "hover:border-red-500/30"
    },
    {
      title: "Return risk",
      desc: "Returns are indicative and not guaranteed. Actual outcomes depend on buyer repayment and invoice status.",
      icon: TrendingDown,
      border: "hover:border-emerald-500/30"
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-b border-white/[0.03] relative overflow-hidden bg-black/[0.15]">
      
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-900/[0.01] to-transparent pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/5 border border-red-500/15 text-[10px] font-semibold tracking-wider text-red-400 uppercase">
          <AlertTriangle className="w-3.5 h-3.5" /> Platform Transparency
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          How risk works
        </h2>
        <p className="text-sm md:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          InvoiceFlow uses manual checks to reduce risk, but invoice-backed investments are not risk-free.
        </p>
      </div>

      {/* Risk Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
        {risks.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`group relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-left transition-all duration-300 ${item.border}`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors mb-5">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mb-2.5">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Action Area */}
      <div className="flex flex-col items-center gap-4 text-center mt-10">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
          Before allocating capital, please understand the complete platform rules.
        </p>
        <Button 
          asChild 
          variant="outline"
          className="h-12 px-8 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold uppercase tracking-wider text-[10px] rounded-xl transition-all"
        >
          <Link href="/risk-disclosure">
            Read Risk Disclosure <ArrowRight className="ml-2 w-4 h-4 text-red-400" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
