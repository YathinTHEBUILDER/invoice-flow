import { createClient } from "@/lib/server";
import { db } from "@/db";
import { users, activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Mail,
  User, 
  Building2, 
  Shield, 
  Bell, 
  Key, 
  LogOut,
  Clock,
  Globe
} from "lucide-react";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MSMESettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });

  const recentActivity = await db.query.activityLogs.findMany({
    where: eq(activityLogs.userId, user.id),
    orderBy: [desc(activityLogs.createdAt)],
    limit: 10,
  });

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
          <p className="text-muted-foreground">Manage your profile, security preferences, and account activity.</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">Profile Details</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-background">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background">Notifications</TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-background">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your contact details and full name.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Full Name</label>
                  <Input defaultValue={userRecord?.fullName} className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Email Address</label>
                  <Input defaultValue={userRecord?.email} disabled className="bg-muted/30 opacity-70" />
                </div>
                <Button className="w-full mt-2">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Business Details
                </CardTitle>
                <CardDescription>Configure your company information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Company Name</label>
                  <Input defaultValue={userRecord?.companyName || ""} className="bg-muted/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Registration ID</label>
                  <Input placeholder="Enter GSTIN/Udyam" className="bg-muted/30" />
                </div>
                <Button variant="outline" className="w-full mt-2">Update Company Info</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-none shadow-md max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Security & Access
              </CardTitle>
              <CardDescription>Manage your password and authentication methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Change Password</p>
                  <p className="text-xs text-muted-foreground">Update your account password regularly.</p>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-muted-foreground/5">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-muted-foreground/5">
                <div className="space-y-0.5 text-destructive">
                  <p className="text-sm font-semibold">Delete Account</p>
                  <p className="text-xs opacity-70">Permanently remove your account and data.</p>
                </div>
                <Button variant="destructive" size="sm">Deactivate</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Login & Action History
              </CardTitle>
              <CardDescription>A complete log of all activities performed on this account.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Event</th>
                      <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Details</th>
                      <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Date & Time</th>
                      <th className="p-4 text-xs font-bold uppercase text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentActivity.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/5 transition-colors">
                        <td className="p-4">
                          <Badge variant="outline" className="capitalize font-bold text-[10px]">{log.action.replace('_', ' ')}</Badge>
                        </td>
                        <td className="p-4 text-xs text-muted-foreground">{log.details || "-"}</td>
                        <td className="p-4 text-xs font-medium">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase">
                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Success
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
