"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { repayInvoiceAction } from "@/actions/msme";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RepayButtonProps {
  repaymentId: string;
  amount: number;
}

export function RepayButton({ repaymentId, amount }: RepayButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRepay = async () => {
    if (!confirm(`Are you sure you want to repay ₹${amount.toLocaleString()}? This will be deducted from your wallet.`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await repayInvoiceAction({ repaymentId });
      
      if (result?.data?.success) {
        toast.success("Repayment successful!");
        router.refresh();
      } else {
        toast.error(result?.data?.error || "Repayment failed.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      className="shadow-md shadow-primary/10"
      onClick={handleRepay}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
      Pay Now
    </Button>
  );
}
