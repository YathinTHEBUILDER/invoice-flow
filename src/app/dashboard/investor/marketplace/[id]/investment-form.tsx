"use client";

import { useState, useTransition } from "react";
import { investInInvoiceAction } from "@/actions/investor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Loader2, IndianRupee, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InvestmentFormProps {
  fundingRequestId: string;
  remainingLimit: number;
  yieldRate: number;
  tenureDays: number;
  kycStatus: string;
}

export function InvestmentForm({ fundingRequestId, remainingLimit, yieldRate, tenureDays, kycStatus }: InvestmentFormProps) {
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isKycApproved = kycStatus === "approved";

  const handleInvest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isKycApproved) {
      toast.error("KYC Required", {
        description: "Your KYC must be approved before you can invest.",
      });
      return;
    }

    if (remainingLimit <= 0) return;

    startTransition(async () => {
      const result = await investInInvoiceAction({
        fundingRequestId,
        amount,
      });

      if (result?.data?.success) {
        toast.success("Investment Successful", {
          description: `You have successfully invested ₹${parseFloat(amount).toLocaleString()} in this invoice.`,
        });
        setAmount("");
        router.refresh();
      } else {
        toast.error("Investment Failed", {
          description: result?.data?.error || "An unexpected error occurred while processing your investment.",
        });
      }
    });
  };

  const estimatedReturn = amount ? (parseFloat(amount) * (yieldRate / 100) * (tenureDays / 365)).toFixed(2) : "0.00";

  return (
    <form onSubmit={handleInvest} className="space-y-6">
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
          </div>
          <Input
            type="number"
            placeholder="Min participation ₹1,000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending || remainingLimit <= 0 || !isKycApproved}
            className="h-14 pl-10 text-xl font-bold bg-white/50 dark:bg-black/20 border-primary/10 focus:border-primary/30 transition-all"
            min="1000"
            max={remainingLimit}
          />
        </div>
        
        {!isKycApproved && (
           <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
             <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
             <p className="text-[10px] font-bold text-amber-700 leading-tight">
               Your KYC is currently {kycStatus.toUpperCase()}. Investment is restricted until verification is complete.
             </p>
           </div>
        )}

        {isKycApproved && amount && !isNaN(parseFloat(amount)) && (
          <div className="flex items-center justify-between px-2 py-3 bg-primary/5 rounded-lg border border-primary/10 animate-in fade-in slide-in-from-top-1">
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Est. Return ({tenureDays} Days)</p>
              <p className="text-sm font-black text-primary">₹{estimatedReturn}</p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Payback</p>
              <p className="text-sm font-black">₹{(parseFloat(amount) + parseFloat(estimatedReturn)).toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Button 
          type="submit" 
          className="w-full h-14 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
          disabled={isPending || !amount || parseFloat(amount) < 1000 || remainingLimit <= 0 || !isKycApproved}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : !isKycApproved ? (
            "KYC Approval Required"
          ) : remainingLimit <= 0 ? (
            "Round Fully Funded"
          ) : (
            <>
              <ShieldCheck className="mr-2 h-5 w-5" />
              Confirm Participation
            </>
          )}
        </Button>
        
        <p className="text-[9px] text-center text-muted-foreground uppercase tracking-tighter leading-tight font-medium">
          By clicking, you agree to the participation terms and capital lock-in period.
        </p>
      </div>
    </form>
  );
}
