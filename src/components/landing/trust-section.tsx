"use client";

import { motion } from "framer-motion";
import { UserCheck, ClipboardCheck, FileCheck2, Landmark, ListTodo } from "lucide-react";

export function TrustSection() {
  const steps = [
    {
      title: "1. Manual Risk Review",
      desc: "Supplier KYC validations, business registry lookups, and financial history matching (including MSME business identity, GST details, and PAN/business registration verification).",
      icon: UserCheck
    },
    {
      title: "2. Document Verification",
      desc: "Checking physical purchase orders, shipping bills, and GST portal invoices (including verification of invoice PDF, purchase order, and due date).",
      icon: ClipboardCheck
    },
    {
      title: "3. Buyer Quality Checks",
      desc: "Confirming invoice validity and acceptance limits directly with the corporate buyer (including buyer confirmation and duplicate invoice checks).",
      icon: FileCheck2
    },
    {
      title: "4. Invoice-Backed Funding",
      desc: "Linking capital directly to tangible corporate receivables routed via secure escrow banks (including bank account verification).",
      icon: Landmark
    },
    {
      title: "5. Audit Trail Integration",
      desc: "Logging every transaction parameter to maintain complete compliance history (including automated repayment tracking).",
      icon: ListTodo
    }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-32 border-b border-white/[0.03] relative overflow-hidden">
      
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
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold tracking-wider text-emerald-400 uppercase backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Risk Management Standard
          </span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance"
        >
          Underwritten for financial credibility
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base text-neutral-400 max-w-xl mx-auto leading-relaxed"
        >
          We manually verify every asset on the platform, designed to reduce duplicate invoices, disputes, and repayment uncertainty.
        </motion.p>
      </div>

      {/* Horizontal checklist layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 text-left transition-all duration-500 cursor-default hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] hover:border-emerald-500/40"
            >
              {/* Dynamic Gradient Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              
              {/* Inner Border Shine */}
              <div className="absolute inset-0 rounded-3xl border border-white/5 group-hover:border-white/10 transition-colors pointer-events-none" />

              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-500/0 border border-emerald-500/20 text-emerald-400 mb-6 shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Icon className="w-6 h-6" />
              </div>
              
              <h3 className="text-base font-bold text-white tracking-tight mb-3">
                {item.title}
              </h3>
              
              <p className="text-sm text-neutral-400 leading-relaxed font-medium">
                {item.desc}
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
