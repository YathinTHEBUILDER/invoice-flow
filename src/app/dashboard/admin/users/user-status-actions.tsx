"use client";

import { useState } from "react";
import { toggleUserSuspensionAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export function UserStatusActions({ userId, isSuspended }: { userId: string, isSuspended: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    const reason = isSuspended ? "" : prompt("Enter reason for suspension:");
    if (!isSuspended && !reason) return;

    setLoading(true);
    const result = await toggleUserSuspensionAction({
      userId,
      isSuspended: !isSuspended,
      reason: reason || undefined,
    });
    if (!result?.data?.success) alert(result?.data?.error);
    setLoading(false);
  };

  return (
    <Button 
      variant={isSuspended ? "outline" : "destructive"} 
      size="sm" 
      onClick={handleToggle}
      disabled={loading}
      className="h-8"
    >
      {isSuspended ? (
        <><ShieldCheck className="mr-1 h-3 w-3" /> Reactivate</>
      ) : (
        <><ShieldAlert className="mr-1 h-3 w-3" /> Suspend</>
      )}
    </Button>
  );
}
