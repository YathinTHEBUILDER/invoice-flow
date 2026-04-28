import { db } from "@/db";
import { invoices, users, kycDocuments, fundingRequests, repayments, fraudFlags } from "@/db/schema";
import { eq, sql, count, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, FileText, AlertTriangle, TrendingUp, DollarSign, History } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  // 1. Initialize with safe defaults to prevent ReferenceErrors
  let stats = {
    totalInvoices: 0,
    pendingKyc: 0,
    activeInvestors: 0,
    liquidityValue: 0,
    repaidValue: 0,
    activeFraudFlags: 0,
  };
  let recentLogs: any[] = [];

  try {
    const [
      totalInvoicesResult,
      pendingKycResult,
      activeInvestorsResult,
      totalFundingResult,
      totalRepaidResult,
      activeFraudFlagsResult,
      auditLogsResult
    ] = await Promise.all([
      db.select({ value: count() }).from(invoices),
      db.select({ value: count() }).from(kycDocuments).where(eq(kycDocuments.status, "pending")),
      db.select({ value: count() }).from(users).where(eq(users.role, "investor")),
      db.select({ sum: sql<string>`sum(${fundingRequests.requestedAmount})` }).from(fundingRequests).where(eq(fundingRequests.status, "filled")),
      db.select({ sum: sql<string>`sum(${repayments.amount})` }).from(repayments).where(eq(repayments.status, "completed")),
      db.select({ value: count() }).from(fraudFlags).where(eq(fraudFlags.status, "active")),
      db.query.auditLogs.findMany({
        limit: 5,
        orderBy: [desc(sql`created_at`)]
      })
    ]);

    stats = {
      totalInvoices: totalInvoicesResult[0]?.value || 0,
      pendingKyc: pendingKycResult[0]?.value || 0,
      activeInvestors: activeInvestorsResult[0]?.value || 0,
      liquidityValue: parseFloat(totalFundingResult[0]?.sum || "0"),
      repaidValue: parseFloat(totalRepaidResult[0]?.sum || "0"),
      activeFraudFlags: activeFraudFlagsResult[0]?.value || 0,
    };
    recentLogs = auditLogsResult;
  } catch (error) {
    console.error("Admin Dashboard data fetch error:", error);
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Platform Control Center</h2>
        <div className="flex items-center gap-2">
           <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">System Online</span>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity Unlocked</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(stats.liquidityValue / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Across all funded invoices</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending KYC</CardTitle>
            <Users className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingKyc}</div>
            <p className="text-xs text-muted-foreground">Applications awaiting review</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investors</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.activeInvestors}</div>
            <p className="text-xs text-muted-foreground">Institutional & individual</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Repayment Rate</CardTitle>
            <Activity className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.liquidityValue > 0 ? ((stats.repaidValue / stats.liquidityValue) * 100).toFixed(1) : 100}%</div>
            <p className="text-xs text-muted-foreground">Platform health metric</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-xl shadow-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Platform Audit Logs</CardTitle>
              <CardDescription>Latest administrative actions across the system.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/audit">View Full Audit</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentLogs.length > 0 ? (
              <div className="space-y-4 pt-2">
                {recentLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30 border border-muted-foreground/5 group hover:bg-muted/50 transition-colors">
                    <div className="p-2 bg-white dark:bg-black/20 rounded-md shadow-sm">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold uppercase tracking-widest text-primary">{log.action.replace('_', ' ')}</p>
                      <p className="text-sm font-medium">{log.entityType.charAt(0).toUpperCase() + log.entityType.slice(1)}: {log.entityId.slice(0, 8)}...</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground italic text-sm">
                No administrative actions recorded yet.
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Compliance & Risk</CardTitle>
            <CardDescription>Critical monitoring metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
             <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-muted-foreground/5">
                <div className="flex items-center gap-3">
                   <FileText className="h-5 w-5 text-primary" />
                   <span className="text-sm font-bold">Total Managed Invoices</span>
                </div>
                <span className="font-black">{stats.totalInvoices}</span>
             </div>
             <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-muted-foreground/5">
                <div className="flex items-center gap-3">
                   <AlertTriangle className="h-5 w-5 text-destructive" />
                   <span className="text-sm font-bold">Active Fraud Flags</span>
                </div>
                <span className="font-black text-destructive">{stats.activeFraudFlags}</span>
             </div>
             
             <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full justify-start h-12 font-bold" asChild>
                  <Link href="/dashboard/admin/fraud">
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                    Review Risk Reports
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 font-bold" asChild>
                  <Link href="/dashboard/admin/users">
                    <Users className="mr-2 h-4 w-4 text-blue-500" />
                    Manage Participants
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 font-bold" asChild>
                  <Link href="/dashboard/admin/system-checks">
                    <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" />
                    System Health
                  </Link>
                </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
