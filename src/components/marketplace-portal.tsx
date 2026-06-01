"use client";

import { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  Shield, 
  TrendingUp, 
  Info,
  Calendar,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatIndianNumber } from "@/lib/utils";

interface InvoiceDemo {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  industry: string;
  amount: number;
  fundedAmount: number;
  discountRate: number;
  tenureDays: number;
  rating: string;
  riskScore: string;
}

const DEMO_INVOICES: InvoiceDemo[] = [
  {
    id: "inv-1",
    invoiceNumber: "INV/2026/VA-804",
    buyerName: "Verified Auto Components Buyer",
    industry: "Automotive",
    amount: 2500000,
    fundedAmount: 1875000,
    discountRate: 0.132, // 13.2%
    tenureDays: 45,
    rating: "AA+",
    riskScore: "Low Risk"
  },
  {
    id: "inv-2",
    invoiceNumber: "INV/2026/VP-302",
    buyerName: "Verified Pharma Distributor",
    industry: "Healthcare",
    amount: 1200000,
    fundedAmount: 480000,
    discountRate: 0.118, // 11.8%
    tenureDays: 30,
    rating: "AAA",
    riskScore: "Minimal Risk"
  },
  {
    id: "inv-3",
    invoiceNumber: "INV/2026/FD-915",
    buyerName: "FMCG Distribution Buyer",
    industry: "Consumer Goods",
    amount: 850000,
    fundedAmount: 765000,
    discountRate: 0.125, // 12.5%
    tenureDays: 60,
    rating: "AA",
    riskScore: "Low Risk"
  }
];

export function MarketplacePortal() {
  const [activeTab, setActiveTab] = useState<"all" | "short" | "high">("all");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("inv-1");
  const [simulatedInvestment, setSimulatedInvestment] = useState<number>(50000);

  const filteredInvoices = useMemo(() => {
    switch (activeTab) {
      case "short":
        return DEMO_INVOICES.filter(inv => inv.tenureDays <= 45);
      case "high":
        return DEMO_INVOICES.filter(inv => inv.discountRate >= 0.125);
      default:
        return DEMO_INVOICES;
    }
  }, [activeTab]);

  const selectedInvoice = useMemo(() => {
    return DEMO_INVOICES.find(inv => inv.id === selectedInvoiceId) || DEMO_INVOICES[0];
  }, [selectedInvoiceId]);

  // Calculate yield
  const calculatedYield = useMemo(() => {
    // Interest = Principal * Rate * (Time / 365)
    const rate = selectedInvoice.discountRate;
    const days = selectedInvoice.tenureDays;
    const interest = simulatedInvestment * rate * (days / 365);
    return Math.round(interest);
  }, [selectedInvoice, simulatedInvestment]);

  const maxInvestmentPossible = selectedInvoice.amount - selectedInvoice.fundedAmount;

  // Format date helper
  const getRepaymentDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="relative group/portal w-full">
      <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-500/20 blur-3xl rounded-[3rem] -z-10 opacity-30 group-hover/portal:opacity-50 transition-opacity duration-1000" />
      
      <Card className="glass border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
        {/* Portal Header */}
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
          </div>
          <div className="text-[10px] font-semibold text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            Interactive Marketplace Simulator
          </div>
          <div className="w-3 h-3" />
        </div>

        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Tab Filter Controls */}
          <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
            {[
              { id: "all", label: "All Invoices" },
              { id: "short", label: "Short Term (≤45d)" },
              { id: "high", label: "Target Return (≥12.5%)" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  // Auto-select first item in filtered list if current selection is filtered out
                  const newFiltered = tab.id === "short" 
                    ? DEMO_INVOICES.filter(inv => inv.tenureDays <= 45)
                    : tab.id === "high" 
                      ? DEMO_INVOICES.filter(inv => inv.discountRate >= 0.125)
                      : DEMO_INVOICES;
                  if (newFiltered.length > 0 && !newFiltered.some(i => i.id === selectedInvoiceId)) {
                    setSelectedInvoiceId(newFiltered[0].id);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-all border ${
                  activeTab === tab.id
                    ? "bg-primary/20 border-primary text-primary"
                    : "border-white/5 hover:border-white/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Invoice List */}
            <div className="lg:col-span-7 space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {filteredInvoices.map((inv) => {
                const progress = Math.round((inv.fundedAmount / inv.amount) * 100);
                const isSelected = selectedInvoiceId === inv.id;

                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvoiceId(inv.id)}
                    className={`flex flex-col p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5" 
                        : "border-white/5 hover:border-white/10 bg-black/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
                        }`}>
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white">{inv.invoiceNumber}</span>
                            <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-muted-foreground">
                              {inv.rating}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-bold mt-0.5">
                            {inv.buyerName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-400">{formatIndianNumber(inv.amount)}</div>
                        <div className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider mt-0.5">
                          {inv.tenureDays} Days • Target Return: {(inv.discountRate * 100).toFixed(1)}% p.a.
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-muted-foreground">
                        <span>{progress}% Funded</span>
                        <span>{formatIndianNumber(inv.fundedAmount)} raised</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Calculator Panel */}
            <div className="lg:col-span-5 flex flex-col bg-white/5 rounded-[2rem] border border-white/10 p-5 justify-between min-h-[300px] text-left">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Active Selection</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Shield className="w-2.5 h-2.5" /> Checked
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-bold text-white uppercase tracking-wider">{selectedInvoice.invoiceNumber}</div>
                  <div className="text-xs text-muted-foreground font-semibold">{selectedInvoice.buyerName}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-black/25 rounded-2xl p-3 border border-white/5">
                  <div>
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Target Return</span>
                    <div className="text-sm font-bold text-white mt-0.5">{(selectedInvoice.discountRate * 100).toFixed(1)}% p.a. (Indicative)</div>
                  </div>
                  <div>
                    <span className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">Duration</span>
                    <div className="text-sm font-bold text-white mt-0.5">{selectedInvoice.tenureDays} Days</div>
                  </div>
                </div>

                {/* Slider Input */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center text-[10px] font-semibold uppercase tracking-wider">
                    <span className="text-muted-foreground">Simulate Ticket</span>
                    <span className="text-white">{formatIndianNumber(simulatedInvestment)}</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max={Math.min(100000, maxInvestmentPossible)}
                    step="5000"
                    value={simulatedInvestment}
                    onChange={(e) => setSimulatedInvestment(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-[8px] font-bold text-muted-foreground">
                    <span>Min ₹10k</span>
                    <span>Max ₹100k</span>
                  </div>
                </div>
              </div>

              {/* Yield Calculation Results */}
              <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Projected Return</span>
                    <span className="text-emerald-400 font-bold">+{formatIndianNumber(calculatedYield)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Due Date</span>
                    <span className="text-white font-bold">{getRepaymentDateStr(selectedInvoice.tenureDays)}</span>
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <div className="text-[8px] font-semibold uppercase tracking-wider text-primary/80">Total Return</div>
                    <div className="text-sm font-bold text-white mt-0.5">{formatIndianNumber(simulatedInvestment + calculatedYield)}</div>
                  </div>
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-primary">Simulated</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
