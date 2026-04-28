import { db } from "@/db";
import { fundingRequests, invoices, users, investments } from "@/db/schema";
import { eq, sql, sum } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InvestmentForm } from "./investment-form";
import { 
  FileText, 
  Calendar, 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  ArrowLeft,
  AlertTriangle,
  History,
  Lock
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export default async function InvestmentDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const request = await db.query.fundingRequests.findFirst({
    where: eq(fundingRequests.id, id),
    with: {
      invoice: {
        with: {
          msme: true
        }
      }
    }
  });

  if (!request) notFound();

  const totalInvested = await db
    .select({ sum: sum(investments.amount) })
    .from(investments)
    .where(eq(investments.fundingRequestId, id));
  
  const currentSum = parseFloat(totalInvested[0]?.sum || "0");
  const requestedAmt = parseFloat(request.requestedAmount);
  const remaining = requestedAmt - currentSum;
  const progress = (currentSum / requestedAmt) * 100;

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/investor/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Marketplace
          </Link>
        </Button>
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20 text-[10px] font-bold">
              LIVE OPPORTUNITY
            </Badge>
            <Badge variant="outline" className="text-[10px] font-bold">
              VERIFIED B2B ASSET
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">{request.invoice.msme.companyName}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Fractional participation in Invoice #{request.invoice.invoiceNumber} for working capital optimization.
          </p>
        </div>

        <div className="w-full xl:w-auto flex flex-col sm:flex-row gap-4 bg-muted/50 p-6 rounded-2xl border border-muted-foreground/10">
          <div className="space-y-1 pr-8 border-r border-muted-foreground/10 last:border-0">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Yield Rate</p>
            <p className="text-3xl font-black text-primary">{request.yieldRate}% <span className="text-xs font-medium">p.a.</span></p>
          </div>
          <div className="space-y-1 px-0 sm:px-8 border-r border-muted-foreground/10 last:border-0">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Target Goal</p>
            <p className="text-3xl font-black">{formatCurrency(requestedAmt)}</p>
          </div>
          <div className="space-y-1 pl-0 sm:pl-8 last:border-0">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Tenure</p>
            <p className="text-3xl font-black">90 <span className="text-xs font-medium">Days</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Asset Audit & Verification</CardTitle>
              <CardDescription>Comprehensive review of the underlying invoice asset.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-muted/30 border border-muted-foreground/5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Invoice Details</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">{formatCurrency(request.invoice.amount)}</p>
                  <p className="text-[10px] text-muted-foreground">FACE VALUE OF INVOICE</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold">{new Date(request.invoice.dueDate).toLocaleDateString()}</p>
                  <p className="text-[10px] text-muted-foreground">EXPECTED SETTLEMENT DATE</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/30 border border-muted-foreground/5 space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Risk Assessment</span>
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">LOW RISK</Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">INTERNAL SCORE: 8.5/10</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Fully vetted against GST portal and bank records.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1 bg-amber-500 w-full" />
            <CardHeader>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-xl">Borrower Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-muted/50">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Industry</p>
                  <p className="text-sm font-semibold">Manufacturing</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Stability</p>
                  <p className="text-sm font-semibold">5+ Years</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Settlements</p>
                  <p className="text-sm font-semibold text-emerald-600">100% Repaid</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic">
                "{request.invoice.msme.companyName} has demonstrated consistent operational efficiency and financial discipline. This invoice is part of their recurring B2B cycle with institutional debtors."
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-rose-500/5 border border-rose-500/10">
            <CardContent className="p-6 flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-700">Investor Disclosure</p>
                <p className="text-xs text-rose-600/80 leading-relaxed">
                  Invoice discounting carries inherent risks including payment delays or debtor default. While InvoiceFlow performs rigorous audits, investors are advised to diversify their portfolios. Capital is locked until repayment or platform-approved secondary sale.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-primary/5 bg-primary/5 border border-primary/10 overflow-hidden sticky top-24">
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Invest Now</h3>
                  <Badge className="bg-primary text-white border-none">{progress.toFixed(0)}% Funded</Badge>
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                  <span className="text-muted-foreground">Available to Fund</span>
                  <span className="text-primary">{formatCurrency(remaining)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-primary/5 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Min Participation</span>
                  <span>₹1,000</span>
                </div>
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="text-emerald-600">ZERO</span>
                </div>
                <div className="pt-2 border-t border-muted/50 flex items-center justify-between text-sm font-bold">
                  <span>Your Balance</span>
                  <span>₹0.00</span>
                </div>
              </div>

              <InvestmentForm 
                fundingRequestId={id} 
                remainingLimit={remaining} 
              />
              
              <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                <Lock className="h-3 w-3" /> Secure Transaction • AES-256 Encrypted
              </p>
            </div>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4 text-primary" />
                Participation History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[10px] text-center py-6 text-muted-foreground italic">
                Be the first to participate in this funding round.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
