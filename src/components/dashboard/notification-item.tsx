"use client";

import { Bell, Clock, Info, CheckCircle2, AlertCircle, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "system" | "payment" | "funding" | "kyc" | "security";
  isRead: boolean;
  createdAt: Date;
  link?: string;
}

export function NotificationItem({ notification, onRead }: { notification: Notification, onRead?: (id: string) => void }) {
  const getIcon = (type: string) => {
    switch (type) {
      case "payment": return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
      case "funding": return <Info className="h-4 w-4 text-blue-500" />;
      case "kyc": return <Shield className="h-4 w-4 text-primary" />;
      case "security": return <AlertCircle className="h-4 w-4 text-destructive" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div 
      className={cn(
        "p-4 flex gap-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0",
        !notification.isRead && "bg-primary/5"
      )}
      onClick={() => onRead?.(notification.id)}
    >
      <div className={cn(
        "mt-1 p-2 rounded-full h-fit",
        !notification.isRead ? "bg-primary/20" : "bg-muted"
      )}>
        {getIcon(notification.type)}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm font-semibold", !notification.isRead ? "text-foreground" : "text-muted-foreground")}>
            {notification.title}
          </p>
          {!notification.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
        <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1" suppressHydrationWarning={true}>
          <Clock className="h-3 w-3" />
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
