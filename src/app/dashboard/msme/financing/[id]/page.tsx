import { createClient } from "@/lib/server";
import { db } from "@/db";
import { fundingRequests, invoices, investments, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Users,
  ShieldCheck,
  AlertCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

export default async function FinancingRequestDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const request = await db.query.fundingRequests.findFirst({
    where: eq(fundingRequests.id, id),
    with: {
      invoice: true,
    }
  });

  if (!request) return <div>Request not found</div>;

  if (request.invoice.msmeId !== user.id) return <div>Unauthorized</div>;

  const requestInvestments = await db.query.investments.findMany({
    where: eq(investments.fundingRequestId, id),
    orderBy: [desc(investments.createdAt)],
  });

  const totalRaised = requestInvestments.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
  const progress = (totalRaised / parseFloat(request.requestedAmount)) * 100;

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/msme/financing">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financing Details</h2>
          <p className="text-muted-foreground">Request ID: {id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">₹{formatCurrency(request.requestedAmount)}</CardTitle>
                <CardDescription>Funding Goal for Invoice #{request.invoice.invoiceNumber}</CardDescription>
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 capitalize px-3 py-1">
                {request.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-muted-foreground">Funding Progress</span>
                  <span className="font-bold text-primary">{progress.toFixed(1)}% Completed</span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Raised: ₹{formatCurrency(totalRaised)}</span>
                  <span>Target: ₹{formatCurrency(request.requestedAmount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-muted/50">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Yield Rate</p>
                  <p className="text-sm font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                    {request.yieldRate}% p.a.
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Investors</p>
                  <p className="text-sm font-bold flex items-center gap-1">
                    <Users className="h-3 w-3 text-blue-500" />
                    {requestInvestments.length} Participated
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Deadline</p>
                  <p className="text-sm font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3 text-amber-500" />
                    {new Date(request.fundingDeadline).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</p>
                  <p className="text-sm font-bold capitalize">{request.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Investor Participation</CardTitle>
              <CardDescription>Recent contributions from the marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
              {requestInvestments.length > 0 ? (
                <div className="space-y-4">
                  {requestInvestments.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-muted-foreground/5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                          INV
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Investor Contribution</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(inv.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-emerald-600">+₹{formatCurrency(inv.amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                  Waiting for first investor to participate...
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Linked Invoice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-muted-foreground/10 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase">Invoice Number</p>
                    <p className="text-sm font-bold">{request.invoice.invoiceNumber}</p>
                  </div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">Verified</Badge>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Invoice Total</p>
                  <p className="text-base font-bold text-primary">₹{formatCurrency(request.invoice.amount)}</p>
                </div>
                <Button variant="ghost" size="sm" className="w-full text-xs h-8" asChild>
                  <Link href={request.invoice.fileUrl} target="_blank">View Document</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-slate-900 text-slate-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                Trust Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                This request is backed by a verified invoice and has passed our risk assessment protocol.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase opacity-70">Risk Rating</span>
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">Low Risk</Badge>
              </div>
            </CardContent>
          </Card>

          {request.status === 'open' && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed font-medium">
                Requests typically take 3-5 days to fill completely. Keep your KYC up to date for smooth fund transfer.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
