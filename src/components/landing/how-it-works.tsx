"use client";

import { motion } from "framer-motion";
import { UploadCloud, ShieldAlert, Coins, Check } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Upload Invoice",
      desc: "Upload outstanding B2B invoices to our portal. Complete matching purchase orders (POs) and logistics papers in under 5 minutes.",
      icon: UploadCloud,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      step: "02",
      title: "Manual Verification",
      desc: "Our credit risk team audits all transaction parameters, verifies logistics via GST/e-way registries, and secures buyer confirmation.",
      icon: ShieldAlert,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    },
    {
      step: "03",
      title: "Funding & Payout",
      desc: "Approved receivables enter the marketplace to be funded by investors, triggering a direct payout to your bank in 48 hours.",
      icon: Coins,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  return (
    <section id="how-it-works" className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-b border-white/[0.03]">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/15 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
          Marketplace Process
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          A transparent flow from upload to payout
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          InvoiceFlow accelerates receivables settlement times while maintaining rigorous, multi-point credit verification.
        </p>
      </div>

      {/* Steps Visual Grid */}
      <div className="grid md:grid-cols-3 gap-8 relative lg:px-6">
        
        {/* Animated connecting line for desktop */}
        <div className="hidden md:block absolute top-[44px] left-[15%] right-[15%] h-[2px] bg-white/[0.04] -z-10 overflow-hidden">
          <motion.div 
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          />
        </div>

        {steps.map((item, idx) => {
          const IconComponent = item.icon;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.3, ease: "easeOut" } }}
              transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.15 }}
              className="flex flex-col bg-gradient-to-b from-[#0D1117]/90 to-[#080B10]/95 border border-white/[0.04] hover:border-blue-500/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_30px_rgba(59,130,246,0.03)] rounded-[1.75rem] p-6 md:p-8 text-left group transition-all duration-300 relative shadow-lg shadow-black/20"
            >
              {/* Step number badge */}
              <div className="absolute top-6 right-8 text-xs font-bold text-neutral-600 group-hover:text-blue-400 transition-colors tracking-widest">
                STEP {item.step}
              </div>

              {/* Icon Container */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color} mb-6 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300`}>
                <IconComponent className="w-5 h-5" />
              </div>

              <h3 className="text-lg font-bold text-white tracking-tight mb-2.5 flex items-center gap-2">
                {item.title}
              </h3>
              <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-normal">
                {item.desc}
              </p>
              
              {/* Bottom accent glow bar */}
              <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/30 transition-all duration-500" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
