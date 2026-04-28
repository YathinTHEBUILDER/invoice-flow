"use client";

import { useState } from "react";
import { verifyInvoiceAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { toast } from "sonner";


export function InvoiceApprovalActions({ invoiceId }: { invoiceId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAction = async (status: "approved" | "rejected") => {
    let reason = "";
    if (status === "rejected") {
      // For now, keeping it simple but using a better feedback loop
      reason = "Audit verification failed."; 
    }

    setLoading(true);
    const result = await verifyInvoiceAction({
      invoiceId,
      status,
      rejectionReason: reason || undefined,
    });

    if (result?.data?.success) {
      toast.success(`Invoice ${status} successfully.`);
    } else {
      toast.error(result?.data?.error || "Action failed.");
    }
    setLoading(false);
  };


  return (
    <div className="space-y-2">
      <Button 
        onClick={() => handleAction("approved")} 
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
      >
        <ShieldCheck className="mr-2 h-4 w-4" /> Approve Asset
      </Button>
      <Button 
        variant="destructive" 
        onClick={() => handleAction("rejected")} 
        disabled={loading}
        className="w-full"
      >
        <ShieldAlert className="mr-2 h-4 w-4" /> Reject Invoice
      </Button>
    </div>
  );
}
