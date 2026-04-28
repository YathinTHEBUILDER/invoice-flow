"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/client";
import { requestFinancingAction } from "@/actions/msme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  IndianRupee, 
  AlertCircle, 
  CheckCircle2,
  Info
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

function FinancingRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoiceId");
  
  const [formData, setFormData] = useState({
    requestedAmount: "",
    yieldRate: "12.00",
    fundingDeadline: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [invoice, setInvoice] = useState<any>(null);

  const supabase = createClient();

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const fetchInvoice = async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .single();
    
    if (data) {
      setInvoice(data);
      setFormData(prev => ({ ...prev, requestedAmount: data.amount }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceId) return;

    setLoading(true);
    setMessage(null);

    try {
      const result = await requestFinancingAction({
        invoiceId,
        requestedAmount: formData.requestedAmount,
        yieldRate: formData.yieldRate,
        fundingDeadline: formData.fundingDeadline,
      });

      if (result?.data?.success) {
        setMessage({ type: "success", text: "Financing request listed successfully on the marketplace!" });
        setTimeout(() => router.push("/dashboard/msme/financing"), 2000);
      } else {
        throw new Error(result?.data?.error || "Failed to create financing request.");
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!invoiceId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">No Invoice Selected</h2>
        <p className="text-muted-foreground">Please select an approved invoice from your list to request financing.</p>
        <Button asChild><Link href="/dashboard/msme/invoices">Back to Invoices</Link></Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-2">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/msme/invoices">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Request Financing</h2>
          <p className="text-muted-foreground">List your approved invoice on the marketplace for investor funding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg">Funding Terms</CardTitle>
              <CardDescription>Configure how much liquidity you want to unlock.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold tracking-tight">Funding Amount (₹)</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          required
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10 bg-muted/50 focus:bg-background transition-all"
                          value={formData.requestedAmount}
                          onChange={(e) => setFormData({...formData, requestedAmount: e.target.value})}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Max: {invoice ? formatCurrency(invoice.amount) : "₹0.00"}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold tracking-tight">Expected Yield (% p.a.)</label>
                      <div className="relative">
                        <TrendingUp className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          required
                          type="number"
                          step="0.01"
                          placeholder="12.00"
                          className="pl-10 bg-muted/50 focus:bg-background transition-all"
                          value={formData.yieldRate}
                          onChange={(e) => setFormData({...formData, yieldRate: e.target.value})}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">Market average: 10% - 14%</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold tracking-tight">Funding Deadline</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        required
                        type="date"
                        className="pl-10 bg-muted/50 focus:bg-background transition-all"
                        value={formData.fundingDeadline}
                        onChange={(e) => setFormData({...formData, fundingDeadline: e.target.value})}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">The date by which you need the full amount.</p>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Service Fee (0.5%)</span>
                    <span className="font-bold">₹{((parseFloat(formData.requestedAmount || "0") * 0.005)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t border-primary/10 pt-2">
                    <span className="font-bold">Estimated Net Proceeds</span>
                    <span className="font-bold text-primary text-lg">₹{((parseFloat(formData.requestedAmount || "0") * 0.995)).toFixed(2)}</span>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-12 text-lg shadow-lg shadow-primary/20">
                  {loading ? "Processing..." : "List on Marketplace"}
                </Button>
              </form>

              {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                  {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 mt-0.5" /> : <AlertCircle className="h-5 w-5 mt-0.5" />}
                  <div>
                    <p className="font-semibold">{message.type === 'success' ? 'Request Live!' : 'Error'}</p>
                    <p className="text-sm opacity-90">{message.text}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-muted-foreground/10">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Invoice #</span>
                  <span className="font-bold">{invoice?.invoice_number || "-"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Original Amount</span>
                  <span className="font-bold">₹{invoice ? formatCurrency(invoice.amount) : "0.00"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Original Due Date</span>
                  <span className="font-bold">{invoice ? new Date(invoice.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/5 rounded-lg border border-blue-500/10 flex gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Financing requests are usually filled in fractions by multiple investors. You will be notified as funding progresses.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-slate-900 text-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Funding Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs text-slate-300">
              <p>To get funded faster:</p>
              <ul className="space-y-3 list-disc pl-4">
                <li>Set a competitive yield rate (11% - 13%).</li>
                <li>Ensure the deadline is at least 7 days away.</li>
                <li>Requests for 80% or less of the invoice value tend to fill 40% faster.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewFinancingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FinancingRequestForm />
    </Suspense>
  );
}
