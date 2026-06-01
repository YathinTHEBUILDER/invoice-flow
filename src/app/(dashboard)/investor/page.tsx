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
import { formatINR } from "@/lib/utils";
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
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const kycStatus = stats?.kycStatus;
  const isVerified = kycStatus === 'verified';

  const statCards = [
    { 
      label: "Portfolio (Face Value)", 
      value: formatINR(stats?.totalInvested || 0), 
      sub: `${stats?.activeAssets || 0} Active Positions`, 
      icon: TrendingUp, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/10" 
    },
    { 
      label: "Capital Deployed", 
      value: formatINR(stats?.totalDeployed || 0), 
      sub: "Net Cash Outflow", 
      icon: Wallet, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Realized Profit", 
      value: formatINR(stats?.realizedProfit || 0), 
      sub: "Settled Returns", 
      icon: PieChart, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10" 
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">Investment Command</h2>
          <p className="text-sm text-neutral-400 mt-1">Smart cash management & portfolio expansion.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/investor/marketplace">
            <Button className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/10 transition-all">
              <Search className="mr-2 h-4 w-4" /> Browse Marketplace
            </Button>
          </Link>
          <Link href="/investor/wallet">
            <Button variant="outline" className="h-10 px-5 border-white/5 bg-white/[0.02] hover:bg-white/5 text-white font-medium text-xs rounded-xl transition-all">
              <Wallet className="mr-2 h-4 w-4" /> Wallet: {formatINR(stats?.walletBalance || 0)}
            </Button>
          </Link>
        </div>
      </div>

      {/* KYC Restriction Banner */}
      {!isVerified && (
        <div className="p-8 rounded-2xl bg-orange-500/5 border border-orange-500/15 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in duration-500">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/15 shadow-inner">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white tracking-tight">Verification Clearance Required</h3>
              <p className="text-xs text-neutral-400 max-w-xl">
                Professional investment actions are strictly locked until your identity credentials and biometric selfie are manually checked.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/investor/kyc")}
            className="h-10 px-6 bg-orange-600 hover:bg-orange-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-orange-600/10 transition-all"
          >
            {kycStatus === 'pending' ? "Checking in Progress..." : "Begin Verification Process"} <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="glass-dark rounded-2xl transition-all duration-300 relative flex flex-col justify-center group hover:border-white/10">
            <CardContent className="p-6 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors duration-300">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
                <p className="text-xs text-neutral-400">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Portfolio Overview */}
        <Card className="glass-dark overflow-hidden flex flex-col min-h-[400px] rounded-2xl">
          <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
            <div className="flex justify-between items-center">
               <div className="space-y-1">
                  <CardTitle className="text-base font-bold text-white tracking-tight">Portfolio State</CardTitle>
                  <CardDescription className="text-xs text-neutral-400">Current asset allocation and performance</CardDescription>
               </div>
               <Link href="/investor/portfolio">
                  <Button variant="ghost" className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors h-8 px-3 rounded-lg">View Full Portfolio</Button>
               </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
            {stats?.activeAssets === 0 ? (
               <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                     <PieChart className="w-6 h-6 text-neutral-500" />
                  </div>
                  <div className="space-y-1">
                     <p className="text-neutral-300 text-sm font-medium">Your money is awaiting smart investment.</p>
                     <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Professional Cash Pool Active</p>
                  </div>
                  <Link href="/investor/marketplace">
                     <Button variant="outline" className="h-9 px-4 border-white/5 bg-white/[0.02] hover:bg-white/5 text-xs text-white font-medium rounded-lg">
                         Browse Assets
                      </Button>
                   </Link>
                </div>
             ) : (
                <div className="w-full space-y-4">
                   <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Active Positions</p>
                         <p className="text-xl font-bold text-white">{stats.activeAssets} Checked Assets</p>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-600/10 text-blue-400">
                         <ShieldCheck className="w-5 h-5" />
                      </div>
                   </div>
                </div>
             )}
          </CardContent>
        </Card>

        {/* Financial Visibility / Treasury Feed */}
        <Card className="glass-dark overflow-hidden flex flex-col min-h-[400px] rounded-2xl">
          <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
            <CardTitle className="text-base font-bold text-white tracking-tight">Treasury Feed</CardTitle>
            <CardDescription className="text-xs text-neutral-400">Live financial updates and events</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center justify-center">
             <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                   <History className="w-6 h-6 text-neutral-500" />
                </div>
                <div className="space-y-1">
                   <p className="text-neutral-300 text-sm font-medium">No recent treasury activity detected.</p>
                   <p className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Waiting for Cash Events</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Governance Footer */}
      <div className="p-8 rounded-2xl bg-white/[0.01] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="space-y-2">
            <h4 className="text-base font-bold text-white tracking-tight">Manual Governance Portal</h4>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
               Every investment action and cash event is manually reviewed by InvoiceFlow&apos;s professional risk desk. No automated or predictive money investment is permitted within this portal.
            </p>
         </div>
         <div className="flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
               <ShieldCheck className="w-5 h-5 text-emerald-500/60" />
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center">
               <History className="w-5 h-5 text-blue-500/60" />
            </div>
         </div>
      </div>
    </div>
  );
}
