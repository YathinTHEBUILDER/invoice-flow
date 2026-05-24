"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShieldCheck, 
  TrendingUp,
  X,
  MailOpen,
  Loader2
} from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getMyNotifications, markAsRead } from "@/app/actions/notifications";
import { createClient } from "@/lib/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();

    // Set up realtime subscription
    const supabase = createClient();
    
    async function setupRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel(`user-notifications-${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            fetchNotifications();
            // Trigger a toast alert for the new notification
            import("sonner").then(({ toast }) => {
              toast(payload.new.title, {
                description: payload.new.message,
                action: payload.new.link ? {
                  label: "View",
                  onClick: () => window.location.href = payload.new.link
                } : undefined
              });
            });
          }
        )
        .subscribe();

      return channel;
    }

    let activeChannel: any;
    setupRealtime().then(channel => activeChannel = channel);

    return () => {
      if (activeChannel) supabase.removeChannel(activeChannel);
    };
  }, []);

  async function fetchNotifications() {
    try {
      const data = await getMyNotifications();
      setNotifications(data || []);
      setUnreadCount(data?.filter((n: any) => !n.is_read).length || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "warning": return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "error": return <X className="w-4 h-4 text-red-500" />;
      case "kyc": return <ShieldCheck className="w-4 h-4 text-blue-500" />;
      case "funding": return <TrendingUp className="w-4 h-4 text-primary" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger className="relative hover:bg-white/5 rounded-full h-10 w-10 flex items-center justify-center group transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-white transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full border border-background animate-pulse" />
          )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 glass-dark border-white/10 shadow-2xl mr-4 mt-2 overflow-hidden" align="end">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest">
              {unreadCount} New
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 px-6 text-center">
              <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                <MailOpen className="w-8 h-8 text-white/10" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-white italic">No Notifications</p>
                <p className="text-[10px] text-muted-foreground font-medium italic">You're all caught up with the platform updates.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 hover:bg-white/[0.02] transition-colors cursor-pointer group relative ${!notif.is_read ? 'bg-primary/[0.02]' : ''}`}
                  onClick={() => {
                    if (!notif.is_read) handleMarkAsRead(notif.id);
                    if (notif.link) {
                      setIsOpen(false);
                      window.location.href = notif.link;
                    }
                  }}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-xl border shrink-0 ${!notif.is_read ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={`text-[11px] font-black italic truncate ${!notif.is_read ? 'text-white' : 'text-muted-foreground'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[8px] font-bold text-muted-foreground uppercase shrink-0 mt-0.5">
                          {formatDate(notif.created_at)}
                        </p>
                      </div>
                      <p className={`text-[10px] font-medium leading-relaxed line-clamp-2 ${!notif.is_read ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <Link 
          href="/msme/notifications" 
          onClick={() => setIsOpen(false)}
          className="block p-4 text-center border-t border-white/5 hover:bg-white/5 transition-colors"
        >
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:text-white transition-colors">
            View All Alerts
          </span>
        </Link>
      </PopoverContent>
    </Popover>
  );
}
