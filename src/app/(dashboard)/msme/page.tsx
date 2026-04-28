import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Clock, CheckCircle2, History, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getMSMEStats } from "@/app/actions/msme";
import { formatINR } from "@/lib/format";

export default async function MsmeDashboard() {
  const [stats, recentInvoices] = await Promise.all([
    getMSMEStats(),
    getRecentMSMEInvoices(3)
  ]);

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
        <div className="flex gap-4">
          <Link href="/msme/support">
            <Button variant="outline" className="h-14 px-6 border-white/10 text-white font-black uppercase tracking-widest text-[10px]">
              Support
            </Button>
          </Link>
          <Link href={stats.kycStatus === 'verified' ? "/msme/invoices" : "/msme/kyc"}>
            <Button 
              className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20"
            >
              <Plus className="mr-2 h-5 w-5" /> 
              {stats.kycStatus === 'verified' ? "Raise New Funding" : "Verify KYC to Start"}
            </Button>
          </Link>
        </div>
      </div>

      {stats.kycStatus !== 'verified' && (
        <div className="p-8 rounded-3xl bg-orange-500/5 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-orange-500/20 text-orange-500">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-black text-white italic">Compliance Clearance Required</p>
              <p className="text-sm text-muted-foreground font-medium max-w-xl">
                Your account is currently restricted. Complete the manual identity verification process to unlock invoice discounting and funding features.
              </p>
            </div>
          </div>
          <Link href="/msme/kyc">
            <Button className="h-12 px-10 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px]">
              Access Compliance Module
            </Button>
          </Link>
        </div>
      )}

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
            {recentInvoices.length === 0 ? (
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
            ) : (
              <div className="divide-y divide-white/5">
                {recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{invoice.invoice_number}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{invoice.buyer_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-white">{formatINR(invoice.amount)}</p>
                      <Badge variant="outline" className="text-[8px] font-black uppercase mt-1">
                        {invoice.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-dark border-white/5 overflow-hidden h-fit">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-black italic">Financial Summary</CardTitle>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Snapshot of your liquidity</p>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Platform Limit</span>
                  <span className="text-sm font-black text-white">
                    {stats.kycStatus === 'verified' ? "₹ 50,00,000" : "KYC Pending"}
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: stats.kycStatus === 'verified' ? '40%' : '0%' }} 
                  />
                </div>
                <p className="text-[10px] text-muted-foreground font-bold leading-relaxed">
                  {stats.kycStatus === 'verified' 
                    ? "Your current utilization is at 40% of the maximum allowed limit for your business profile."
                    : "Complete KYC to receive your initial platform credit limit and start raising capital."
                  }
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

          <Card className="glass-dark border-white/5 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-xl font-black italic">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <Link href="/msme/invoices">
                <Button variant="ghost" className="w-full justify-start text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                  <Plus className="mr-2 h-4 w-4" /> New Invoice
                </Button>
              </Link>
              <Link href="/msme/support">
                <Button variant="ghost" className="w-full justify-start text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                  <AlertCircle className="mr-2 h-4 w-4" /> Open Ticket
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="w-full justify-start text-[10px] font-black uppercase tracking-widest hover:bg-white/5">
                  <Users className="mr-2 h-4 w-4" /> Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
