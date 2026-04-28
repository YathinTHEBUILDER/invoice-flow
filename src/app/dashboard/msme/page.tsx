import { createClient } from "@/lib/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, FileText, CheckCircle2, Clock, ArrowUpRight, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getMSMEAnalytics } from "@/actions/msme";
import { db } from "@/db";
import { activityLogs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";

export default async function MSMEDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  let analytics, recentActivity, userRecord;
  try {
    [analytics, recentActivity, userRecord] = await Promise.all([
      getMSMEAnalytics(user.id),
      db.query.activityLogs.findMany({
        where: eq(activityLogs.userId, user.id),
        orderBy: [desc(activityLogs.createdAt)],
        limit: 5,
      }),
      db.query.users.findFirst({
        where: eq(users.id, user.id)
      })
    ]);
  } catch (error) {
    console.error("MSME Dashboard data fetch error:", error);
  }

  const kycStatus = userRecord?.kycStatus || "pending";
  const safeAnalytics = {
    totalFunded: analytics?.totalFunded || "0.00",
    activeInvoices: analytics?.activeInvoices || 0,
    repaidSuccessfully: analytics?.repaidSuccessfully || 0,
    pendingRepayments: analytics?.pendingRepayments || "0.00",
  };

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back, {userRecord?.fullName?.split(' ')[0]}</h2>
          <p className="text-muted-foreground">Here's what's happening with your invoice financing today.</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard/msme/kyc">KYC Status: <span className="ml-2 capitalize font-bold text-primary">{kycStatus}</span></Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
            <Link href="/dashboard/msme/invoices/new">
              <FileText className="mr-2 h-4 w-4" />
              Upload New Invoice
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Funded</CardTitle>
            <div className="p-2 bg-primary/20 rounded-full">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatCurrency(safeAnalytics.totalFunded)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
              Lifetime liquidity unlocked
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Invoices</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeAnalytics.activeInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently on marketplace</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repaid Successfully</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{safeAnalytics.repaidSuccessfully}</div>
            <p className="text-xs text-muted-foreground mt-1 text-emerald-600">Completed obligations</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-amber-50/50 dark:bg-amber-950/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Repayments</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-full">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{formatCurrency(safeAnalytics.pendingRepayments)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1 text-amber-500" />
              Due in next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/msme/activity">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-muted rounded-full">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{activity.action.replace('_', ' ').toUpperCase()}</p>
                      <p className="text-xs text-muted-foreground">{activity.details}</p>
                      <p className="text-[10px] text-muted-foreground/60">{new Date(activity.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] flex flex-col items-center justify-center text-center space-y-3 p-6 border-2 border-dashed rounded-xl">
                <div className="p-3 bg-muted rounded-full">
                  <FileText className="h-6 w-6 text-muted-foreground/40" />
                </div>
                <div>
                  <p className="text-sm font-medium">No recent activity</p>
                  <p className="text-xs text-muted-foreground">Your recent actions will appear here.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-md overflow-hidden">
          <div className="h-2 bg-primary w-full" />
          <CardHeader>
            <CardTitle>Compliance & KYC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-muted-foreground/10">
              <div className={`p-2 rounded-full ${kycStatus === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {kycStatus === 'approved' ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">KYC Verification</p>
                <p className="text-xs text-muted-foreground capitalize">{kycStatus} - {kycStatus === 'approved' ? 'All features unlocked' : 'Pending review'}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider">Required Documents</p>
              <div className="space-y-2">
                {['PAN Card', 'GST Certificate', 'Bank Statement'].map((doc) => (
                  <div key={doc} className="flex items-center justify-between text-xs py-1 border-b border-muted/50 last:border-0">
                    <span>{doc}</span>
                    <span className="text-emerald-500 font-medium">Verified</span>
                  </div>
                ))}
              </div>
            </div>

            {kycStatus !== 'approved' && (
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/msme/kyc">Manage Documents</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
