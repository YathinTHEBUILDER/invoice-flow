"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, TrendingUp, ShieldCheck, CheckCircle2, FileText, Wallet, Check, AlertCircle } from "lucide-react";

type TabId = "msme" | "investor" | "admin";

export function ProductPreview() {
  const [activeTab, setActiveTab] = useState<TabId>("msme");

  const tabs = [
    { id: "msme" as TabId, label: "MSME Portal", icon: Landmark },
    { id: "investor" as TabId, label: "Investor Portal", icon: TrendingUp },
    { id: "admin" as TabId, label: "Verification Desk", icon: ShieldCheck }
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-20 border-b border-white/[0.03] bg-[#080B10]/10">
      
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/5 border border-blue-500/15 text-[10px] font-semibold tracking-wider text-blue-400 uppercase">
          Interface Showcase
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Explore the platform workflow
        </h2>
        <p className="text-sm text-neutral-400 max-w-xl mx-auto">
          A unified supply chain ecosystem engineered for quick business cash advances, secure trade yields, and rigorous auditing.
        </p>
      </div>

      {/* Tabs bar */}
      <div className="flex bg-[#0D1117]/80 border border-white/[0.04] rounded-full p-1.5 max-w-md mx-auto mb-10 relative">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 relative flex items-center justify-center gap-2 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-colors duration-300 ${
                isActive ? "text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  className="absolute inset-0 bg-blue-600 rounded-full -z-10 shadow-lg shadow-blue-600/15"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className="w-3.5 h-3.5 z-10" />
              <span className="z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="relative group/panel">
        
        {/* Soft Radial Ambient Backing */}
        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/5 to-emerald-500/5 blur-3xl rounded-[3rem] -z-10 opacity-30" />
        
        <AnimatePresence mode="wait">
          {activeTab === "msme" && (
            <motion.div
              key="msme"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gradient-to-b from-[#0D1117]/95 to-[#080B10]/98 border border-white/[0.04] hover:border-blue-500/20 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] transition-all duration-500 text-left grid md:grid-cols-12 gap-8 items-center relative overflow-hidden group"
            >
              {/* Left explanation */}
              <div className="md:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-blue-400 bg-blue-500/5 border border-blue-500/15 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                  Supplier Workspace
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  Accelerate invoice settlement directly
                </h3>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-normal">
                  MSMEs get complete transparency. Monitor active receivables listings, check audit progress logs, and trigger instant settlements to bank accounts.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    "Upload invoice PDFs with simple metadata logs",
                    "Verify corporate buyer acceptance limits",
                    "Review clear flat 1.0% platform margins"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Mock MSME Dashboard Pane */}
              <div className="md:col-span-7 bg-[#080B10]/80 border border-white/[0.04] group-hover:border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-inner transition-colors duration-500">
                <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Supplier Ledger</span>
                  <span className="text-[10px] text-emerald-400 font-bold tracking-wide">Active Capital: ₹32,40,000</span>
                </div>

                {/* Grid indices */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#101622]/50 border border-white/[0.03] group-hover:border-white/[0.06] rounded-xl p-3 text-left transition-colors duration-500">
                    <span className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider block">Receivables</span>
                    <span className="text-sm font-bold text-white block mt-0.5">₹45,00,000</span>
                  </div>
                  <div className="bg-[#101622]/50 border border-white/[0.03] group-hover:border-white/[0.06] rounded-xl p-3 text-left transition-colors duration-500">
                    <span className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider block">Paid Out</span>
                    <span className="text-sm font-bold text-white block mt-0.5">₹36,15,000</span>
                  </div>
                  <div className="bg-[#101622]/50 border border-white/[0.03] group-hover:border-white/[0.06] rounded-xl p-3 text-left transition-colors duration-500">
                    <span className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider block">In Review</span>
                    <span className="text-sm font-bold text-white block mt-0.5">₹8,85,000</span>
                  </div>
                </div>

                {/* Receivables Queue */}
                <div className="space-y-2">
                  <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider block">Receivables Queue</span>
                  {[
                    { number: "INV-2026/TM-804", buyer: "Tata Motors Ltd", amount: "₹25,00,000", status: "Funded" },
                    { number: "INV-2026/BI-915", buyer: "Britannia Industries", amount: "₹8,50,000", status: "Partially Funded" }
                  ].map((inv, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-[#0D1117]/80 border border-white/[0.03] group-hover:border-white/[0.06] text-[11px] transition-colors duration-500">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                        <div>
                          <div className="font-bold text-white">{inv.number}</div>
                          <div className="text-[9px] text-neutral-500 mt-0.5">{inv.buyer}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{inv.amount}</div>
                        <div className="text-[9px] text-emerald-400 font-bold mt-0.5">{inv.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "investor" && (
            <motion.div
              key="investor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gradient-to-b from-[#0D1117]/95 to-[#080B10]/98 border border-white/[0.04] hover:border-blue-500/20 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] transition-all duration-500 text-left grid md:grid-cols-12 gap-8 items-center relative overflow-hidden group"
            >
              {/* Left explanation */}
              <div className="md:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-indigo-400 bg-indigo-500/5 border border-indigo-500/15 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                  Investor Portal
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  Deploy liquidity into secure commercial debt
                </h3>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-normal">
                  Access curated, pre-verified invoice listings. Earn 12-15% yields with transparent risk profiles and short-duration maturity timelines.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    "Sort listed invoices by yields and duration metrics",
                    "Monitor expected repayment dates and histories",
                    "Track total return interest and platform logs"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Mock Investor Dashboard Pane */}
              <div className="md:col-span-7 bg-[#080B10]/80 border border-white/[0.04] group-hover:border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-inner transition-colors duration-500">
                <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Investor Wallet</span>
                  <span className="text-[10px] text-blue-400 font-bold flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5" /> Balance: ₹12,50,000
                  </span>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#101622]/50 border border-white/[0.03] group-hover:border-white/[0.06] rounded-xl p-3 text-left transition-colors duration-500">
                    <span className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider block">Allocation</span>
                    <span className="text-sm font-bold text-white block mt-0.5">₹8,40,000</span>
                  </div>
                  <div className="bg-[#101622]/50 border border-white/[0.03] group-hover:border-white/[0.06] rounded-xl p-3 text-left transition-colors duration-500">
                    <span className="text-[9px] text-neutral-500 font-medium uppercase tracking-wider block">Interest Earned</span>
                    <span className="text-sm font-bold text-emerald-400 block mt-0.5">+₹42,500</span>
                  </div>
                </div>

                {/* Portfolio lists */}
                <div className="space-y-2">
                  <span className="text-[9px] font-semibold text-neutral-500 uppercase tracking-wider block">Portfolio Highlights</span>
                  {[
                    { id: "inv-1", name: "Tata Motors invoice", rate: "13.2% APR", returnDate: "Due in 15 days" },
                    { id: "inv-2", name: "Cipla Pharmaceuticals invoice", rate: "11.8% APR", returnDate: "Due in 30 days" }
                  ].map((port, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-[#0D1117]/80 border border-white/[0.03] group-hover:border-white/[0.06] text-[11px] transition-colors duration-500">
                      <div>
                        <div className="font-bold text-white">{port.name}</div>
                        <div className="text-[9px] text-neutral-500 mt-0.5">{port.returnDate}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400">{port.rate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "admin" && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-gradient-to-b from-[#0D1117]/95 to-[#080B10]/98 border border-white/[0.04] hover:border-blue-500/20 rounded-[2rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.05)] transition-all duration-500 text-left grid md:grid-cols-12 gap-8 items-center relative overflow-hidden group"
            >
              {/* Left explanation */}
              <div className="md:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider">
                  Risk Management Panel
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
                  Audits preventing double invoice fraud
                </h3>
                <p className="text-xs md:text-sm text-neutral-400 leading-relaxed font-normal">
                  Dedicated risk tools manage verifying parameters. Confirm e-way bill ledgers, physical purchase matching checkpoints, and buyer registries.
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    "Match purchase orders (POs) against buyer records",
                    "Verify logistic status and matching e-way receipts",
                    "Audit GST registries directly to prevent double billing"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Mock Verification Queue Dashboard Pane */}
              <div className="md:col-span-7 bg-[#080B10]/80 border border-white/[0.04] group-hover:border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-inner transition-colors duration-500">
                <div className="flex justify-between items-center border-b border-white/[0.04] pb-3">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Verification Queue</span>
                  <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Pending reviews: 2 Invoices
                  </span>
                </div>

                {/* Verification list */}
                <div className="space-y-2">
                  {[
                    { id: "review-1", supplier: "Apex Auto Parts", buyer: "Tata Motors Ltd", check: "Confirm PO Match" },
                    { id: "review-2", supplier: "Cipla Labs Distributor", buyer: "Cipla Ltd", check: "Confirm GST Register" }
                  ].map((rev, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#0D1117]/80 border border-white/[0.03] group-hover:border-white/[0.06] text-[11px] flex justify-between items-center transition-colors duration-500">
                      <div>
                        <div className="font-bold text-white">{rev.supplier} → {rev.buyer}</div>
                        <div className="text-[9px] text-neutral-500 mt-0.5">Under audit: {rev.check}</div>
                      </div>
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 font-semibold px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                        In Progress
                      </span>
                    </div>
                  ))}
                </div>

                {/* Audit trail protocol */}
                <div className="bg-[#101622]/50 border border-white/[0.03] group-hover:border-white/[0.06] rounded-xl p-3.5 space-y-2 text-[10px] transition-colors duration-500">
                  <span className="font-semibold text-neutral-500 uppercase tracking-wider block">Security Integrity Protocol</span>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Independent buyer escrow registration confirmed</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Real-time platform logs validation enabled</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
