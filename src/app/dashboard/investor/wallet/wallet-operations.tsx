"use client";

import { useState, useTransition } from "react";
import { handleWalletOperationAction } from "@/actions/investor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Plus, 
  Minus, 
  Loader2, 
  IndianRupee, 
  ArrowUpRight, 
  ArrowDownRight 
} from "lucide-react";

export function WalletOperations() {
  const [amount, setAmount] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOperation = async (type: "deposit" | "withdrawal") => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Invalid Amount", {
        description: "Please enter a positive numeric value.",
      });
      return;
    }

    startTransition(async () => {
      const result = await handleWalletOperationAction({
        amount,
        type,
      });

      if (result?.data?.success) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} Successful`, {
          description: `₹${parseFloat(amount).toLocaleString()} has been ${type}ed successfully.`,
        });
        setAmount("");
        router.refresh();
      } else {
        toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} Failed`, {
          description: result?.data?.error || "An error occurred during the transaction.",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Transaction Amount</label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isPending}
            className="h-12 pl-10 text-lg font-bold bg-white/50 dark:bg-black/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button 
          variant="outline" 
          onClick={() => handleOperation("deposit")} 
          disabled={isPending || !amount}
          className="h-12 font-bold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all group"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <>
              <ArrowUpRight className="mr-2 h-4 w-4 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              Deposit
            </>
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => handleOperation("withdrawal")} 
          disabled={isPending || !amount}
          className="h-12 font-bold border-rose-500/20 hover:bg-rose-500/5 hover:text-rose-600 transition-all group"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : (
            <>
              <ArrowDownRight className="mr-2 h-4 w-4 text-rose-500 group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-transform" />
              Withdraw
            </>
          )}
        </Button>
      </div>

      <div className="p-3 bg-muted/50 rounded-xl flex items-start gap-3">
        <div className="p-1.5 bg-primary/10 rounded-full mt-0.5">
          <Plus className="h-3 w-3 text-primary" />
        </div>
        <p className="text-[10px] text-muted-foreground leading-snug">
          Deposits are typically instant via UPI/NetBanking. Withdrawals are subject to verification and bank processing times.
        </p>
      </div>
    </div>
  );
}
