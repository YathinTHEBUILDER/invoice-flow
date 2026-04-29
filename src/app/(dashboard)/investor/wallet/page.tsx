"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Plus, Loader2, TrendingUp, ShieldCheck, CreditCard, IndianRupee, AlertCircle, X } from "lucide-react";
import { getInvestorStats, addFundsAction, withdrawFundsAction } from "@/app/actions/investor";
import { formatINR, formatIndianNumber, formatDate } from "@/lib/utils";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function InvestorWalletPage() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isWithdrawingFunds, setIsWithdrawingFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid positive number." });
      return;
    }

    if (amount < 100) {
      toast.error("Minimum Requirement", { description: "Minimum liquidity addition is ₹100." });
      return;
    }

    setProcessing(true);
    try {
      const result = await addFundsAction({ amount });
      if (result?.data?.success) {
        toast.success("Liquidity Added", { 
          description: `₹${formatIndianNumber(amount)} has been successfully credited to your wallet.` 
        });
        setAddAmount("");
        setIsAddingFunds(false);
        fetchData(); // Refresh data
      } else {
        toast.error("Transaction Failed", { description: result?.serverError || "An error occurred." });
      }
    } catch (error) {
      toast.error("Critical System Error", { description: "Failed to process the transaction." });
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdrawFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid positive number." });
      return;
    }

    if (amount > (stats?.walletBalance || 0)) {
      toast.error("Insufficient Funds", { description: "You cannot withdraw more than your available balance." });
      return;
    }

    setProcessing(true);
    try {
      const result = await withdrawFundsAction({ amount });
      if (result?.data?.success) {
        toast.success("Withdrawal Requested", { 
          description: `₹${formatIndianNumber(amount)} has been reserved for withdrawal to your bank account.` 
        });
        setWithdrawAmount("");
        setIsWithdrawingFunds(false);
        fetchData(); // Refresh data
      } else {
        toast.error("Withdrawal Failed", { description: result?.serverError || "An error occurred." });
      }
    } catch (error) {
      toast.error("Critical System Error", { description: "Failed to process the withdrawal." });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Ledger State...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 relative">
      {/* Modal Overlay for Adding Funds */}
      {isAddingFunds && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md glass-dark border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="p-8 border-b border-white/5 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAddingFunds(false)}
                className="absolute top-4 right-4 rounded-full text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit mb-4">
                <IndianRupee className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">Add Liquidity</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Add capital to your investment wallet</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleAddFunds} className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Deployment Amount (₹)</label>
                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      placeholder="e.g. 50,000"
                      className="pl-12 bg-white/5 border-white/10 h-16 font-black italic text-2xl text-white focus:bg-white/10 transition-all placeholder:text-white/10"
                      autoFocus
                    />
                  </div>
                  {addAmount && (
                    <p className="text-[10px] text-emerald-400 font-bold italic text-right animate-in fade-in">
                      ≈ ₹{formatIndianNumber(parseFloat(addAmount))} INR
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
                  <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
                  <p className="text-[10px] text-blue-400/80 font-medium leading-relaxed italic">
                    Funds will be instantly credited to your wallet balance for immediate marketplace deployment.
                  </p>
                </div>

                <Button 
                  type="submit"
                  disabled={processing}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 rounded-2xl"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
                  Confirm Liquidity Addition
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal Overlay for Withdrawing Funds */}
      {isWithdrawingFunds && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <Card className="w-full max-w-md glass-dark border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <CardHeader className="p-8 border-b border-white/5 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsWithdrawingFunds(false)}
                className="absolute top-4 right-4 rounded-full text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 w-fit mb-4">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">Withdraw Capital</CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Transfer funds to your registered bank account</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleWithdrawFunds} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Withdrawal Amount (₹)</label>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available: <span className="text-white">{formatINR(stats?.walletBalance || 0)}</span></p>
                  </div>
                  <div className="relative group">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="e.g. 25,000"
                      className="pl-12 pr-16 bg-white/5 border-white/10 h-16 font-black italic text-2xl text-white focus:bg-white/10 transition-all placeholder:text-white/10"
                      autoFocus
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setWithdrawAmount((stats?.walletBalance || 0).toString())}
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-2 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 rounded-lg transition-all"
                    >
                      MAX
                    </Button>
                  </div>
                  {withdrawAmount && (
                    <div className="space-y-2 py-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                        <span>Gross Withdrawal</span>
                        <span>₹{formatIndianNumber(parseFloat(withdrawAmount))}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-orange-400/60">
                        <span>Platform Fee (0.42%)</span>
                        <span>- ₹{formatIndianNumber(parseFloat(withdrawAmount) * 0.0042)}</span>
                      </div>
                      <div className="h-px bg-white/5" />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Net Settlement</span>
                        <span className="text-xl font-black italic text-emerald-400">₹{formatIndianNumber(parseFloat(withdrawAmount) * (1 - 0.0042))}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex gap-3">
                  <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest leading-none">Security Protocol</p>
                    <p className="text-[10px] text-orange-400/80 font-medium leading-relaxed italic">
                      Funds will be transferred to your verified HDFC Bank account (•••• 4829) within 24-48 business hours.
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={processing || !withdrawAmount || parseFloat(withdrawAmount) > (stats?.walletBalance || 0)}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-orange-500/20 rounded-2xl"
                >
                  {processing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowDownLeft className="w-5 h-5 mr-2" />}
                  Confirm Withdrawal Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}


      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Capital Wallet</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Strategic liquidity management and transaction transparency.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => setIsAddingFunds(true)}
            className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Liquidity
          </Button>
          <Button 
            onClick={() => setIsWithdrawingFunds(true)}
            variant="outline" 
            className="h-14 px-10 border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl transition-all hover:scale-105 active:scale-95"
          >
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-white/5">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Total Invested</p>
                    <p className="text-xl font-black text-white italic">{formatINR(stats?.totalInvested || 0)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Locked Capital</p>
                    <p className="text-xl font-black text-blue-400 italic">{formatINR(stats?.lockedBalance || 0)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Returns Received</p>
                    <p className="text-xl font-black text-emerald-400 italic">{formatINR(stats?.receivedPayouts || 0)}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Accruing Returns</p>
                    <p className="text-xl font-black text-yellow-500 italic">{formatINR(stats?.pendingReturns || 0)}</p>
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
                 Your annualized yield curve is trending at {stats?.expectedARR || '14.2'}% across your current MSME asset allocation.
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
                                <p className="text-xs font-bold text-white italic">{formatDate(tx.created_at)}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{new Date(tx.created_at).toLocaleTimeString()}</p>
                             </td>
                             <td className="px-10 py-6">
                                <p className="text-xs font-medium text-white italic">{tx.description}</p>
                             </td>
                             <td className="px-10 py-6 text-center">
                                <Badge variant="outline" className={`h-6 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                   tx.type === 'investment' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : 
                                   tx.type === 'repayment' ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' :
                                   tx.type === 'funding' ? 'border-primary/20 text-primary bg-primary/5' :
                                   tx.type === 'withdrawal' ? 'border-orange-500/20 text-orange-400 bg-orange-500/5' :
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
