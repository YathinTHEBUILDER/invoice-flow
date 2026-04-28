import { createClient } from "@/lib/server";
import { db } from "@/db";
import { investments, activityLogs, users, fundingRequests, invoices } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  Briefcase, 
  AlertCircle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getInvestorAnalytics } from "@/actions/investor";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default async function InvestorDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Initialize with safe defaults to prevent ReferenceErrors
  let analytics: any = null;
  let recentActivity: any[] = [];
  let activeInvestments: any[] = [];

  try {
    const [analyticsResult, activityResult, investmentsResult] = await Promise.all([
      getInvestorAnalytics(user.id),
      db.query.activityLogs.findMany({
        where: eq(activityLogs.userId, user.id),
        orderBy: [desc(activityLogs.createdAt)],
        limit: 5,
      }),
      db
        .select({
          id: investments.id,
          amount: investments.amount,
          createdAt: investments.createdAt,
          yieldRate: fundingRequests.yieldRate,
          invoiceNumber: invoices.invoiceNumber,
        })
        .from(investments)
        .innerJoin(fundingRequests, eq(investments.fundingRequestId, fundingRequests.id))
        .innerJoin(invoices, eq(fundingRequests.invoiceId, invoices.id))
        .where(and(eq(investments.investorId, user.id), eq(investments.status, 'active')))
        .limit(3)
    ]);

    analytics = analyticsResult;
    recentActivity = activityResult;
    activeInvestments = investmentsResult;
  } catch (error: any) {
    console.error("Investor Dashboard data fetch error:", error);
    // Continue rendering with defaults
  }

  const safeAnalytics = {
    totalInvested: analytics?.totalInvested || 0,
    activeInvestments: analytics?.activeInvestments || 0,
    walletBalance: analytics?.walletBalance || 0,
    expectedReturns: analytics?.expectedReturns || 0,
    totalReceived: analytics?.totalReceived || 0,
    defaultExposure: analytics?.defaultExposure || 0,
    kycStatus: analytics?.kycStatus || "pending",
  };

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Portfolio Overview</h2>
          <p className="text-muted-foreground">Manage your capital deployments and track your earnings.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild className="shadow-sm">
            <Link href="/dashboard/investor/wallet">
              <Wallet className="mr-2 h-4 w-4" />
              Wallet: {formatCurrency(safeAnalytics.walletBalance)}
            </Link>
          </Button>
          <Button asChild className="bg-primary shadow-lg shadow-primary/20 transition-all hover:translate-y-[-1px]">
            <Link href="/dashboard/investor/marketplace">
              <TrendingUp className="mr-2 h-4 w-4" />
              Explore Opportunities
            </Link>
          </Button>
        </div>
      </div>

      {safeAnalytics.kycStatus !== 'approved' && (
        <Card className="border-none bg-amber-500/10 text-amber-900 shadow-sm overflow-hidden">
          <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-full">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold">Action Required: Complete KYC</p>
                <p className="text-xs opacity-80 font-medium">Verification is required to start investing in invoices.</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="bg-white/50 border-amber-500/20" asChild>
              <Link href="/dashboard/investor/kyc">Verify Identity</Link>
            </Button>
          </div>
        </Card>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capital Deployed</CardTitle>
            <div className="p-2 bg-blue-500/20 rounded-full">
              <Briefcase className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(safeAnalytics.totalInvested)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-500" />
              {safeAnalytics.activeInvestments} Active Positions
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-md bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expected Returns</CardTitle>
            <div className="p-2 bg-emerald-500/20 rounded-full">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{formatCurrency(safeAnalytics.expectedReturns)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-500" />
              ~12.4% Average Yield
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Received</CardTitle>
            <div className="p-2 bg-slate-100 rounded-full dark:bg-slate-800">
              <CheckCircle2 className="h-4 w-4 text-slate-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(safeAnalytics.totalReceived)}</div>
            <p className="text-xs text-muted-foreground mt-1">Capital + Profit returned</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Default Exposure</CardTitle>
            <div className="p-2 bg-rose-500/10 rounded-full">
              <ShieldCheck className="h-4 w-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-500">{safeAnalytics.defaultExposure.toFixed(1)}%</div>
            <p className={`text-xs mt-1 font-medium ${safeAnalytics.defaultExposure > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {safeAnalytics.defaultExposure > 0 ? `${safeAnalytics.defaultExposure.toFixed(1)}% portfolio overdue` : 'No overdue payments'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Portfolio Activity</CardTitle>
              <CardDescription>Your latest investment events and movements.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/investor/portfolio">View Portfolio</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {activeInvestments && activeInvestments.length > 0 ? (
              <div className="space-y-6">
                {activeInvestments.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 bg-muted/5 group hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold">Invoice #{inv.invoiceNumber}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Yield: {inv.yieldRate}% p.a.</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(inv.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-4 border-2 border-dashed rounded-xl p-8">
                <div className="p-4 bg-muted rounded-full">
                  <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div>
                  <h3 className="font-bold">Ready to Grow Your Capital?</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">Start by browsing verified invoices on the marketplace and participate in fractional funding.</p>
                </div>
                <Button asChild size="sm" className="shadow-md shadow-primary/10">
                  <Link href="/dashboard/investor/marketplace">Browse Marketplace</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-md">
          <CardHeader>
            <CardTitle>System Activity</CardTitle>
            <CardDescription>Global platform events relevant to you.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-6">
                {recentActivity.map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="relative mt-1">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <div className="absolute top-2 left-[3.5px] w-[1px] h-full bg-muted-foreground/20" />
                    </div>
                    <div className="space-y-1 pb-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">{log.action.replace('_', ' ')}</p>
                      <p className="text-sm text-muted-foreground leading-snug">{log.details}</p>
                      <p className="text-[10px] text-muted-foreground/60">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-muted-foreground italic">
                No system activity recorded.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
