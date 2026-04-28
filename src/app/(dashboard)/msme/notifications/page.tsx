"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { createClient } from "@/lib/client";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
    }
    setLoading(false);
  }

  const markAsRead = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    
    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "error": return <X className="w-5 h-5 text-red-500" />;
      case "kyc": return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case "funding": return <TrendingUp className="w-5 h-5 text-primary" />;
      default: return <Info className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Notifications</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Stay updated with platform events and compliance status.</p>
        </div>
        <Button 
          variant="outline" 
          className="h-12 border-white/10 text-white font-black uppercase tracking-widest text-[10px]"
          onClick={() => {
            notifications.forEach(n => !n.is_read && markAsRead(n.id));
          }}
        >
          Mark all as read
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card className="glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black italic">Platform Inbox</CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">
                {notifications.filter(n => !n.is_read).length} Unread Messages
              </CardDescription>
            </div>
            <Bell className="w-6 h-6 text-muted-foreground/20" />
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Accessing Secure Comms...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-32 space-y-6">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                  <MailOpen className="w-10 h-10 text-white/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black text-xl italic">Inbox Empty</p>
                  <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">You're all caught up! Important updates will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-8 flex items-start gap-6 hover:bg-white/[0.01] transition-all cursor-pointer group relative ${!notif.is_read ? 'bg-primary/[0.02]' : ''}`}
                    onClick={() => !notif.is_read && markAsRead(notif.id)}
                  >
                    {!notif.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    <div className={`mt-1 p-3 rounded-2xl border ${!notif.is_read ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-white/10'}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-lg font-black italic ${!notif.is_read ? 'text-white' : 'text-muted-foreground'}`}>{notif.title}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(notif.created_at).toLocaleDateString()}</p>
                      </div>
                      <p className={`text-sm font-medium leading-relaxed ${!notif.is_read ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {notif.message}
                      </p>
                      {!notif.is_read && (
                        <div className="pt-2">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase tracking-widest">New</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
