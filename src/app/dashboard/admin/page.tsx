import { db } from "@/db";
import { invoices, users, kycDocuments, fundingRequests, repayments } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, FileText, AlertTriangle, TrendingUp, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
  // 1. Initialize with safe defaults to prevent ReferenceErrors
  let stats = {
    totalInvoices: 0,
    pendingKyc: 0,
    activeInvestors: 0,
    liquidityValue: 0,
    repaidValue: 0
  };

  try {
    const [
      totalInvoicesResult,
      pendingKycResult,
      activeInvestorsResult,
      totalFundingResult,
      totalRepaidResult
    ] = await Promise.all([
      db.select({ value: count() }).from(invoices),
      db.select({ value: count() }).from(kycDocuments).where(eq(kycDocuments.status, "pending")),
      db.select({ value: count() }).from(users).where(eq(users.role, "investor")),
      db.select({ sum: sql<string>`sum(${fundingRequests.requestedAmount})` }).from(fundingRequests).where(eq(fundingRequests.status, "filled")),
      db.select({ sum: sql<string>`sum(${repayments.amount})` }).from(repayments).where(eq(repayments.status, "completed"))
    ]);

    stats = {
      totalInvoices: totalInvoicesResult[0]?.value || 0,
      pendingKyc: pendingKycResult[0]?.value || 0,
      activeInvestors: activeInvestorsResult[0]?.value || 0,
      liquidityValue: parseFloat(totalFundingResult[0]?.sum || "0"),
      repaidValue: parseFloat(totalRepaidResult[0]?.sum || "0")
    };
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
          <CardHeader>
            <CardTitle>System Integrity Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
               <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                     <FileText className="h-5 w-5 text-primary" />
                     <span className="font-medium">Total Managed Invoices</span>
                  </div>
                  <span className="font-bold">{stats.totalInvoices}</span>
               </div>
               <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-3">
                     <AlertTriangle className="h-5 w-5 text-destructive" />
                     <span className="font-medium">Active Fraud Flags</span>
                  </div>
                  <span className="font-bold text-destructive">0</span>
               </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Admin Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2 pt-4">
             <Button variant="outline" className="justify-start h-12">View Risk Reports</Button>
             <Button variant="outline" className="justify-start h-12">Export Platform Ledger</Button>
             <Button variant="outline" className="justify-start h-12 text-destructive hover:text-destructive">Emergency Lockdown</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
