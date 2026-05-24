"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  IndianRupee, 
  ShieldAlert, 
  Settings as SettingsIcon,
  Save,
  Loader2,
  Wallet,
  Plus,
  TrendingUp,
  History,
  X,
  AlertCircle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Fingerprint
} from "lucide-react";
import { getPlatformSettings, updateSettingAction } from "@/app/actions/admin";
import { getInvestorStats, addFundsAction, withdrawFundsAction } from "@/app/actions/investor";
import { createClient } from "@/lib/client";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function SettingsPage() {
  const [role, setRole] = useState<string | null>(null);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [investorStats, setInvestorStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isWithdrawingFunds, setIsWithdrawingFunds] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userRole = user?.app_metadata?.role || user?.user_metadata?.role || "investor";
        setRole(userRole);

        if (userRole === 'admin') {
          const data = await getPlatformSettings();
          setSettings(data);
        } else if (userRole === 'investor') {
          const stats = await getInvestorStats();
          setInvestorStats(stats);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load settings data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      const result = await updateSettingAction({ key, value });
      if (result?.data?.success) {
        setSettings(prev => ({ ...prev, [key]: value }));
        toast.success(`Setting "${key}" updated successfully.`);
      } else {
        toast.error(result?.serverError || "Failed to update setting.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(null);
    }
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid Amount", { description: "Please enter a valid positive number." });
      return;
    }

    setProcessing(true);
    try {
      const result = await addFundsAction({ amount });
      if (result?.data?.success) {
        toast.success("Cash Added", { 
          description: `₹${amount.toLocaleString('en-IN')} has been successfully credited.` 
        });
        setAddAmount("");
        setIsAddingFunds(false);
        // Refresh stats
        const stats = await getInvestorStats();
        setInvestorStats(stats);
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

    if (amount > (investorStats?.walletBalance || 0)) {
      toast.error("Insufficient Funds", { description: "You cannot withdraw more than your available balance." });
      return;
    }

    setProcessing(true);
    try {
      const result = await withdrawFundsAction({ amount });
      if (result?.data?.success) {
        toast.success("Withdrawal Requested", { 
          description: `₹${amount.toLocaleString('en-IN')} has been successfully reserved.` 
        });
        setWithdrawAmount("");
        setIsWithdrawingFunds(false);
        // Refresh stats
        const stats = await getInvestorStats();
        setInvestorStats(stats);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // --- INVESTOR VIEW ---
  if (role === 'investor') {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-primary" /> Investor Settings
          </h1>
          <p className="text-muted-foreground font-medium text-sm">Manage your investment preferences and capital wallet.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet Overview Card */}
          <Card className="lg:col-span-2 glass-dark border-white/5 relative overflow-hidden group rounded-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-48 h-48 text-white" />
            </div>
            <CardHeader className="border-b border-white/5 p-8 relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-2xl font-bold text-white tracking-tight">Fund Management</CardTitle>
                  <CardDescription className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Cash control and review</CardDescription>
                </div>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold uppercase tracking-wider text-[8px] rounded-full">Verified Ledger</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8 relative z-10 space-y-8">
              <div className="flex flex-col md:flex-row justify-between gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available Cash</p>
                  <p className="text-4xl font-bold text-white">{formatINR(investorStats?.walletBalance || 0)}</p>
                </div>
                <div className="flex items-end pb-1 gap-4">
                  <Button 
                    onClick={() => setIsAddingFunds(true)}
                    className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[10px] shadow-2xl shadow-primary/20 rounded-xl"
                  >
                    <Plus className="mr-2 w-5 h-5" /> Add Funds
                  </Button>
                  <Button 
                    onClick={() => setIsWithdrawingFunds(true)}
                    variant="outline"
                    className="h-14 px-8 border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl"
                  >
                    <IndianRupee className="mr-2 w-5 h-5" /> Withdraw
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/5">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Total Invested</p>
                  <p className="text-lg font-bold text-white">{formatINR(investorStats?.totalInvested || 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Locked Capital</p>
                  <p className="text-lg font-bold text-white">{formatINR(investorStats?.lockedAmount || 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Returns Received</p>
                  <p className="text-lg font-bold text-emerald-400">{formatINR(investorStats?.receivedReturns || 0)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Pending Payouts</p>
                  <p className="text-lg font-bold text-blue-400">{formatINR(investorStats?.pendingRepayments || 0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Actions / Quick Links */}
          <div className="space-y-6">
            <Card className="glass-dark border-white/5 p-6 rounded-2xl">
              <CardTitle className="text-xs font-bold uppercase tracking-wider mb-6 text-white/60">Quick Access</CardTitle>
              <div className="space-y-3">
                <Link href="/investor/wallet" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <History className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">Full Transaction Ledger</span>
                </Link>
                <Link href="/investor/portfolio" className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">Yield Performance Analytics</span>
                </Link>
              </div>
            </Card>

            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Manual Clearing Enforced</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Withdrawals are processed manually within 24-48 hours after security verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <Card className="glass-dark border-white/5 p-6 rounded-2xl">
              <CardTitle className="text-xs font-bold uppercase tracking-wider mb-6 text-white/60 flex items-center gap-2">
                <History className="w-3 h-3" /> Recent Activity
              </CardTitle>
              <div className="space-y-4">
                {investorStats?.recentTransactions?.length > 0 ? (
                  investorStats.recentTransactions.map((tx: any) => (
                    <div key={tx.id} className="flex justify-between items-center group/item">
                      <div className="flex gap-3 items-center">
                        <div className={`p-2 rounded-lg ${tx.amount < 0 ? 'bg-white/5 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {tx.amount < 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-bold text-white uppercase tracking-tight line-clamp-1">{tx.description}</p>
                          <p className="text-[8px] text-muted-foreground font-medium uppercase tracking-wider">{new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <p className={`text-[10px] font-bold ${tx.amount < 0 ? 'text-white' : 'text-emerald-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatINR(tx.amount)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-muted-foreground text-center py-4">No recent activity.</p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Add Funds Modal Overlay */}
        {isAddingFunds && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <Card className="w-full max-w-md glass-dark border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl">
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
                <CardTitle className="text-2xl font-bold text-white tracking-tight">Add Cash</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Increase your available capital</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleAddFunds} className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Investment Amount (₹)</label>
                    <div className="relative group">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input 
                        type="number"
                        value={addAmount}
                        onChange={(e) => setAddAmount(e.target.value)}
                        placeholder="e.g. 1,00,000"
                        className="pl-12 bg-white/5 border-white/10 h-16 font-bold text-2xl text-white focus:bg-white/10 transition-all placeholder:text-white/10"
                        autoFocus
                      />
                    </div>
                    {addAmount && (
                      <p className="text-[10px] text-emerald-400 font-bold text-right animate-in fade-in">
                        ≈ ₹{parseFloat(addAmount).toLocaleString('en-IN')} INR
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit"
                    disabled={processing}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[10px] shadow-2xl shadow-primary/20 rounded-xl"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Confirm Cash Addition
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Withdraw Funds Modal Overlay */}
        {isWithdrawingFunds && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <Card className="w-full max-w-md glass-dark border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 rounded-2xl">
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
                  <IndianRupee className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl font-bold text-white tracking-tight">Withdraw Capital</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Transfer cash to bank account</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <form onSubmit={handleWithdrawFunds} className="space-y-8">
                  <div className="space-y-6">
                    {/* Bank Details Verification */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-4">
                      <div className="flex items-center gap-3">
                        <Fingerprint className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Destination Account</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">Account Number</p>
                          <p className="text-xs font-bold text-white">•••• {investorStats?.bankDetails?.accountNo?.slice(-4) || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">IFSC Code</p>
                          <p className="text-xs font-bold text-primary uppercase">{investorStats?.bankDetails?.ifscCode || "N/A"}</p>
                        </div>
                      </div>
                      {!investorStats?.bankDetails?.accountNo && (
                        <p className="text-[10px] text-red-400 font-bold flex items-center gap-2">
                          <ShieldAlert className="w-3 h-3" /> No bank account linked. Update profile.
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-end">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Withdrawal Amount (₹)</label>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Available: <span className="text-white">{formatINR(investorStats?.walletBalance || 0)}</span></p>
                      </div>
                      <div className="relative group">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="e.g. 50,000"
                          className="pl-12 bg-white/5 border-white/10 h-16 font-bold text-2xl text-white focus:bg-white/10 transition-all placeholder:text-white/10"
                          autoFocus
                        />
                      </div>
                      {withdrawAmount && (
                        <p className="text-[10px] text-orange-400 font-bold text-right animate-in fade-in">
                          ≈ ₹{parseFloat(withdrawAmount).toLocaleString('en-IN')} INR
                        </p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    disabled={processing || !withdrawAmount || parseFloat(withdrawAmount) > (investorStats?.walletBalance || 0) || !investorStats?.bankDetails?.accountNo}
                    className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold uppercase tracking-wider text-[10px] shadow-2xl shadow-orange-500/20 rounded-xl"
                  >
                    {processing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <IndianRupee className="w-5 h-5 mr-2" />
                        Confirm Withdrawal
                      </>
                    )}
                  </Button>
                  <p className="text-[8px] text-muted-foreground text-center uppercase tracking-wider font-bold">
                    Funds will be reserved and transferred within 48 hours.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    );
  }

  // --- ADMIN VIEW ---
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" /> Platform Configuration
        </h1>
        <p className="text-muted-foreground font-medium text-sm">Manage global settings and business logic parameters.</p>
      </div>

      <Card className="glass-dark border-white/5 rounded-2xl">
        <CardHeader className="border-b border-white/5 p-8">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Financial Parameters</CardTitle>
          <CardDescription>Configure core financial ratios and fees.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Platform Commission Fee (%)</label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  step="0.1"
                  value={settings.platform_commission || "1.0"}
                  onChange={(e) => setSettings(prev => ({ ...prev, platform_commission: e.target.value }))}
                  className="bg-white/5 border-white/10 font-bold text-xl h-14"
                />
                <Button 
                  onClick={() => handleUpdateSetting('platform_commission', settings.platform_commission)}
                  disabled={saving === 'platform_commission'}
                  className="h-14 px-6 font-bold rounded-xl"
                >
                  {saving === 'platform_commission' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Fixed percentage applied to all invoice values (Official Model).</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Pre-Closure Penalty Fee (%)</label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  step="0.1"
                  value={settings.preclosure_penalty || "2.5"}
                  onChange={(e) => setSettings(prev => ({ ...prev, preclosure_penalty: e.target.value }))}
                  className="bg-white/5 border-white/10 font-bold text-xl h-14"
                />
                <Button 
                  onClick={() => handleUpdateSetting('preclosure_penalty', settings.preclosure_penalty)}
                  disabled={saving === 'preclosure_penalty'}
                  className="h-14 px-6 font-bold rounded-xl"
                >
                  {saving === 'preclosure_penalty' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-2 w-4 h-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Applied on principal amount for early settlements.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-dark border-white/5 rounded-2xl">
        <CardHeader className="border-b border-white/5 p-8">
          <CardTitle className="text-2xl font-bold text-white tracking-tight">Platform Governance</CardTitle>
          <CardDescription>Manual oversight and system controls.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-between p-6 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">Manual Verification Protocol</p>
              <p className="text-sm text-muted-foreground font-medium">All KYC and Invoice approvals require explicit administrator authorization.</p>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-bold rounded-full">
              ENFORCED
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
