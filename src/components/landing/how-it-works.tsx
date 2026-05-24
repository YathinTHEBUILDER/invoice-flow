"use client";

import { motion } from "framer-motion";
import { UploadCloud, ShieldAlert, Coins } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload Invoice",
      desc: "Upload outstanding B2B invoices to our portal. Complete matching purchase orders (POs) and logistics papers in under 5 minutes.",
      icon: UploadCloud,
      accent: "from-blue-500/20 to-blue-500/0 text-blue-400 border-blue-500/20",
      glow: "hover:border-blue-500/40 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]"
    },
    {
      step: "02",
      title: "Manual Verification",
      desc: "Our credit risk team audits all transaction parameters, verifies logistics via GST registries, and secures buyer confirmation.",
      icon: ShieldAlert,
      accent: "from-indigo-500/20 to-indigo-500/0 text-indigo-400 border-indigo-500/20",
      glow: "hover:border-indigo-500/40 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]"
    },
    {
      step: "03",
      title: "Funding & Payout",
      desc: "Approved receivables enter the marketplace to be funded by investors, triggering a direct payout to your bank in 48 hours.",
      icon: Coins,
      accent: "from-emerald-500/20 to-emerald-500/0 text-emerald-400 border-emerald-500/20",
      glow: "hover:border-emerald-500/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]"
    }
  ];

  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32 border-b border-white/[0.03] relative overflow-hidden">
      
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/[0.02] to-transparent pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold tracking-wider text-blue-400 uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Marketplace Process
          </span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance"
        >
          A transparent flow from upload to payout
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base text-neutral-400 max-w-xl mx-auto leading-relaxed"
        >
          InvoiceFlow accelerates receivables settlement times while maintaining rigorous, multi-point credit verification.
        </motion.p>
      </div>

      {/* Steps Visual Grid */}
      <div className="grid md:grid-cols-3 gap-8 relative lg:px-6 z-10">
        
        {/* Animated connecting line for desktop */}
        <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-px bg-white/5 -z-10 overflow-hidden">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
          />
        </div>

        {steps.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
              transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.15 }}
              className={`group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 text-left transition-all duration-500 cursor-default ${item.glow}`}
            >
              {/* Dynamic Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${item.accent.split(' ')[0]}`} />
              
              {/* Inner Border Shine */}
              <div className="absolute inset-0 rounded-[2rem] border border-white/5 group-hover:border-white/10 transition-colors pointer-events-none" />

              {/* Step number badge */}
              <div className="absolute top-8 right-8 text-xs font-black text-white/5 group-hover:text-white/10 transition-colors tracking-widest text-4xl">
                {item.step}
              </div>

              {/* Icon Container */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${item.accent} border mb-6 shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10`}>
                <IconComponent className="w-7 h-7" />
              </div>

              <h3 className="text-xl font-bold text-white tracking-tight mb-3 relative z-10">
                {item.title}
              </h3>
              
              <p className="text-sm text-neutral-400 leading-relaxed font-medium relative z-10">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
