"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function MarketplacePreviewSection() {
  const samples = [
    {
      buyer: "Verified Auto Components Buyer",
      value: 850000,
      tenure: 42,
      status: "Partially Funded",
      progress: 65,
      verification: [
        "Purchase Order (PO) matched",
        "GST Portal registry checked",
        "Buyer confirmation pending"
      ],
      riskGrade: "Moderate",
      riskColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      buyer: "FMCG Distribution Buyer",
      value: 1220000,
      tenure: 60,
      status: "Open for Funding",
      progress: 20,
      verification: [
        "Invoice documents reviewed",
        "Duplicate invoice checks complete",
        "E-Way ledger match pending"
      ],
      riskGrade: "Low-Moderate",
      riskColor: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      buyer: "Industrial Supplies Buyer",
      value: 575000,
      tenure: 30,
      status: "Fully Verified",
      progress: 100,
      verification: [
        "Buyer verification signoff received",
        "Physical audit trail complete",
        "Logistics matching validated"
      ],
      riskGrade: "Low Risk",
      riskColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    }
  ];

  const formatINR = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-b border-white/[0.03] relative overflow-hidden bg-[#080B10]/20">
      
      {/* Background Radial Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/15 text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
          Live Marketplace Preview
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Marketplace Preview
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          A sample view of how verified invoice opportunities appear after manual review.
        </p>
      </div>

      {/* Grid of Listings */}
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {samples.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="group relative bg-[#0D1117]/80 backdrop-blur-xl border border-white/[0.06] rounded-[2rem] p-6 text-left flex flex-col justify-between hover:border-white/10 hover:shadow-2xl transition-all duration-300"
          >
            <div>
              {/* Header info */}
              <div className="flex justify-between items-start border-b border-white/[0.04] pb-4 mb-4 gap-2">
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider block">Receivables Listing</span>
                  <h4 className="text-sm font-bold text-white leading-tight">{item.buyer}</h4>
                </div>
                <Badge variant="outline" className={`shrink-0 text-[8px] font-bold uppercase tracking-wider h-5 rounded-full ${
                  item.status === 'Fully Verified' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                }`}>
                  {item.status}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="bg-[#101622]/50 border border-white/[0.03] rounded-xl p-3">
                  <span className="text-[8px] font-medium text-neutral-500 uppercase block tracking-wider">Invoice Value</span>
                  <div className="text-base font-bold text-white mt-0.5">{formatINR(item.value)}</div>
                </div>
                <div className="bg-[#101622]/50 border border-white/[0.03] rounded-xl p-3">
                  <span className="text-[8px] font-medium text-neutral-500 uppercase block tracking-wider">Tenure</span>
                  <div className="text-base font-bold text-white mt-0.5">{item.tenure} Days</div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5 bg-[#101622]/30 p-3 rounded-xl border border-white/[0.03] mb-5">
                <div className="flex justify-between text-[9px] font-semibold text-neutral-400">
                  <span>Funding Progress</span>
                  <span className="text-emerald-400 font-bold">{item.progress}% raised</span>
                </div>
                <div className="h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" 
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="space-y-2 bg-[#080B10]/40 rounded-xl p-3.5 border border-white/[0.04] mb-5">
                <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider block mb-1">Verification Status</span>
                <div className="space-y-1.5">
                  {item.verification.map((v, vIdx) => (
                    <div key={vIdx} className="flex items-center gap-2 text-[10px] text-neutral-300 font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Risk Alert */}
            <div className="flex items-center justify-between border-t border-white/[0.04] pt-4 mt-2">
              <span className="flex items-center gap-1.5 text-[9px] text-neutral-500 font-semibold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" /> Manually Reviewed
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${item.riskColor}`}>
                Risk: {item.riskGrade}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="max-w-3xl mx-auto text-center mt-12 text-[10px] text-neutral-500 leading-relaxed max-w-xl">
        <p className="flex items-center justify-center gap-1">
          <HelpCircle className="w-3 h-3 text-neutral-500" />
          Sample listings are illustrative. Real opportunities depend on invoice verification, buyer confirmation, and platform approval.
        </p>
      </div>
    </section>
  );
}
