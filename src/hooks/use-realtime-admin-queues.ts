import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";

export function useRealtimeAdminQueues(isAdmin: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAdmin) return;

    const supabase = createClient();
    
    // Subscribe to all operational tables
    const channel = supabase
      .channel("admin-realtime-queues")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "kyc_requests" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-kyc-queue"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "invoices" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-invoice-queue"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "withdrawals" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_tickets" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "repayments" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["admin-settlements"] });
          queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, queryClient]);
}
