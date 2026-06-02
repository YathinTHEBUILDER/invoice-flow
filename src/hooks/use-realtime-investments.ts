import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";

export function useRealtimeInvestments(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-investments-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investments",
          filter: `investor_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["investor-portfolio", userId] });
          queryClient.invalidateQueries({ queryKey: ["investor-stats", userId] });
          queryClient.invalidateQueries({ queryKey: ["marketplace-invoices"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
