"use client";

import { motion } from "framer-motion";
import { ShieldCheck, CalendarRange, TrendingUp, SearchCode, PieChart } from "lucide-react";

export function InvestorSection() {
  const benefits = [
    {
      title: "Invoice-Backed Debt Assets",
      desc: "Capital allocations are linked directly to commercial trade debt issued to corporate buyers.",
      icon: ShieldCheck,
      accent: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/20",
      glow: "hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]"
    },
    {
      title: "Short Duration Cycles",
      desc: "Maturity ranges of 30 to 90 days allow rapid liquidity cycles, flexible cash turns, and compound trade yields.",
      icon: CalendarRange,
      accent: "from-blue-500/20 to-blue-500/0 text-blue-400 border-blue-500/20",
      glow: "hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
    },
    {
      title: "Manual Credit Underwriting",
      desc: "Every receivable listed undergoes audit verification of physical purchase logs, logistics receipts, and GST registries.",
      icon: SearchCode,
      accent: "from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/20",
      glow: "hover:border-indigo-500/40 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]"
    },
    {
      title: "Portfolio Visibility",
      desc: "Monitor ongoing allocations, track interest settlements, and audit historical platform performance in real-time.",
      icon: PieChart,
      accent: "from-cyan-500/20 to-cyan-500/0 text-cyan-400 border-cyan-500/20",
      glow: "hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]"
    }
  ];

  return (
    <section id="investor-benefits" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32 relative">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/[0.02] to-transparent pointer-events-none" />

      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: Benefits Grid */}
        <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6 order-2 lg:order-1 relative">
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

                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.accent} border mb-6 shrink-0 shadow-inner group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500`}>
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

        {/* Right Column: Title and details */}
        <div className="lg:col-span-5 text-left space-y-8 order-1 lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold tracking-wider text-emerald-400 uppercase backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              For Debt Investors
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance"
          >
            Access secure, short-duration yields
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base text-neutral-400 leading-relaxed max-w-md"
          >
            Gain exposure to a verified marketplace of corporate trade receivables. Earn predictable ARR ranging from 12% to 15% backed by physical business activity.
          </motion.p>
        </div>
        
      </div>
    </section>
  );
}
