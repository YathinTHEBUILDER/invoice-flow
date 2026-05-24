"use client";

import { motion } from "framer-motion";
import { Zap, ShieldCheck, Landmark, BarChart3 } from "lucide-react";

export function MSMESection() {
  const benefits = [
    {
      title: "Fast Working Capital",
      desc: "Convert outstanding invoice assets into immediate cash in under 48 hours to handle operational expenses.",
      icon: Zap,
      accent: "from-blue-500/20 to-blue-500/0 text-blue-400 border-blue-500/20",
      glow: "hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
    },
    {
      title: "Transparent Pricing",
      desc: "No onboarding costs or maintenance margins. Pay a flat 1.0% transaction fee only upon settlement.",
      icon: Landmark,
      accent: "from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/20",
      glow: "hover:border-indigo-500/40 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]"
    },
    {
      title: "Verified Buyer Review",
      desc: "Funding approval is based on the credit profile of investment-grade corporate buyers, requiring zero property collateral.",
      icon: ShieldCheck,
      accent: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/20",
      glow: "hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]"
    },
    {
      title: "Better Cash Flow Planning",
      desc: "Confidently take on larger purchase orders, secure raw materials, and manage payroll without waiting 90 days.",
      icon: BarChart3,
      accent: "from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/20",
      glow: "hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
    }
  ];

  return (
    <section id="msme-benefits" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32 relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/[0.02] to-transparent pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left column: Header copy */}
        <div className="lg:col-span-5 text-left space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold tracking-wider text-blue-400 uppercase backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              For Indian MSMEs
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance"
          >
            Finance B2B growth on your terms
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base text-neutral-400 leading-relaxed max-w-md"
          >
            InvoiceFlow helps suppliers bypass bank delays. Unlock capital locked in high credit-grade corporate receivables and grow without equity dilution or physical collateral.
          </motion.p>
        </div>

        {/* Right column: 2x2 grid of benefits cards */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6 relative">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className={`group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-left transition-all duration-500 cursor-default ${item.glow}`}
              >
                {/* Dynamic Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${item.accent.split(' ')[0]}`} />
                
                {/* Inner Border Shine */}
                <div className="absolute inset-0 rounded-3xl border border-white/5 group-hover:border-white/10 transition-colors pointer-events-none" />

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.accent} border mb-6 shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <h3 className="text-lg font-bold text-white tracking-tight mb-3 flex items-center gap-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-neutral-400 leading-relaxed font-medium">
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
