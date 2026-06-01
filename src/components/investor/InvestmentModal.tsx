/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/lib/utils";
import { 
  ShieldCheck, 
  TrendingUp, 
  Loader2, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { fundInvoiceAction } from "@/app/actions/investor";
import { toast } from "sonner";

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  userBalance: number;
  onSuccess: () => void;
}

export function InvestmentModal({ isOpen, onClose, invoice, userBalance, onSuccess }: InvestmentModalProps) {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(false);

  const remainingToFund = Number(invoice?.verified_amount || invoice?.amount) - Number(invoice?.funded_amount || 0);
  const minInvestment = Number(invoice?.min_investment || 10000);

  useEffect(() => {
    if (!isOpen) {
      setAmount("");
      setIsSuccess(false);
      setLoading(false);
      setAcceptedRisk(false);
    }
  }, [isOpen]);

  const tenure = invoice?.tenure_days || 45;
  const yieldRate = (invoice?.discount_rate || 0.12) * 100;
  
  const numAmount = Number(amount) || 0;
  const yieldRateRaw = (invoice?.discount_rate || 0.145);
  const discountAmount = Math.round(numAmount * yieldRateRaw * (tenure / 365));
  
  // New Rules:
  // Investor deploys: Face Value - Discount
  const payableAmount = numAmount - discountAmount;
  const estYield = discountAmount;
  
  // Investor ROI (p.a.): (Profit / Deployed) * (365 / Tenure) * 100
  const annualizedROI = payableAmount > 0 ? (estYield / payableAmount) * (365 / tenure) * 100 : 0;

  async function handleInvest() {
    if (!acceptedRisk) {
      toast.error("Risk Consent Required", {
        description: "You must accept the risk disclosure before investing."
      });
      return;
    }

    if (numAmount < minInvestment) {
      toast.error("Investment Floor", {
        description: `Minimum participation for this asset is ${formatINR(minInvestment)}.`
      });
      return;
    }

    if (numAmount > remainingToFund) {
      toast.error("Cap Exceeded", {
        description: "Amount exceeds remaining funding requirement."
      });
      return;
    }

    if (payableAmount > userBalance) {
      toast.error("Cash Shortfall", {
        description: `You need ${formatINR(payableAmount)} to purchase this face value. Available: ${formatINR(userBalance)}`
      });
      return;
    }

    setLoading(true);
    try {
      const result = await fundInvoiceAction({ 
        invoiceId: invoice.id, 
        amount: numAmount // Sending the Face Value to the RPC
      });

      if (result?.data?.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        throw new Error(result?.serverError || "Investment failed");
      }
    } catch (error: any) {
      toast.error("Deployment Error", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="glass-dark border-white/10 sm:max-w-[450px] p-12 text-center space-y-6">
          <div className="mx-auto w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Money Invested</h2>
            <p className="text-muted-foreground font-medium italic">Your participation has been successfully recorded on the record.</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Face Value Secured</p>
            <p className="text-2xl font-black text-white italic">{formatINR(amount)}</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-dark border-white/10 sm:max-w-[500px] p-0 overflow-hidden">
        <div className="p-8 space-y-8">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary" /> Invest Money
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium italic text-base">
              Participating in Invoice #{invoice?.invoice_number} by {invoice?.profiles?.company_name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Yield</p>
              <p className="text-xl font-black text-emerald-400 italic">~{yieldRate.toFixed(1)}% p.a.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</p>
              <p className="text-xl font-black text-white italic">{tenure} Days</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Face Value to Purchase</Label>
                <div className="text-right">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Cash</p>
                   <p className="text-sm font-black text-white italic">{formatINR(userBalance)}</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-white/20 italic">₹</span>
                <Input 
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-16 pl-10 bg-white/5 border-white/10 text-2xl font-black text-white italic rounded-2xl focus:ring-primary focus:border-primary"
                />
                <Button 
                  onClick={() => setAmount(remainingToFund.toString())}
                  variant="ghost" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 px-4 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[9px] rounded-xl"
                >
                  Max Capacity
                </Button>
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span className="text-muted-foreground">Min participation: {formatINR(minInvestment)}</span>
                <span className="text-muted-foreground">Asset Capacity: {formatINR(remainingToFund)}</span>
              </div>
            </div>

            {numAmount > 0 && (
              <div className="p-6 rounded-[24px] bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Participation</span>
                   <span className="text-xl font-black text-white italic">{formatINR(payableAmount)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                   <div className="space-y-1">
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">Est. Return</span>
                      <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">~{annualizedROI.toFixed(1)}% ROI p.a.</span>
                   </div>
                   <span className="text-xl font-black text-emerald-400 italic">+{formatINR(estYield)}</span>
                </div>
                <div className="pt-2 text-center mt-2">
                   <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">You invest {formatINR(payableAmount)} (Discounted) to receive {formatINR(numAmount)} (Face Value) after {tenure} days.</p>
                </div>
              </div>
            )}

            {/* Risk Consent Checkbox */}
            <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 p-4 rounded-2xl">
              <input 
                type="checkbox" 
                id="accept-risk" 
                checked={acceptedRisk} 
                onChange={(e) => setAcceptedRisk(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary accent-primary cursor-pointer" 
              />
              <label htmlFor="accept-risk" className="text-[10px] text-muted-foreground font-semibold leading-relaxed cursor-pointer select-none">
                I understand that returns are not guaranteed and repayment depends on buyer payment. Investments carry default and payment delay risk.
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white/[0.02] border-t border-white/5 p-8 flex flex-col space-y-4">
          <div className="flex items-center gap-3 text-muted-foreground/60 italic">
            <ShieldCheck className="w-5 h-5 text-emerald-500/40" />
            <p className="text-[10px] font-black uppercase tracking-widest">Professional-grade security. Transaction recorded on permanent record.</p>
          </div>
          <Button 
            onClick={handleInvest}
            disabled={loading || !amount || numAmount < minInvestment || numAmount > remainingToFund || payableAmount > userBalance || !acceptedRisk}
            className="h-16 w-full bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-white/5 flex items-center justify-center gap-3 group disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Confirm Investment <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
