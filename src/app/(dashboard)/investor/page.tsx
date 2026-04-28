"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Wallet, 
  ShieldCheck, 
  Search, 
  Loader2, 
  ArrowUpRight, 
  PieChart, 
  History,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { getInvestorStats } from "@/app/actions/investor";
import { formatINR } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function InvestorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await getInvestorStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load investor stats:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Syncing Capital Command...</p>
      </div>
    );
  }

  const kycStatus = stats?.kycStatus;
  const isVerified = kycStatus === 'verified';

  const statCards = [
    { label: "Portfolio Value", value: formatINR(stats?.totalInvested || 0), sub: `Target ${stats?.expectedARR || 14.5}% Yield`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Total Returns", value: formatINR(stats?.totalReturns || 0), sub: `${formatINR(stats?.pendingReturns || 0)} Accruing`, icon: PieChart, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Received Payouts", value: formatINR(stats?.receivedPayouts || 0), sub: "Settled in Wallet", icon: History, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Capital Command</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Strategic liquidity management & portfolio expansion.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/investor/marketplace">
            <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 rounded-2xl">
              <Search className="mr-2 h-5 w-5" /> Browse Marketplace
            </Button>
          </Link>
          <Link href="/investor/wallet">
            <Button variant="outline" className="h-14 px-10 border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl">
              <Wallet className="mr-2 h-5 w-5" /> Wallet: {formatINR(stats?.walletBalance || 0)}
            </Button>
          </Link>
        </div>
      </div>

      {/* KYC Restriction Banner */}
      {!isVerified && (
        <div className="p-10 rounded-[40px] bg-orange-500/5 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-6">
            <div className="p-6 rounded-[30px] bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-2xl shadow-orange-500/10">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white italic tracking-tighter">Compliance Clearance Required</h3>
              <p className="text-muted-foreground font-medium italic max-w-xl">
                Institutional investment actions are strictly locked until your identity credentials and biometric selfie are manually vetted.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/investor/kyc")}
            className="h-16 px-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-[20px] shadow-2xl shadow-orange-500/20"
          >
            {kycStatus === 'pending' ? "Vetting in Progress..." : "Begin Verification Process"} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="glass-dark border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-500">
            <CardContent className="p-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{stat.value}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Portfolio Overview */}
        <Card className="glass-dark border-white/5 overflow-hidden flex flex-col min-h-[500px]">
          <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex justify-between items-center">
               <div className="space-y-1">
                  <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">Portfolio State</CardTitle>
                  <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Current asset allocation and performance</CardDescription>
               </div>
               <Link href="/investor/portfolio">
                  <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:bg-white/5">View Full Portfolio</Button>
               </Link>
            </div>
          </CardHeader>
          <CardContent className="p-10 flex-1 flex flex-col items-center justify-center">
            {stats?.activeAssets === 0 ? (
               <div className="text-center space-y-6">
                  <div className="mx-auto w-24 h-24 rounded-[30px] bg-white/5 flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                     <PieChart className="w-12 h-12 text-muted-foreground/20" />
                  </div>
                  <div className="space-y-2">
                     <p className="text-muted-foreground font-medium italic">Your capital is awaiting strategic deployment.</p>
                     <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Institutional Liquidity Pool Active</p>
                  </div>
                  <Link href="/investor/marketplace">
                     <Button variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl">
                        Browse Assets
                     </Button>
                  </Link>
               </div>
            ) : (
               <div className="w-full space-y-8">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Positions</p>
                        <p className="text-2xl font-black text-white italic">{stats.activeAssets} Vetted Assets</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                  </div>
               </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Visibility / Treasury Feed */}
        <Card className="glass-dark border-white/5 overflow-hidden flex flex-col min-h-[500px]">
          <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">Treasury Feed</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Real-time financial visibility and events</CardDescription>
          </CardHeader>
          <CardContent className="p-10 flex-1 flex flex-col items-center justify-center">
             <div className="text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-[30px] bg-white/5 flex items-center justify-center border border-white/10">
                   <History className="w-12 h-12 text-muted-foreground/20" />
                </div>
                <div className="space-y-2">
                   <p className="text-muted-foreground font-medium italic">No recent treasury activity detected.</p>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Waiting for Liquidity Events</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Governance Footer */}
      <div className="p-12 rounded-[40px] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
         <div className="space-y-2">
            <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter">Manual Governance Terminal</h4>
            <p className="text-sm font-medium text-muted-foreground italic max-w-2xl">
               Every investment action and liquidity event is manually audited by InvoiceFlow's institutional risk desk. No automated or predictive capital deployment is permitted within this terminal.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
               <ShieldCheck className="w-6 h-6 text-emerald-500/50" />
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
               <History className="w-6 h-6 text-blue-500/50" />
            </div>
         </div>
      </div>
    </div>
  );
}
