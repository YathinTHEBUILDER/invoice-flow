"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  MessageSquareWarning,
  FileText
} from "lucide-react";
import { createClient } from "@/lib/client";
import { formatINR } from "@/lib/utils";
import { calculateOutstandingBalance, calculatePreClosureDetails } from "@/lib/finance-logic";
import { 
  submitRepaymentProofAction, 
  raiseDisputeAction, 
  requestPreClosureAction,
  getMSMEInvestments
} from "@/app/actions/msme";
import { toast } from "sonner";

export default function InvestmentsPage() {
  const [fundedInvoices, setFundedInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreClosure, setShowPreClosure] = useState(false);
  const [showDispute, setShowDispute] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'schedule' | 'history'>('details');

  useEffect(() => {
    fetchFundedInvoices();
  }, []);

  async function fetchFundedInvoices() {
    setLoading(true);
    try {
      const data = await getMSMEInvestments();
      setFundedInvoices(data || []);
    } catch (error) {
      toast.error("Failed to fetch investments.");
    } finally {
      setLoading(false);
    }
  }

  const handleRepayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await submitRepaymentProofAction(formData);
      if (result.success) {
        toast.success("Repayment proof submitted.");
        setSelectedInvoice(null);
        await fetchFundedInvoices();
      } else {
        toast.error(result.error || "Submission failed.");
      }
    } catch (error) {
      toast.error("System error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDispute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await raiseDisputeAction(formData);
      if (result.success) {
        toast.success("Dispute raised successfully.");
        setShowDispute(false);
        setSelectedInvoice(null);
      } else {
        toast.error(result.error || "Failed to raise dispute.");
      }
    } catch (error) {
      toast.error("System error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Loading Investment Ecosystem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Investment Interactions</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Manage funded assets, repayment obligations, and investor relations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {fundedInvoices.length === 0 ? (
          <Card className="glass-dark border-white/5 p-20 text-center space-y-6">
            <div className="mx-auto w-24 h-24 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10">
              <Zap className="w-12 h-12 text-white/10" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-black text-white italic">No Active Investments</p>
              <p className="text-muted-foreground font-medium max-w-sm mx-auto">Once your invoices are funded by investors, they will appear here for management.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {fundedInvoices.map((invoice) => {
              const outstanding = calculateOutstandingBalance(invoice.repayments || []);
              const progress = invoice.amount > 0 ? ((Number(invoice.amount) - outstanding) / Number(invoice.amount)) * 100 : 0;
              
              return (
                <Card key={invoice.id} className="glass-dark border-white/5 hover:border-primary/20 transition-all duration-500 overflow-hidden group">
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Funding</p>
                        <h3 className="text-2xl font-black text-white italic">#{invoice.invoice_number}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{invoice.buyer_name}</p>
                      </div>
                      <Badge className={`${invoice.status === 'funded' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'} font-black uppercase tracking-widest text-[8px] h-6`}>
                        {invoice.status === 'funded' ? 'Fully Funded' : 'Partially Funded'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Amount</p>
                        <p className="text-lg font-black text-white">{formatINR(invoice.amount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Outstanding</p>
                        <p className="text-lg font-black text-orange-500">{formatINR(outstanding)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground">Repayment Progress</span>
                        <span className="text-white">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-white/5" />
                    </div>

                    <div className="pt-6 border-t border-white/5 flex gap-3">
                      <Button 
                        onClick={() => setSelectedInvoice(invoice)}
                        className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] border border-white/10"
                      >
                        Manage interaction
                      </Button>
                      <Button 
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDispute(true);
                        }}
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <MessageSquareWarning className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Interaction Modal */}
      {selectedInvoice && !showDispute && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedInvoice(null)} />
          <Card className="relative w-full max-w-4xl glass-dark border-white/10 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] flex flex-col">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black italic">Invoice #{selectedInvoice.invoice_number}</CardTitle>
                <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Managing Investment Obligations</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(null)} className="hover:bg-white/5 text-muted-foreground">
                <Clock className="w-6 h-6 rotate-45" />
              </Button>
            </CardHeader>

            <div className="flex border-b border-white/5 shrink-0">
              {['details', 'schedule', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-white hover:bg-white/[0.02]'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'details' && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Participating Investor(s)</p>
                        {selectedInvoice.investments && selectedInvoice.investments.length > 0 ? (
                          <div className="space-y-3">
                            {selectedInvoice.investments.map((inv: any, idx: number) => (
                              <div key={idx} className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <p className="text-sm font-black text-white italic">{inv.profiles?.company_name || inv.profiles?.full_name}</p>
                                <p className="text-[9px] font-bold text-primary uppercase tracking-tighter">Participation: {formatINR(inv.amount)}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-lg font-black text-white italic">Institutional Treasury</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Capital Deployed</p>
                        <p className="text-lg font-black text-emerald-500 italic">{formatINR(selectedInvoice.funded_amount || selectedInvoice.amount)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Date</p>
                        <p className="text-lg font-black text-white">{new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="md:col-span-2 bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-white uppercase tracking-widest">Funding Agreement Details</p>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Discounting Rate</p>
                          <p className="text-sm font-bold text-white">{(selectedInvoice.discount_rate * 100).toFixed(2)}% Flat</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Platform Fee</p>
                          <p className="text-sm font-bold text-white">1.5% Processing</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Repayment Mode</p>
                          <p className="text-sm font-bold text-white">Manual RTGS/NEFT</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Legal Status</p>
                          <p className="text-sm font-bold text-emerald-500">Execution Complete</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="bg-orange-500/5 border-orange-500/10 p-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <p className="text-xs font-black text-white uppercase tracking-widest">Repayment Action</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                        Initiate a manual repayment for the outstanding balance. Provide UTR for verification.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('schedule')}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] h-12"
                      >
                        Make Repayment
                      </Button>
                    </Card>

                    <Card className="bg-primary/5 border-primary/10 p-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-primary" />
                        <p className="text-xs font-black text-white uppercase tracking-widest">Pre-closure Request</p>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                        Settle your obligations before the due date. A 2% pre-closure fee applies.
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => setShowPreClosure(true)}
                        className="w-full border-primary/20 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] h-12"
                      >
                        Request Pre-closure
                      </Button>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Scheduled Repayments</p>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/10 text-muted-foreground">Standard 1-Tranche Repayment</Badge>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                          <th className="p-6 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Due Date</th>
                          <th className="p-6 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Amount Due</th>
                          <th className="p-6 text-[9px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                          <th className="p-6 text-right text-[9px] font-black text-muted-foreground uppercase tracking-widest">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {(selectedInvoice.repayments || []).map((r: any) => (
                          <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-6">
                              <p className="text-sm font-bold text-white">{new Date(r.due_date).toLocaleDateString()}</p>
                              <p className="text-[9px] text-muted-foreground">Standard Schedule</p>
                            </td>
                            <td className="p-6 font-black text-white text-sm">{formatINR(r.amount_due)}</td>
                            <td className="p-6">
                              <Badge className={`uppercase tracking-widest text-[8px] font-black ${r.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                {r.status}
                              </Badge>
                            </td>
                            <td className="p-6 text-right">
                              {r.status !== 'paid' && (
                                <form onSubmit={handleRepayment} className="flex items-center justify-end gap-3">
                                  <input type="hidden" name="repayment_id" value={r.id} />
                                  <input 
                                    name="utr" 
                                    required 
                                    placeholder="UTR #" 
                                    className="h-10 w-32 bg-white/5 border border-white/10 rounded-lg px-3 text-[10px] text-white focus:outline-none focus:border-primary/50"
                                  />
                                  <input 
                                    name="amount_paid" 
                                    type="hidden" 
                                    value={r.amount_due}
                                  />
                                  <Button type="submit" disabled={isSubmitting} className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[8px]">
                                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Verify Pay"}
                                  </Button>
                                </form>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-4">
                    <Info className="w-5 h-5 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                      Manual repayments require platform verification. Please ensure the UTR matches your bank statement for instant processing.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                   <div className="flex justify-between items-center px-4">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Transaction Ledger</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5">
                    {selectedInvoice.repayments?.filter((r: any) => r.status === 'paid').length === 0 ? (
                      <div className="p-20 text-center text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">
                        No transactions recorded yet.
                      </div>
                    ) : (
                      selectedInvoice.repayments?.filter((r: any) => r.status === 'paid').map((r: any) => (
                        <div key={r.id} className="p-6 flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                              <History className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">Full Repayment Settlement</p>
                              <p className="text-[9px] text-muted-foreground uppercase">Ref: {r.payment_reference || "N/A"}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-emerald-500">+{formatINR(r.amount_paid)}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">{new Date(r.payment_date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-8 border-t border-white/5 bg-white/[0.01] shrink-0">
               <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total Liability Cleared</p>
                  <p className="text-lg font-black text-white">
                    {formatINR(selectedInvoice.repayments?.filter((r: any) => r.status === 'paid').reduce((sum: number, r: any) => sum + Number(r.amount_paid), 0) || 0)}
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <p className="text-[10px] font-black text-white uppercase tracking-widest italic">Institutional Grade Security</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Pre-closure Modal */}
      {showPreClosure && selectedInvoice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowPreClosure(false)} />
          <Card className="relative w-full max-w-lg glass-dark border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 p-10 space-y-10">
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white italic">Pre-closure Settlement</h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Invoice #{selectedInvoice.invoice_number}</p>
            </div>

            <div className="space-y-6">
              {(() => {
                const details = calculatePreClosureDetails(selectedInvoice.repayments || []);
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Outstanding Principal</span>
                      <span className="text-lg font-black text-white">{formatINR(details.outstandingPrincipal)}</span>
                    </div>
                    <div className="flex justify-between items-center py-4 border-b border-white/5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Pre-closure Fee (2%)</span>
                      <span className="text-lg font-black text-orange-500">+{formatINR(details.preClosureFee)}</span>
                    </div>
                    <div className="flex justify-between items-center py-6">
                      <span className="text-xs font-black text-white uppercase tracking-widest">Total Settlement Amount</span>
                      <span className="text-3xl font-black text-emerald-500">{formatINR(details.totalSettlement)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4">
              <AlertCircle className="w-6 h-6 text-primary shrink-0" />
              <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                By confirming, you request the platform to generate a final settlement invoice. This action is irreversible once approved by the treasury.
              </p>
            </div>

            <div className="flex gap-4">
              <Button 
                variant="ghost" 
                onClick={() => setShowPreClosure(false)}
                className="flex-1 h-14 font-black uppercase tracking-widest text-[11px]"
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[11px]"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  const details = calculatePreClosureDetails(selectedInvoice.repayments || []);
                  const result = await requestPreClosureAction(selectedInvoice.id, details);
                  if (result.success) {
                    toast.success("Pre-closure request sent to treasury.");
                    setShowPreClosure(false);
                    setSelectedInvoice(null);
                  } else {
                    toast.error(result.error || "Failed to send request.");
                  }
                  setIsSubmitting(false);
                }}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Settlement"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dispute Modal */}
      {showDispute && selectedInvoice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowDispute(false)} />
          <Card className="relative w-full max-w-lg glass-dark border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 p-10">
            <form onSubmit={handleDispute} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-white italic">Raise Dispute</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Invoice #{selectedInvoice.invoice_number}</p>
              </div>

              <input type="hidden" name="invoice_id" value={selectedInvoice.id} />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dispute Reason</label>
                  <select 
                    name="subject"
                    required
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white font-bold text-sm focus:outline-none focus:border-primary/50 appearance-none"
                  >
                    <option value="" disabled selected className="bg-zinc-900">Select reason</option>
                    <option value="Repayment Discrepancy" className="bg-zinc-900">Repayment Discrepancy</option>
                    <option value="Funding Amount Mismatch" className="bg-zinc-900">Funding Amount Mismatch</option>
                    <option value="Delayed Disbursement" className="bg-zinc-900">Delayed Disbursement</option>
                    <option value="Agreement Conflict" className="bg-zinc-900">Agreement Conflict</option>
                    <option value="Other" className="bg-zinc-900">Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Detailed Explanation</label>
                  <textarea 
                    name="message"
                    required
                    rows={4}
                    placeholder="Provide full details of the issue..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-medium text-sm focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button"
                  variant="ghost" 
                  onClick={() => setShowDispute(false)}
                  className="flex-1 h-14 font-black uppercase tracking-widest text-[11px]"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[11px]"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Raise Dispute"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
