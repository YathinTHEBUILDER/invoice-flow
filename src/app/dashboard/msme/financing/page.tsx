import { createClient } from "@/lib/server";
import { db } from "@/db";
import { fundingRequests, invoices, investments } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  Info,
  Calendar,
  IndianRupee
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";

export default async function MSMEFinancingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;


  // Since Drizzle's join query might return a different structure depending on setup,
  // let's do a more robust fetch if the above doesn't work as expected.
  // Using a manual join for clarity.
  const rawRequests = await db
    .select({
      id: fundingRequests.id,
      requestedAmount: fundingRequests.requestedAmount,
      yieldRate: fundingRequests.yieldRate,
      status: fundingRequests.status,
      fundingDeadline: fundingRequests.fundingDeadline,
      createdAt: fundingRequests.createdAt,
      invoiceNumber: invoices.invoiceNumber,
      invoiceAmount: invoices.amount,
    })
    .from(fundingRequests)
    .innerJoin(invoices, eq(fundingRequests.invoiceId, invoices.id))
    .where(eq(invoices.msmeId, user.id))
    .orderBy(desc(fundingRequests.createdAt));

  const requests = await Promise.all(
    rawRequests.map(async (req) => {
      const totalInvested = await db
        .select({ sum: sql<string>`sum(${investments.amount})` })
        .from(investments)
        .where(eq(investments.fundingRequestId, req.id));
      
      const currentSum = parseFloat(totalInvested[0]?.sum || "0");
      const requestedAmt = parseFloat(req.requestedAmount);
      const progress = Math.min(100, (currentSum / requestedAmt) * 100);
      
      return { ...req, progress, currentSum };
    })
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Open for Investment</Badge>;
      case "filled":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Fully Funded</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">Completed</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financing Requests</h2>
          <p className="text-muted-foreground">Track the status of your funding requests on the marketplace.</p>
        </div>
        <Button asChild className="bg-primary shadow-lg shadow-primary/20">
          <Link href="/dashboard/msme/invoices">
            <ArrowRight className="mr-2 h-4 w-4" />
            Pick Approved Invoice
          </Link>
        </Button>
      </div>

      {requests.length > 0 ? (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Invoice #{request.invoiceNumber}</p>
                      <h3 className="text-xl font-bold">₹{request.requestedAmount} Requested</h3>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Yield Rate</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        {request.yieldRate}% p.a.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Deadline</p>
                      <p className="text-sm font-semibold flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-amber-500" />
                        {new Date(request.fundingDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Invoice Value</p>
                      <p className="text-sm font-semibold">₹{request.invoiceAmount}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Created On</p>
                      <p className="text-sm font-semibold">{new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>

                  {request.status === 'open' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Funding Progress</span>
                        <span className="font-bold text-primary">{request.progress.toFixed(1)}% Funded</span>
                      </div>
                      <Progress value={request.progress} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="bg-muted/30 p-6 flex flex-col justify-center gap-3 border-l border-muted-foreground/5 min-w-[200px]">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/msme/financing/${request.id}`}>View Details</Link>
                  </Button>
                  {request.status === 'open' && (
                    <Button variant="destructive" size="sm" className="w-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20">
                      Cancel Request
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-md py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-primary/5 rounded-full">
              <TrendingUp className="h-8 w-8 text-primary/40" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No Active Financing Requests</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-1">
                Once your invoices are approved, you can list them on the marketplace to receive funding from investors.
              </p>
            </div>
            <Button asChild className="mt-2 shadow-lg shadow-primary/20">
              <Link href="/dashboard/msme/invoices">Go to Invoices</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
