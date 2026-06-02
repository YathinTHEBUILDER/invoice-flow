import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";

export function useRealtimeInvoices(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-invoices-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "invoices",
          filter: `msme_id=eq.${userId}`,
        },
        (payload) => {
          const queryKey = ["msme-invoices", userId];
          const statsKey = ["msme-stats", userId];

          if (payload.eventType === "INSERT") {
            queryClient.setQueryData(queryKey, (old: any[] = []) => {
              if (old.some((item) => item.id === payload.new.id)) return old;
              return [payload.new, ...old];
            });
          } else if (payload.eventType === "UPDATE") {
            queryClient.setQueryData(queryKey, (old: any[] = []) =>
              old.map((item) => (item.id === payload.new.id ? payload.new : item))
            );
          } else if (payload.eventType === "DELETE") {
            queryClient.setQueryData(queryKey, (old: any[] = []) =>
              old.filter((item) => item.id !== payload.old.id)
            );
          }

          // Always invalidate stats so they refetch in background
          queryClient.invalidateQueries({ queryKey: statsKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
