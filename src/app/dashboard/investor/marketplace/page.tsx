import { db } from "@/db";
import { fundingRequests, invoices, users, investments } from "@/db/schema";
import { eq, and, sql, sum } from "drizzle-orm";
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
  BarChart3
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export default async function InvestorMarketplace() {
  // Fetch open funding requests with invoice and MSME details
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

  // Calculate progress for each
  const requestsWithProgress = await Promise.all(
    openRequests.map(async (req) => {
      const totalInvested = await db
        .select({ sum: sum(investments.amount) })
        .from(investments)
        .where(eq(investments.fundingRequestId, req.id));
      
      const currentSum = parseFloat(totalInvested[0]?.sum || "0");
      const requestedAmt = parseFloat(req.amount);
      const progress = (currentSum / requestedAmt) * 100;
      
      return { ...req, progress, remaining: requestedAmt - currentSum };
    })
  );

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
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/30">
            <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
              <Building2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-bold">No Live Opportunities</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">New invoices are listed daily. Check back soon for high-yield deployments.</p>
          </div>
        ) : (
          requestsWithProgress.map((req) => (
            <Card key={req.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all hover:translate-y-[-2px]">
              <div className="h-1.5 bg-primary w-full opacity-50 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="space-y-1 pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[10px] font-bold uppercase tracking-wider">
                    Invoice Discounting
                  </Badge>
                  <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                    <TrendingUp className="h-4 w-4" />
                    {req.yieldRate}%
                  </div>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors mt-2">{req.companyName}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-xs">
                  <Info className="h-3 w-3" />
                  Invoice #{req.invoiceNumber} • Fully Verified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Target Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(req.amount)}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Remaining</p>
                    <p className="text-lg font-bold text-primary">{formatCurrency(req.remaining)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="text-primary">{req.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={req.progress} className="h-1.5" />
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    EXPIRES {new Date(req.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck className="h-3 w-3" />
                    BANK-GRADE AUDIT
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 pb-4">
                <Button asChild className="w-full shadow-lg shadow-primary/10 group/btn">
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
