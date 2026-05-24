"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Landmark, BarChart3, HelpCircle } from "lucide-react";

export function MSMESection() {
  const benefits = [
    {
      title: "Fast Working Capital",
      desc: "Convert outstanding invoice assets into immediate cash in under 48 hours to handle operational expenses.",
      icon: Zap,
      accent: "text-blue-400 bg-blue-500/5 border-blue-500/15",
      glow: "hover:border-blue-500/30 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3),0_0_30px_rgba(59,130,246,0.08)]"
    },
    {
      title: "Transparent Pricing",
      desc: "No onboarding costs or maintenance margins. Pay a flat 1.0% transaction fee only upon settlement.",
      icon: Landmark,
      accent: "text-indigo-400 bg-indigo-500/5 border-indigo-500/15",
      glow: "hover:border-indigo-500/30 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3),0_0_30px_rgba(99,102,241,0.08)]"
    },
    {
      title: "Verified Buyer Review",
      desc: "Funding approval is based on the credit profile of investment-grade corporate buyers, requiring zero property collateral.",
      icon: ShieldCheck,
      accent: "text-emerald-400 bg-emerald-500/5 border-emerald-500/15",
      glow: "hover:border-emerald-500/30 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3),0_0_30px_rgba(16,185,129,0.08)]"
    },
    {
      title: "Better Cash Flow Planning",
      desc: "Confidently take on larger purchase orders, secure raw materials, and manage payroll without waiting 90 days for client clearance.",
      icon: BarChart3,
      accent: "text-cyan-400 bg-cyan-500/5 border-cyan-500/15",
      glow: "hover:border-cyan-500/30 hover:shadow-[0_15px_35px_rgba(0,0,0,0.3),0_0_30px_rgba(6,182,212,0.08)]"
    }
  ];

  return (
    <section id="msme-benefits" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-b border-white/[0.03]">
      <div className="grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left column: Header copy */}
        <div className="lg:col-span-5 text-left space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/15 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
            For Indian MSMEs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-[1.1] text-balance">
            Finance B2B business growth on your own terms
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
            InvoiceFlow helps suppliers bypass bank delays. Unlock capital locked in high credit-grade corporate receivables and grow without equity dilution or physical collateral.
          </p>
        </div>

        {/* Right column: 2x2 grid of benefits cards */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25, ease: "easeOut" } }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`bg-[#0D1117]/85 border border-white/[0.04] rounded-2xl p-6 text-left transition-all duration-300 relative group overflow-hidden shadow-lg shadow-black/25 ${item.glow}`}
              >
                {/* Soft top-right border shine */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.01] blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${item.accent} mb-4 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight mb-2 flex items-center gap-1.5">
                  {item.title}
                </h3>
                <p className="text-[12px] md:text-xs text-neutral-400 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}
