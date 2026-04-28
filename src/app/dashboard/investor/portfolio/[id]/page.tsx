import { db } from "@/db";
import { investments, fundingRequests, invoices, repayments, transactions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FileText, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  ShieldCheck,
  History,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function InvestmentDetailPage({ params }: { params: { id: string } }) {
  const investment = await db.query.investments.findFirst({
    where: eq(investments.id, params.id),
    with: {
      fundingRequest: {
        with: {
          invoice: {
            with: {
              msme: true
            }
          }
        }
      }
    }
  });

  if (!investment) notFound();

  const relatedTransactions = await db.query.transactions.findMany({
    where: and(eq(transactions.userId, investment.investorId), eq(transactions.referenceId, investment.id)),
    orderBy: (transactions, { desc }) => [desc(transactions.createdAt)]
  });

  const principal = parseFloat(investment.amount);
  const rate = parseFloat(investment.fundingRequest.yieldRate) / 100;
  const created = new Date(investment.createdAt);
  const due = new Date(investment.fundingRequest.invoice.dueDate);
  const now = new Date();
  
  const totalTenure = Math.max(1, Math.ceil((due.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
  const daysHeld = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
  const accruedInterest = principal * rate * (daysHeld / 365);
  const totalExpectedInterest = principal * rate * (totalTenure / 365);

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/investor/portfolio">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Investment Performance</h2>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Asset ID: {investment.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <div className={`h-1.5 w-full ${investment.status === 'active' ? 'bg-primary' : 'bg-emerald-500'}`} />
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Invoice #{investment.fundingRequest.invoice.invoiceNumber}</CardTitle>
                  <CardDescription>MSME: {investment.fundingRequest.invoice.msme.companyName}</CardDescription>
                </div>
              </div>
              <Badge className={investment.status === 'active' ? "bg-primary/10 text-primary border-none" : "bg-emerald-500/10 text-emerald-600 border-none"}>
                {investment.status.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Principal</p>
                <p className="text-xl font-black">{formatCurrency(investment.amount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Yield Rate</p>
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                   <TrendingUp className="h-4 w-4" />
                   {investment.fundingRequest.yieldRate}%
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accrued Profit</p>
                <p className="text-xl font-black text-emerald-600">₹{accruedInterest.toFixed(2)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Days Held</p>
                <p className="text-xl font-black">{daysHeld} / {totalTenure}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Linked Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatedTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-muted-foreground/5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${tx.type === 'investment' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {tx.type === 'investment' ? <ShieldCheck className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold capitalize">{tx.type}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black">{formatCurrency(tx.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="border-none shadow-md bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-lg">Settlement Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Original Capital</span>
                       <span className="font-bold">{formatCurrency(investment.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-muted-foreground">Est. Total Profit</span>
                       <span className="font-bold text-emerald-600">₹{totalExpectedInterest.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t border-emerald-500/10 flex justify-between items-center">
                       <span className="font-bold">Maturity Value</span>
                       <span className="text-xl font-black text-emerald-700">₹{(principal + totalExpectedInterest).toFixed(2)}</span>
                    </div>
                 </div>
                 
                 <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-emerald-500/10 flex gap-3">
                    <Calendar className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Expected Maturity Date</p>
                       <p className="text-sm font-black">{due.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                 <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Asset Protection
                 </CardTitle>
              </CardHeader>
              <CardContent>
                 <p className="text-[10px] text-muted-foreground leading-relaxed">
                    This investment is backed by a verified corporate invoice. In case of default, the InvoiceFlow recovery mechanism is triggered. Interest accrues daily until repayment.
                 </p>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
