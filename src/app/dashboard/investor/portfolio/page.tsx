import { createClient } from "@/lib/server";
import { db } from "@/db";
import { investments, fundingRequests, invoices, repayments, users, transactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Info,
  Calendar,
  AlertTriangle,
  History,
  FileText,
  ShieldCheck
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function InvestorPortfolioPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Fetch User and Role
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });

  // Active Investments with calculations
  const rawActivePositions = await db
    .select({
      id: investments.id,
      amount: investments.amount,
      status: investments.status,
      createdAt: investments.createdAt,
      yieldRate: fundingRequests.yieldRate,
      invoiceNumber: invoices.invoiceNumber,
      dueDate: invoices.dueDate,
    })
    .from(investments)
    .innerJoin(fundingRequests, eq(investments.fundingRequestId, fundingRequests.id))
    .innerJoin(invoices, eq(fundingRequests.invoiceId, invoices.id))
    .where(and(eq(investments.investorId, user.id), eq(investments.status, 'active')))
    .orderBy(desc(investments.createdAt));

  const activePositions = rawActivePositions.map(pos => {
    const principal = parseFloat(pos.amount);
    const rate = parseFloat(pos.yieldRate) / 100;
    const now = new Date();
    const created = new Date(pos.createdAt);
    const due = new Date(pos.dueDate);
    
    // Days since investment
    const daysHeld = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
    // Accrued Interest = P * R * (Days Held / 365)
    const accruedInterest = principal * rate * (daysHeld / 365);
    // Days remaining
    const daysRemaining = Math.max(0, Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    return { ...pos, accruedInterest, daysRemaining };
  });

  // Completed Investments (Realized)
  const settledRepayments = await db
    .select({
      amount: transactions.amount,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, user.id), eq(transactions.type, 'repayment')));

  const completedPositions = await db
    .select({
      id: investments.id,
      amount: investments.amount,
      status: investments.status,
      createdAt: investments.createdAt,
      yieldRate: fundingRequests.yieldRate,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(investments)
    .innerJoin(fundingRequests, eq(investments.fundingRequestId, fundingRequests.id))
    .innerJoin(invoices, eq(fundingRequests.invoiceId, invoices.id))
    .where(and(eq(investments.investorId, user.id), eq(investments.status, 'completed')))
    .orderBy(desc(investments.createdAt));

  const portfolioValue = activePositions.reduce((sum, pos) => sum + parseFloat(pos.amount), 0);
  
  // Realized gains = Sum of all repayment transaction amounts - Sum of their principals
  // For simplicity here, we sum all repayment amounts
  const totalRepaidAmount = settledRepayments.reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
  const totalCompletedPrincipal = completedPositions.reduce((sum, pos) => sum + parseFloat(pos.amount), 0);
  const realizedGains = totalRepaidAmount - totalCompletedPrincipal;
  
  const avgYield = activePositions.length > 0 
    ? activePositions.reduce((sum, pos) => sum + parseFloat(pos.yieldRate), 0) / activePositions.length
    : 12.5;

  return (
    <div className="flex-1 space-y-8 p-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Investment Portfolio</h2>
        <p className="text-muted-foreground mt-1">Detailed overview of your capital deployments and returns.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-md bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Portfolio Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-primary">{formatCurrency(portfolioValue)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">CURRENT MARKET VALUE</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Realized Gains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-emerald-600">{formatCurrency(realizedGains)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">TOTAL PROFIT RETURNED</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Avg. Yield</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-blue-600">{avgYield.toFixed(1)}%</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold">WEIGHTED AVERAGE RATE</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="active" className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Active Positions ({activePositions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-lg px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Settled ({completedPositions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activePositions.length === 0 ? (
            <Card className="border-none shadow-sm py-20 text-center">
              <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-bold">No Active Positions</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">Browse the marketplace to start building your invoice portfolio.</p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {activePositions.map((pos) => (
                <Card key={pos.id} className="border-none shadow-md overflow-hidden group hover:shadow-lg transition-all">
                  <div className="h-1 bg-primary w-full opacity-30 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="p-6 flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Asset ID: INV-{pos.invoiceNumber}</p>
                              <h3 className="text-xl font-bold tracking-tight">Invoice Participation</h3>
                            </div>
                          </div>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/10 font-bold">
                            {pos.yieldRate}% Yield
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Capital Deployed</p>
                            <p className="text-lg font-black">{formatCurrency(pos.amount)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Expected Settlement</p>
                            <p className="text-sm font-bold flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {new Date(pos.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Accrued Interest</p>
                            <p className="text-sm font-bold text-emerald-600">₹{pos.accruedInterest.toFixed(2)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Days Remaining</p>
                            <p className="text-sm font-bold">{pos.daysRemaining} Days</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-6 flex flex-col justify-center gap-3 border-l border-muted-foreground/10 min-w-[220px]">
                        <Button variant="outline" size="sm" className="w-full font-bold shadow-sm" asChild>
                          <Link href={`/dashboard/investor/portfolio/${pos.id}`}>View Performance</Link>
                        </Button>
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                          <ShieldCheck className="h-3 w-3 text-emerald-500" />
                          Insured Principal
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedPositions.length === 0 ? (
             <Card className="border-none shadow-sm py-20 text-center">
                <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
                  <History className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-bold">No Settled Positions</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">Completed investments will appear here once the invoices are repaid.</p>
             </Card>
          ) : (
            <div className="grid gap-4">
              {completedPositions.map((pos) => (
                <div key={pos.id} className="p-4 rounded-xl border bg-card flex items-center justify-between group hover:bg-muted/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Invoice #{pos.invoiceNumber}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Settled: {new Date(pos.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600">+ {formatCurrency(pos.amount)}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">PRINCIPAL + INTEREST</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
