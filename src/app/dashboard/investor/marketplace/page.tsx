import { db } from "@/db";
import { fundingRequests, invoices, users, investments } from "@/db/schema";
import { eq, sql, sum } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  Building2, 
  ArrowRight,
  Info,
  ChevronRight,
  BarChart3,
  AlertTriangle,
  RefreshCcw
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export default async function InvestorMarketplace() {
  let requestsWithProgress: any[] = [];
  let error: string | null = null;

  try {
    // 1. Fetch open funding requests with invoice and MSME details
    const openRequests = await db
      .select({
        id: fundingRequests.id,
        amount: fundingRequests.requestedAmount,
        yieldRate: fundingRequests.yieldRate,
        deadline: fundingRequests.fundingDeadline,
        companyName: users.companyName,
        invoiceNumber: invoices.invoiceNumber,
      })
      .from(fundingRequests)
      .innerJoin(invoices, eq(fundingRequests.invoiceId, invoices.id))
      .innerJoin(users, eq(invoices.msmeId, users.id))
      .where(eq(fundingRequests.status, "open"));

    // 2. Optimized investment sum calculation
    // Instead of N+1 queries, we fetch all investments for these requests in one go
    if (openRequests.length > 0) {
      const requestIds = openRequests.map(r => r.id);
      const totalInvestedData = await db
        .select({ 
          requestId: investments.fundingRequestId, 
          total: sum(investments.amount) 
        })
        .from(investments)
        .where(sql`${investments.fundingRequestId} IN ${requestIds}`)
        .groupBy(investments.fundingRequestId);

      const investmentMap = new Map(
        totalInvestedData.map(item => [item.requestId, parseFloat(item.total || "0")])
      );

      requestsWithProgress = openRequests.map((req) => {
        const currentSum = investmentMap.get(req.id) || 0;
        const requestedAmt = parseFloat(req.amount);
        // Avoid division by zero
        const progress = requestedAmt > 0 ? (currentSum / requestedAmt) * 100 : 0;
        
        return { 
          ...req, 
          progress: Math.min(progress, 100), 
          remaining: Math.max(0, requestedAmt - currentSum) 
        };
      });
    }
  } catch (err: any) {
    console.error("Marketplace Data Fetch Error:", err);
    error = err.message || "Unable to connect to the investment ledger.";
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-rose-500/20 bg-rose-500/5 shadow-2xl shadow-rose-500/5 overflow-hidden">
          <div className="h-1.5 bg-rose-500 w-full" />
          <CardContent className="pt-10 pb-10 text-center space-y-6">
            <div className="p-4 bg-rose-500/10 rounded-full w-fit mx-auto">
              <AlertTriangle className="h-10 w-10 text-rose-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-rose-950">Connection Interrupted</h3>
              <p className="text-sm text-rose-800/70">
                Our high-frequency trading engine is temporarily unable to sync with the blockchain ledger. 
                Your funds remain secure.
              </p>
            </div>
            <div className="pt-4">
              <Button asChild variant="outline" className="border-rose-200 hover:bg-rose-100">
                <Link href="/dashboard/investor/marketplace" className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4" />
                  Reconnect to Marketplace
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Marketplace</h2>
          <p className="text-muted-foreground mt-1">Institutional-grade invoice discounting opportunities.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold border border-emerald-500/20">
          <BarChart3 className="h-4 w-4" />
          Market Yield: 12.5% p.a.
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {requestsWithProgress.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-3xl bg-muted/30 border-muted-foreground/10">
            <div className="p-6 bg-muted rounded-full w-fit mx-auto mb-6">
              <Building2 className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">No Active Opportunities</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-3">
              New high-yield invoices are listed daily after multi-stage verification. 
              Deploy capital to your wallet to be ready for the next drop.
            </p>
            <Button variant="outline" size="sm" className="mt-8 rounded-full" asChild>
              <Link href="/dashboard/investor/wallet">Top up Wallet</Link>
            </Button>
          </div>
        ) : (
          requestsWithProgress.map((req) => (
            <Card key={req.id} className="group overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-300 hover:translate-y-[-4px] bg-card">
              <div className="h-1.5 bg-primary w-full opacity-30 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="space-y-1 pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                    Invoice Discounting
                  </Badge>
                  <div className="flex items-center gap-1 text-emerald-600 font-black text-sm">
                    <TrendingUp className="h-4 w-4" />
                    {req.yieldRate}%
                  </div>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors mt-3 tracking-tight">
                  {req.companyName || "Verified Borrower"}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 text-[11px] font-medium">
                  <Info className="h-3.5 w-3.5 text-primary/60" />
                  Invoice #{req.invoiceNumber} • Fully Verified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Target Amount</p>
                    <p className="text-lg font-black">{formatCurrency(req.amount)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Remaining</p>
                    <p className="text-lg font-black text-primary">{formatCurrency(req.remaining)}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="text-primary">{req.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={req.progress} className="h-2 rounded-full overflow-hidden bg-primary/10" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground pt-2 border-t border-muted/50 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    EXPIRES {req.deadline ? new Date(req.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBD'}
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    BANK-GRADE AUDIT
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 pb-4 px-6 border-t border-muted/20">
                <Button asChild className="w-full shadow-lg shadow-primary/20 group/btn font-bold">
                  <Link href={`/dashboard/investor/marketplace/${req.id}`}>
                    Analyze Opportunity
                    <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

