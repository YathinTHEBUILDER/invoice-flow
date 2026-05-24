import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Clock, CheckCircle2, History, AlertCircle, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";
import { getMSMEStats, getRecentMSMEInvoices } from "@/app/actions/msme";
import { formatINR } from "@/lib/utils";
import { RepaymentTimeline, CreditHealthDial, BuyerConcentration, IntelligentFeed } from "@/components/msme/dashboard-visuals";

export const dynamic = "force-dynamic";

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
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white italic underline decoration-primary/20 decoration-4 underline-offset-[12px]">
            Operations <span className="text-primary italic">Terminal</span>
          </h2>
          <p className="text-muted-foreground font-medium text-sm md:text-lg italic mt-6">Enterprise cash overview and asset monitoring interface.</p>
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

      <IntelligentFeed insights={stats.insights || []} />

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Active Requests", value: stats.underReview, sub: "Pending Review", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10", border: "hover:border-blue-500/30" },
          { label: "Funded Assets", value: formatINR(stats.totalFundedAmount), sub: `${stats.funded} Invoices`, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30" },
          { label: "Upcoming Dues", value: formatINR(stats.totalOutstanding), sub: `${stats.pendingRepayments} Payments`, icon: History, color: "text-orange-500", bg: "bg-orange-500/10", border: "hover:border-orange-500/30" },
          { label: "Total Submitted", value: stats.totalSubmitted, sub: "All-time invoices", icon: ArrowUpRight, color: "text-purple-500", bg: "bg-purple-500/10", border: "hover:border-purple-500/30" },
        ].map((stat, i) => (
          <Card key={i} className={`glass-dark border-white/5 overflow-hidden group ${stat.border} transition-all duration-500 relative flex flex-col justify-center`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <CardContent className="p-8 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-black/20`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{stat.label}</p>
                <h3 className="text-3xl font-black text-white italic">{stat.value}</h3>
                <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-tighter">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] italic">Cash Timeline</h3>
              <Badge variant="outline" className="border-white/10 text-[9px] font-black uppercase">Real-time Dues</Badge>
            </div>
            <RepaymentTimeline repayments={stats.repayments || []} />
          </div>

          <Card className="glass-dark border-white/5 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black italic">Recent Activity</CardTitle>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Latest asset status transitions</p>
              </div>
              <Link href="/msme/invoices">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest hover:bg-white/5">Operational History</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentInvoices.length === 0 ? (
                <div className="text-center py-32 space-y-6">
                  <div className="mx-auto w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                    <Plus className="w-10 h-10 text-white/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white font-black text-xl italic">Pool is Empty</p>
                    <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">Upload an invoice to initiate your first funding request.</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="p-6 flex items-center justify-between hover:bg-white/[0.01] transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-white italic">#{invoice.invoice_number}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{invoice.buyer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white italic">{formatINR(invoice.amount)}</p>
                        <Badge variant="outline" className="text-[8px] font-black uppercase mt-1 border-white/10">
                          {invoice.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="glass-dark border-white/5 overflow-hidden h-fit relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12" />
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter">Credit Health</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-2">Utilization Analytics</p>
            </CardHeader>
            <CardContent className="p-8">
              <CreditHealthDial 
                utilization={stats.totalFundedAmount} 
                limit={stats.platformLimit} 
                kycStatus={stats.kycStatus} 
              />
              
              <Link href="/msme/repayments" className="block mt-8">
                <Button className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] border border-white/10">
                  Optimize Dues
                </Button>
              </Link>
            </CardContent>
          </Card>

               <Card className="glass-dark border-white/5 overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                  <CardTitle className="text-xl font-black italic">Buyer Concentration</CardTitle>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-1">Buyer Exposure</p>
                </CardHeader>
                <CardContent className="p-8">
                  <BuyerConcentration analytics={stats.buyerAnalytics || []} />
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
