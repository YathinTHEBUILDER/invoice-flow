import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/client";

export function useRealtimeNotifications(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const queryKey = ["notifications", userId];

          if (payload.eventType === "INSERT") {
            queryClient.setQueryData(queryKey, (old: any[] = []) => {
              if (old.some((item) => item.id === payload.new.id)) return old;
              return [payload.new, ...old];
            });

            // Trigger a toast alert for the new notification
            import("sonner").then(({ toast }) => {
              toast(payload.new.title, {
                description: payload.new.message,
                action: payload.new.link ? {
                  label: "View",
                  onClick: () => {
                    window.location.href = payload.new.link;
                  }
                } : undefined
              });
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);
}
