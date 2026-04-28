"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X, FileText, Loader2, ExternalLink } from "lucide-react";
import { reviewKycDocumentAction, getSignedKycUrlAction } from "@/actions/kyc";
import { toast } from "sonner";

interface KycActionButtonsProps {
  docId: string;
  userId: string;
  filePath: string;
}

export function KycActionButtons({ docId, userId, filePath }: KycActionButtonsProps) {
  const [loading, setLoading] = useState<"approve" | "reject" | "view" | null>(null);

  const handleView = async () => {
    setLoading("view");
    const result = await getSignedKycUrlAction({ filePath });
    if (result?.data?.success && result.data.signedUrl) {
      window.open(result.data.signedUrl, "_blank");
    } else {
      toast.error("Failed to generate access link.");
    }
    setLoading(null);
  };

  const handleAction = async (status: "approved" | "rejected") => {
    setLoading(status === "approved" ? "approve" : "reject");
    const result = await reviewKycDocumentAction({
      documentId: docId,
      userId: userId,
      status: status,
      rejectionReason: status === "rejected" ? "Manually rejected by admin during audit." : undefined
    });

    if (result?.data?.success) {
      toast.success(`Document ${status} successfully.`);
    } else {
      toast.error(result?.data?.error || "Action failed.");
    }
    setLoading(null);
  };

  return (
    <div className="flex items-center gap-3">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleView}
        disabled={!!loading}
      >
        {loading === "view" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
        View
      </Button>
      
      <Button 
        size="sm" 
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        onClick={() => handleAction("approved")}
        disabled={!!loading}
      >
        {loading === "approve" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="mr-1 h-4 w-4" />}
        Approve
      </Button>
      
      <Button 
        size="sm" 
        variant="destructive" 
        className="font-bold"
        onClick={() => handleAction("rejected")}
        disabled={!!loading}
      >
        {loading === "reject" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="mr-1 h-4 w-4" />}
        Reject
      </Button>
    </div>
  );
}
