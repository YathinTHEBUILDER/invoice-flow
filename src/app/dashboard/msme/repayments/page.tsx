import { createClient } from "@/lib/server";
import { db } from "@/db";
import { repayments, fundingRequests, invoices } from "@/db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowUpRight,
  ShieldCheck,
  History
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { RepayButton } from "./repay-button";

export default async function MSMERepaymentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const msmeRepayments = await db
    .select({
      id: repayments.id,
      amount: repayments.amount,
      dueDate: repayments.dueDate,
      paidAt: repayments.paidAt,
      status: repayments.status,
      invoiceNumber: invoices.invoiceNumber,
      fundingRequestId: fundingRequests.id,
    })
    .from(repayments)
    .innerJoin(fundingRequests, eq(repayments.fundingRequestId, fundingRequests.id))
    .innerJoin(invoices, eq(fundingRequests.invoiceId, invoices.id))
    .where(eq(invoices.msmeId, user.id))
    .orderBy(asc(repayments.dueDate));

  const pending = msmeRepayments.filter(r => r.status === 'pending' || r.status === 'overdue');
  const completed = msmeRepayments.filter(r => r.status === 'completed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Upcoming</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Paid</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Repayment Schedule</h2>
          <p className="text-muted-foreground">Monitor and manage your financial obligations and repayment history.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Upcoming Repayments</CardTitle>
                <CardDescription>Payments due in the near future.</CardDescription>
              </div>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {pending.length > 0 ? (
                <div className="space-y-4">
                  {pending.map((repayment) => (
                    <div key={repayment.id} className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 bg-muted/5 hover:bg-muted/10 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${repayment.status === 'overdue' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">Invoice #{repayment.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Due on {new Date(repayment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {repayment.status === 'overdue' && <span className="text-destructive font-bold ml-2">• OVERDUE</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-bold text-base">{formatCurrency(repayment.amount)}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Total Amount</p>
                        </div>
                        <RepayButton 
                          repaymentId={repayment.id} 
                          amount={parseFloat(repayment.amount)} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                  <div className="p-3 bg-emerald-500/10 rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium">No pending repayments!</p>
                  <p className="text-xs text-muted-foreground">You are all caught up on your obligations.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-muted-foreground" />
                Repayment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {completed.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="p-4 text-xs font-semibold uppercase text-muted-foreground">Reference</th>
                      <th className="p-4 text-xs font-semibold uppercase text-muted-foreground">Amount Paid</th>
                      <th className="p-4 text-xs font-semibold uppercase text-muted-foreground">Paid On</th>
                      <th className="p-4 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {completed.map((repayment) => (
                      <tr key={repayment.id} className="hover:bg-muted/5 transition-colors">
                        <td className="p-4 text-sm font-medium">Inv #{repayment.invoiceNumber}</td>
                        <td className="p-4 text-sm font-bold text-emerald-600">{formatCurrency(repayment.amount)}</td>
                        <td className="p-4 text-xs text-muted-foreground">{repayment.paidAt ? new Date(repayment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</td>
                        <td className="p-4">{getStatusBadge('completed')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No completed repayments yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-primary text-primary-foreground overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Financial Health</CardTitle>
              <CardDescription className="text-primary-foreground/70">Your platform standing is excellent.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase font-bold tracking-wider opacity-70">Credit Standing</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-full bg-primary-foreground/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[95%]" />
                  </div>
                  <span className="font-bold">95/100</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold opacity-70">On-time Rate</p>
                  <p className="text-lg font-bold">100%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold opacity-70">Penalty Count</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Repayment Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="p-2 bg-amber-500/10 rounded-full h-fit">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Late Penalties</p>
                  <p className="text-xs text-muted-foreground">A 2% weekly penalty is applied to overdue payments after a 24-hour grace period.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="p-2 bg-blue-500/10 rounded-full h-fit">
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">Pre-closure</p>
                  <p className="text-xs text-muted-foreground">You can request early repayment. A small processing fee of 0.5% may apply.</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/dashboard/msme/support">Request Pre-closure</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
