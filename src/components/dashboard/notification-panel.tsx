"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "./notification-item";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationPanel({ initialNotifications = [] }: { initialNotifications?: any[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    // In a real app, call a server action here to update DB
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center border-2 border-background">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 shadow-2xl border-none overflow-hidden" align="end">
        <div className="bg-primary/5 p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">Notifications</h3>
            <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          </div>
        </div>
        <ScrollArea className="h-[350px]">
          {notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <NotificationItem 
                  key={n.id} 
                  notification={n} 
                  onRead={markAsRead} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-2">
              <Bell className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">All caught up!</p>
              <p className="text-xs text-muted-foreground/60">No new notifications.</p>
            </div>
          )}
        </ScrollArea>
        <div className="p-2 border-t bg-muted/20">
          <Button variant="ghost" size="sm" className="w-full text-xs h-8">
            View All Notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
