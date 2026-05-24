"use client";

import { motion } from "framer-motion";
import { Check, UserCheck, ClipboardCheck, FileCheck2, Landmark, ListTodo } from "lucide-react";

export function TrustSection() {
  const steps = [
    {
      title: "1. Manual Risk Review",
      desc: "Supplier KYC validations, business registry lookups, and financial history matching.",
      icon: UserCheck
    },
    {
      title: "2. Document Verification",
      desc: "Checking physical purchase orders, shipping bills, and GST portal invoices.",
      icon: ClipboardCheck
    },
    {
      title: "3. Buyer Quality Checks",
      desc: "Confirming invoice validity and acceptance limits directly with the corporate buyer.",
      icon: FileCheck2
    },
    {
      title: "4. Invoice-Backed Funding",
      desc: "Linking capital directly to tangible corporate receivables routed via secure escrow banks.",
      icon: Landmark
    },
    {
      title: "5. Audit Trail Integration",
      desc: "Logging every transaction parameter to maintain complete compliance history.",
      icon: ListTodo
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-b border-white/[0.03] bg-gradient-to-b from-transparent to-[#080B10]/20">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/15 text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
          Risk Management Standard
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Underwritten for financial credibility
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          We manually verify every asset on the platform to prevent double-invoicing, disputes, and default exposure.
        </p>
      </div>

      {/* Horizontal checklist layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.25, ease: "easeOut" } }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-gradient-to-b from-[#0D1117]/90 to-[#080B10]/95 border border-white/[0.04] hover:border-emerald-500/30 hover:shadow-[0_15px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(16,185,129,0.06)] rounded-2xl p-5 text-left relative overflow-hidden group transition-all duration-300 shadow-lg shadow-black/20"
            >
              {/* Soft Top Glow Accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight leading-snug">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
