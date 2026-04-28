"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowRight,
  Info,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { createClient } from "@/lib/client";
import { formatINR } from "@/lib/format";

export default function FundingPage() {
  const [fundingRequests, setFundingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFundingRequests();
  }, []);

  async function fetchFundingRequests() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
    if (user) {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("msme_id", user.id)
        .in("status", ["approved", "funded"])
        .order("created_at", { ascending: false });
      setFundingRequests(data || []);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Funding Requests</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Monitor investor participation and disbursement status.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-black italic">Active Funding</CardTitle>
            <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Invoices available for investment or already funded</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Scanning Market Activity...</p>
              </div>
            ) : fundingRequests.length === 0 ? (
              <div className="text-center py-32 space-y-6">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                  <TrendingUp className="w-10 h-10 text-white/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black text-xl italic">No Funding Requests</p>
                  <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">Once your invoices are approved by admin, they will appear here for investor funding.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {fundingRequests.map((request) => (
                  <div key={request.id} className="p-8 hover:bg-white/[0.02] transition-colors group">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <PieChart className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-lg font-black text-white">{request.invoice_number}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{request.buyer_name}</p>
                          </div>
                        </div>
                        <div className="flex gap-6">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</p>
                            <p className="text-sm font-black text-white">{formatINR(request.amount)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Discount Rate</p>
                            <p className="text-sm font-black text-emerald-500">{(request.discount_rate * 100).toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tenure</p>
                            <p className="text-sm font-black text-white">{request.tenure_days} Days</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <Badge className={`h-8 px-4 font-black uppercase tracking-widest text-[9px] ${request.status === 'funded' ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'}`}>
                          {request.status === 'funded' ? 'Disbursed' : 'In Marketplace'}
                        </Badge>
                        <p className="text-[10px] font-bold text-muted-foreground italic">
                          {request.status === 'funded' ? 'Investor assigned' : 'Waiting for investors...'}
                        </p>
                      </div>
                    </div>
                    
                    {request.status === 'funded' && (
                      <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-primary/20 text-primary">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white italic">Funding Successfully Allocated</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Funds transferred to registered bank account</p>
                          </div>
                        </div>
                        <Button variant="ghost" className="text-[9px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                          View Breakdown <ArrowRight className="ml-2 w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-dark border-white/5 overflow-hidden h-fit">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-black italic">Market Insights</CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Investor Participation</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">Multiple institutional and retail investors are currently active on the platform.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Disbursement Cycle</p>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">Typical T+1 disbursement after investor allocation is completed.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Platform Note</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Funding progress is tracked manually. Investor participation details are updated as soon as commitments are verified by the treasury.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
