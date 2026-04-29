"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  TrendingUp, 
  Clock, 
  Calendar,
  Building2,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ShieldCheck,
  History
} from "lucide-react";
import { getInvestorPortfolio } from "@/app/actions/investor";
import { formatINR } from "@/lib/utils";

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

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Active Portfolio</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Comprehensive governance of your deployed liquidity.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 px-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Assets</p>
            <p className="text-xl font-black text-white italic">{investments.filter(i => i.status === 'funded').length}</p>
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
            const repayment = inv.repayments?.[0];
            const isRepaid = repayment?.status === 'paid';
            
            return (
              <Card key={inv.id} className="glass-dark border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-500">
                <CardContent className="p-0">
                  <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                    {/* Asset ID & Entity */}
                    <div className="w-full md:w-1/4 space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Asset # {inv.invoice_number}</p>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">{inv.profiles?.company_name}</h3>
                      </div>
                      <Badge variant="outline" className={`h-8 px-4 rounded-xl text-[8px] font-black uppercase tracking-widest ${isRepaid ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
                        {isRepaid ? 'Completed' : 'Active Deployment'}
                      </Badge>
                    </div>

                    {/* Financial Metrics */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 w-full border-x border-white/5 px-10">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Principal</p>
                        <p className="text-xl font-black text-white italic">{formatINR(inv.amount)}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Expected Return</p>
                        <p className="text-xl font-black text-emerald-400 italic">{formatINR(Number(repayment?.amount_due || 0) - Number(inv.amount))}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Due Date</p>
                        <p className="text-xl font-black text-white italic">{repayment ? new Date(repayment.due_date).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tenure</p>
                        <p className="text-xl font-black text-white italic">{inv.tenure_days} Days</p>
                      </div>
                    </div>

                    {/* Action/Progress */}
                    <div className="w-full md:w-1/4 space-y-6 text-center md:text-right">
                       <div className="space-y-2">
                          <div className="flex justify-between items-end mb-1 md:justify-end md:gap-4">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Progress</p>
                             <p className="text-[10px] font-black text-white uppercase tracking-widest">{isRepaid ? '100%' : 'Deployed'}</p>
                          </div>
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${isRepaid ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: isRepaid ? '100%' : '60%' }} />
                          </div>
                       </div>
                       <div className="flex justify-end gap-3">
                          <div className="p-3 rounded-xl bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer border border-white/5">
                             <History className="w-4 h-4" />
                          </div>
                          <div className="p-3 rounded-xl bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer border border-white/5">
                             <ShieldCheck className="w-4 h-4" />
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
