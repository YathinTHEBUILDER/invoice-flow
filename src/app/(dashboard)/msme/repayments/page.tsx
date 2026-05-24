"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Calendar, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  X
} from "lucide-react";
import { createClient } from "@/lib/client";
import { formatINR } from "@/lib/utils";
import { submitRepaymentProofAction } from "@/app/actions/msme";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function RepaymentsPage() {
  const [repayments, setRepayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const repaymentId = searchParams.get("id");

  useEffect(() => {
    fetchRepayments();
  }, []);

  useEffect(() => {
    if (repaymentId && repayments.length > 0) {
      const found = repayments.find(r => r.id === repaymentId);
      if (found && found.status !== 'paid') setSelectedRepayment(found);
    }
  }, [repaymentId, repayments]);

  async function fetchRepayments() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
    if (user) {
      const { data } = await supabase
        .from("repayments")
        .select("*, invoices!inner(*)")
        .eq("invoices.msme_id", user.id)
        .order("due_date", { ascending: true });
      setRepayments(data || []);
    }
    setLoading(false);
  }

  const handleSubmitProof = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await submitRepaymentProofAction(formData);
      if (result.success) {
        toast.success("Payment proof submitted for verification.");
        setSelectedRepayment(null);
        await fetchRepayments();
      } else {
        toast.error(result.error || "Submission failed.");
      }
    } catch (error) {
      toast.error("System error during submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase tracking-wider text-[10px] rounded-full">Scheduled</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-wider text-[10px] rounded-full">Paid</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-bold uppercase tracking-wider text-[10px] rounded-full">Overdue</Badge>;
      default:
        return <Badge variant="outline" className="font-bold uppercase tracking-wider text-[10px] rounded-full">{status}</Badge>;
    }
  };

  const upcomingDues = repayments.filter(r => r.status === "scheduled" || r.status === "overdue");
  const pastPayments = repayments.filter(r => r.status === "paid");

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-white">Repayments</h2>
          <p className="text-muted-foreground font-medium text-sm">Track upcoming obligations and payment history.</p>
        </div>
        <div className="flex gap-4">
          <Card className="glass-dark border-white/5 px-6 py-3 flex items-center gap-4 rounded-xl">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Outstanding</p>
              <p className="text-xl font-bold text-white">{formatINR(upcomingDues.reduce((sum, r) => sum + Number(r.amount_due), 0))}</p>
            </div>
            <div className="h-10 w-[1px] bg-white/5" />
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Next Due</p>
              <p className="text-xl font-bold text-orange-500">
                {upcomingDues.length > 0 ? new Date(upcomingDues[0].due_date).toLocaleDateString() : "None"}
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass-dark border-white/5 overflow-hidden rounded-2xl">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">Upcoming Obligations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : upcomingDues.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <CheckCircle2 className="mx-auto w-12 h-12 text-emerald-500/20" />
                  <p className="text-muted-foreground font-medium">No upcoming repayments due.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {upcomingDues.map((item) => (
                    <div key={item.id} className="p-8 hover:bg-white/[0.01] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border ${item.status === 'overdue' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/10 text-muted-foreground'}`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Invoice {item.invoices.invoice_number}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Due on {new Date(item.due_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row items-end md:items-center gap-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-white">{formatINR(item.amount_due)}</p>
                          {getStatusBadge(item.status)}
                        </div>
                        {item.status !== 'paid' && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedRepayment(item)}
                              className="h-9 text-xs font-bold uppercase text-white hover:bg-white/10 rounded-lg"
                            >
                              Mark as Paid
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
 
          <Card className="glass-dark border-white/5 overflow-hidden rounded-2xl">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">Payment History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : pastPayments.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground font-medium">No completed payments found.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {pastPayments.map((item) => (
                    <div key={item.id} className="p-8 hover:bg-white/[0.01] transition-colors flex justify-between items-center">
                      <div className="flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Invoice {item.invoices.invoice_number}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Paid on {new Date(item.payment_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">{formatINR(item.amount_paid)}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Ref: {item.payment_reference || "N/A"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="glass-dark border-white/5 overflow-hidden rounded-2xl">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">How to Repay</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Manual Bank Transfer</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  Repayments must be made directly to the platform's escrow account via NEFT/RTGS. No automatic debits are currently supported.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Late Payment Penalty</span>
                  <span className="text-red-500">2.5% Monthly</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Pre-closure Benefit</span>
                  <span className="text-emerald-500">Interest Rebate</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <Button 
                  onClick={() => setShowBankDetails(true)}
                  className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs border border-white/10 rounded-xl"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> View Bank Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-dark border-white/5 p-8 space-y-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Late Fee Notice</p>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              All payments must be completed by 4 PM on the due date. Payments received after the cut-off will be processed on the next business day and may incur penalties.
            </p>
          </Card>
        </div>
      </div>

      {/* Submit Proof Modal */}
      {selectedRepayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedRepayment(null)} />
          <Card className="relative w-full max-w-md glass-dark border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 rounded-2xl">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-bold text-white tracking-tight">Submit Payment Proof</CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Verify payment for Invoice #{selectedRepayment.invoices.invoice_number}</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmitProof}>
              <CardContent className="p-8 space-y-6">
                <input type="hidden" name="repayment_id" value={selectedRepayment.id} />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Transaction UTR / Reference ID</label>
                  <input 
                    name="utr"
                    required
                    placeholder="Enter NEFT/RTGS UTR Number"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Amount Paid (INR)</label>
                  <input 
                    name="amount_paid"
                    type="number"
                    step="0.01"
                    required
                    defaultValue={selectedRepayment.amount_due}
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold placeholder:text-white/20 focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                    False submissions or incorrect UTRs may lead to account suspension and additional penalties.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedRepayment(null)}
                    className="flex-1 h-12 font-bold uppercase tracking-wider text-[10px] hover:bg-white/5 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Payment"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowBankDetails(false)} />
          <Card className="relative w-full max-w-md glass-dark border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 rounded-2xl">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-white tracking-tight">Payment Account</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">NEFT / RTGS Transfer Details</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowBankDetails(false)}
                className="hover:bg-white/5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                {[
                  { label: "Account Name", value: "INVOICE FLOW TECHNOLOGIES PVT LTD" },
                  { label: "Account Number", value: "923020054812934" },
                  { label: "Bank Name", value: "AXIS BANK LTD" },
                  { label: "IFSC Code", value: "UTIB0000001" },
                  { label: "Account Type", value: "CURRENT" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                    <span className="text-xs font-bold text-white">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] text-muted-foreground font-bold leading-relaxed text-center">
                  Please mention your Invoice ID in the transaction remarks for faster payment processing.
                </p>
              </div>
              <Button 
                onClick={() => setShowBankDetails(false)}
                className="w-full h-12 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-[10px] rounded-xl"
              >
                Done
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
