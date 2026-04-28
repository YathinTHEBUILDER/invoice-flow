"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, ShieldCheck, Search, Loader2, ArrowUpRight } from "lucide-react";
import { getInvestorStats } from "@/app/actions/investor";
import { formatINR } from "@/lib/format";
import Link from "next/link";

export default function InvestorDashboard() {
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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Syncing Portfolio State...</p>
      </div>
    );
  }

  const statCards = [
    { label: "Portfolio Value", value: formatINR(stats?.totalInvested || 0), sub: `Target ${stats?.expectedARR || 14.5}% ARR`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Wallet Balance", value: formatINR(stats?.walletBalance || 0), sub: "Available for deployment", icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Active Investments", value: `${stats?.activeAssets || 0} Assets`, sub: "100% Asset-Backed", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Capital Command</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Strategic liquidity management & portfolio expansion.</p>
        </div>
        <Link href="/investor/marketplace">
          <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 rounded-2xl">
            <Search className="mr-2 h-5 w-5" /> Browse Marketplace
          </Button>
        </Link>
      </div>

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
        <Card className="glass-dark border-white/5 overflow-hidden flex flex-col justify-center min-h-[400px]">
          <CardHeader className="p-10 border-b border-white/5 bg-white/[0.02]">
            <CardTitle className="text-2xl font-black italic tracking-tighter text-white">Investment Portfolio</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detailed asset allocation and performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-10 flex-1 flex flex-col items-center justify-center">
            <div className="text-center space-y-6">
              <div className="mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                <TrendingUp className="w-10 h-10 text-muted-foreground/20" />
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground font-medium italic">Your portfolio is primed for capital deployment.</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">No active positions detected</p>
              </div>
              <Link href="/investor/marketplace">
                <Button variant="outline" className="h-12 px-8 border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest rounded-xl">
                  Deploy Capital Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-white/5 overflow-hidden bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="p-10 border-b border-white/5">
            <CardTitle className="text-2xl font-black italic tracking-tighter text-white">Yield Intelligence</CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Market insights and projected returns</CardDescription>
          </CardHeader>
          <CardContent className="p-10 space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Market Trend</p>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground font-medium italic">Bullish: Liquidity demand in the MSME sector has increased by 14% this quarter.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Avg Tenure</p>
                <p className="text-xl font-black text-white">42 Days</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Risk Profile</p>
                <p className="text-xl font-black text-emerald-500">Low (A+)</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20">
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Pro-Tip</p>
              <p className="text-[11px] text-white/80 font-medium leading-relaxed italic">
                Diversify across 5+ industries to minimize concentration risk and stabilize your monthly yield curve.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
