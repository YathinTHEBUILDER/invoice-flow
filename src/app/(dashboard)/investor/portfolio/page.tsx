"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Clock, 
  Calendar,
  Building2,
  Loader2,
  ShieldCheck,
  History,
  TrendingUp,
  FileText
} from "lucide-react";
import { getInvestorPortfolio } from "@/app/actions/investor";
import { formatINR, formatIndianNumber, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function InvestorPortfolio() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  async function fetchPortfolio() {
    try {
      const data = await getInvestorPortfolio();
      setInvestments(data);
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Asset States...</p>
      </div>
    );
  }

  const activeParticipation = investments.filter(i => i.status === 'active').length;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Active Portfolio</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Comprehensive governance of your deployed liquidity.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 px-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active participations</p>
            <p className="text-xl font-black text-white italic">{activeParticipation}</p>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {investments.length === 0 ? (
          <div className="py-32 text-center space-y-6 glass-dark border border-white/5 rounded-[40px]">
             <div className="mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-muted-foreground/20" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-white italic">No Deployed Capital</h3>
                <p className="text-muted-foreground font-medium italic">Explore the marketplace to begin building your asset-backed portfolio.</p>
             </div>
          </div>
        ) : (
          investments.map((inv) => {
            const isRepaid = inv.status === 'repaid';
            const invoice = inv.invoices;
            if (!invoice) return null;
            
            // Yield Logic: Calculate days from today until maturity
            const yieldRate = (invoice.discount_rate || 0.145);
            const tenureDays = invoice.tenure_days || 45;
            
            const totalFaceValue = Number(inv.amount);
            const discountAmount = Math.round(totalFaceValue * yieldRate * (tenureDays / 365));
            const deployedCapital = totalFaceValue - discountAmount;
            
            const estimatedReturn = discountAmount;
            const annualizedROI = (discountAmount / deployedCapital) * (365 / tenureDays) * 100;
            
            return (
              <Card key={inv.id} className="glass-dark border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-500">
                <CardContent className="p-0">
                  <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                    {/* Asset ID & Entity */}
                    <div className="w-full md:w-1/4 space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Participation on Asset # {invoice.invoice_number}</p>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{invoice.profiles?.company_name || "Enterprise Asset"}</h3>
                      </div>
                      <Badge variant="outline" className={`h-8 px-4 rounded-xl text-[8px] font-black uppercase tracking-widest ${isRepaid ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
                        {isRepaid ? 'Settled' : 'Active Deployment'}
                      </Badge>
                    </div>

                    {/* Financial Metrics */}
                    <div className="flex-1 flex flex-wrap md:flex-nowrap gap-12 w-full border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0 px-0 md:px-12">
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Principal (Deployed)</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">{formatINR(deployedCapital)}</p>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Est. Yield</p>
                        <p className="text-2xl font-black text-emerald-500 italic tracking-tighter">+{formatINR(estimatedReturn)}</p>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Maturity</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">{formatDate(invoice.due_date)}</p>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">ROI (p.a.)</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter">~{annualizedROI.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Action/Progress */}
                    <div className="w-full md:w-1/4 space-y-8">
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</p>
                             <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                {!isRepaid && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                {isRepaid ? 'Settled' : 'Accruing'}
                             </div>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${isRepaid ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: isRepaid ? '100%' : '65%' }} />
                          </div>
                       </div>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            const url = invoice.documents?.invoice_url;
                            if (url) {
                              window.open(url, '_blank');
                            } else {
                              const mockUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                              toast.info("Invoice document missing. Opening Demo Preview.");
                              window.open(mockUrl, '_blank');
                            }
                          }}
                          className="w-full h-11 border-white/5 bg-white/5 hover:bg-white/10 font-black uppercase tracking-widest text-[9px] rounded-xl group/btn"
                        >
                          <FileText className="mr-2 w-3 h-3 text-muted-foreground group-hover/btn:text-white transition-colors" />
                          View Original Invoice
                        </Button>
                       <div className="flex justify-end items-center gap-4">
                          <div className="p-3 rounded-2xl bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer border border-white/10 hover:bg-white/10 group/btn" title="Transaction History">
                             <History className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          </div>
                          <div className="p-3 rounded-2xl bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer border border-white/10 hover:bg-white/10 group/btn" title="Investment Certificate">
                             <ShieldCheck className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          </div>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Institutional Note */}
      <div className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <ShieldCheck className="w-6 h-6 text-primary" />
           <h4 className="text-xl font-black text-white italic uppercase tracking-tighter">Asset Security Protocol</h4>
        </div>
        <p className="text-sm font-medium text-muted-foreground italic leading-relaxed max-w-4xl">
          All assets in your portfolio are backed by verified receivables and secondary corporate guarantees. Repayments are monitored in real-time by our institutional treasury operations. Overdue positions are immediately transitioned to our legal recovery terminal.
        </p>
      </div>
    </div>
  );
}
