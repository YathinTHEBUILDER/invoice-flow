"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Plus,
  Loader2,
  TrendingUp,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { getInvestorStats } from "@/app/actions/investor";
import { formatINR } from "@/lib/utils";
import { createClient } from "@/lib/client";

export default function InvestorWalletPage() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getInvestorStats();
      setStats(data);

      const supabase = createClient();
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      setTransactions(txData || []);
    } catch (error) {
      console.error("Failed to fetch wallet data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Ledger State...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Capital Wallet</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Strategic liquidity management and transaction transparency.</p>
        </div>
        <div className="flex gap-4">
          <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 rounded-2xl">
            <Plus className="mr-2 h-5 w-5" /> Add Liquidity
          </Button>
          <Button variant="outline" className="h-14 px-10 border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">
            <ArrowDownLeft className="mr-2 h-5 w-5" /> Withdraw Funds
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <Card className="lg:col-span-2 glass-dark border-white/5 overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-64 h-64 text-white" />
           </div>
           <CardContent className="p-12 relative z-10 space-y-10">
              <div className="space-y-2">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Available for Deployment</p>
                 <h3 className="text-7xl font-black text-white tracking-tighter italic">
                    {formatINR(stats?.walletBalance || 0)}
                 </h3>
              </div>

              <div className="grid grid-cols-3 gap-10 pt-10 border-t border-white/5">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Invested</p>
                    <p className="text-2xl font-black text-white italic">{formatINR(stats?.totalInvested || 0)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Returns Received</p>
                    <p className="text-2xl font-black text-emerald-400 italic">{formatINR(stats?.receivedPayouts || 0)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Accruing Returns</p>
                    <p className="text-2xl font-black text-blue-400 italic">{formatINR(stats?.pendingReturns || 0)}</p>
                 </div>
              </div>
           </CardContent>
        </Card>

        {/* Quick Stats/Actions */}
        <div className="space-y-8">
           <Card className="glass-dark border-white/5 overflow-hidden">
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                       <ShieldCheck className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-black text-white italic uppercase tracking-widest">Bank Verification</p>
                 </div>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                       <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-black text-white uppercase tracking-widest">HDFC BANK</p>
                             <p className="text-[10px] text-muted-foreground italic">•••• 4829</p>
                          </div>
                       </div>
                       <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[8px] font-black uppercase tracking-widest">Active</Badge>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <div className="p-8 rounded-[30px] bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-3 mb-4">
                 <TrendingUp className="w-5 h-5 text-emerald-500" />
                 <p className="text-xs font-black text-white italic uppercase tracking-widest">Yield Momentum</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                 Your annualized yield curve is trending at 14.2% across your current MSME asset allocation.
              </p>
           </div>
        </div>
      </div>

      {/* Transaction History */}
      <Card className="glass-dark border-white/5 overflow-hidden">
        <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
           <div className="flex justify-between items-center">
              <div className="space-y-1">
                 <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">Transaction Ledger</CardTitle>
                 <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Institutional-grade financial audit log</CardDescription>
              </div>
              <Button variant="outline" className="h-10 border-white/10 text-[10px] font-black uppercase tracking-widest rounded-xl">
                 <History className="mr-2 h-4 w-4" /> Export Ledger
              </Button>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="border-b border-white/5">
                       <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Date / Time</th>
                       <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Description</th>
                       <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Type</th>
                       <th className="px-10 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Amount</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {transactions.length === 0 ? (
                       <tr>
                          <td colSpan={4} className="px-10 py-20 text-center text-muted-foreground font-medium italic">No recorded transactions in this ledger.</td>
                       </tr>
                    ) : (
                       transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="px-10 py-6">
                                <p className="text-xs font-bold text-white italic">{new Date(tx.created_at).toLocaleDateString()}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(tx.created_at).toLocaleTimeString()}</p>
                             </td>
                             <td className="px-10 py-6">
                                <p className="text-xs font-medium text-white italic">{tx.description}</p>
                             </td>
                             <td className="px-10 py-6 text-center">
                                <Badge variant="outline" className={`h-6 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                   tx.type === 'investment' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : 
                                   tx.type === 'repayment' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                                   'border-white/10 text-muted-foreground bg-white/5'
                                }`}>
                                   {tx.type}
                                </Badge>
                             </td>
                             <td className={`px-10 py-6 text-right font-black italic ${tx.amount < 0 ? 'text-white' : 'text-emerald-400'}`}>
                                {tx.amount > 0 ? '+' : ''}{formatINR(tx.amount)}
                             </td>
                          </tr>
                       ))
                    )}
                 </tbody>
              </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
