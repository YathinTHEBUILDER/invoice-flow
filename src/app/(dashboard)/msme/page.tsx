import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Clock, CheckCircle2, History, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getMSMEStats } from "@/app/actions/msme";
import { formatINR } from "@/lib/format";

export default async function MsmeDashboard() {
  const stats = await getMSMEStats();

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground font-medium">Failed to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Dashboard</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Operational overview of your invoice financing activity.</p>
        </div>
        <Link href="/msme/invoices">
          <Button className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20">
            <Plus className="mr-2 h-5 w-5" /> Raise New Funding
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Requests", value: stats.underReview, sub: "Pending Review", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Funded Assets", value: formatINR(stats.totalFundedAmount), sub: `${stats.funded} Invoices`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Upcoming Dues", value: formatINR(stats.totalOutstanding), sub: `${stats.pendingRepayments} Payments`, icon: History, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Total Submitted", value: stats.totalSubmitted, sub: "All-time invoices", icon: ArrowUpRight, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-dark border-white/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                <p className="text-xs font-bold text-muted-foreground italic">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black italic">Recent Operations</CardTitle>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Latest invoice status updates</p>
            </div>
            <Link href="/msme/invoices">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:bg-white/5">View All Invoices</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="text-center py-32 space-y-6">
              <div className="mx-auto w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                <Plus className="w-10 h-10 text-white/20" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-black text-xl italic">No Active Operations</p>
                <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">Upload an invoice to start your financing request and unlock liquidity.</p>
              </div>
              <Link href="/msme/invoices">
                <Button variant="outline" className="h-12 px-10 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]">Initialize First Request</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-black italic">Financial Summary</CardTitle>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Snapshot of your liquidity</p>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Available Limits</span>
                <span className="text-sm font-black text-white">Manual Review Required</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-0" />
              </div>
              <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                Your financing limits are determined manually based on your KYC documents and business history. Please ensure your <Link href="/msme/kyc" className="text-primary hover:underline">KYC is verified</Link> for higher limits.
              </p>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-orange-500">Immediate Dues</span>
                <span className="text-sm font-black text-white">{formatINR(stats.totalOutstanding)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Processing Fee</span>
                <span className="text-sm font-black text-white">1.0% Fixed</span>
              </div>
            </div>

            <Link href="/msme/repayments" className="block">
              <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] border border-white/10">
                Manage Repayments
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
