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
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Operations Portal
          </h2>
          <p className="text-sm text-neutral-400 mt-1">Enterprise cash overview and asset monitoring interface.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/msme/support">
            <Button variant="outline" className="h-10 px-5 border-white/5 bg-white/[0.02] hover:bg-white/5 text-white font-medium text-xs rounded-xl transition-all">
              Support
            </Button>
          </Link>
          <Link href={stats.kycStatus === 'verified' ? "/msme/invoices" : "/msme/kyc"}>
            <Button 
              className="h-10 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-blue-600/10 transition-all"
            >
              <Plus className="mr-2 h-4 w-4" /> 
              {stats.kycStatus === 'verified' ? "Raise New Funding" : "Verify KYC to Start"}
            </Button>
          </Link>
         </div>
      </div>

      <IntelligentFeed insights={stats.insights || []} />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
         {[
           { label: "Active Requests", value: stats.underReview, sub: "Pending Review", icon: Clock },
           { label: "Funded Assets", value: formatINR(stats.totalFundedAmount), sub: `${stats.funded} Invoices`, icon: CheckCircle2 },
           { label: "Upcoming Dues", value: formatINR(stats.totalOutstanding), sub: `${stats.pendingRepayments} Payments`, icon: History },
           { label: "Total Submitted", value: stats.totalSubmitted, sub: "All-time invoices", icon: ArrowUpRight },
         ].map((stat, i) => (
           <Card key={i} className="glass-dark rounded-2xl transition-all duration-300 relative flex flex-col justify-center group hover:border-white/10">
             <CardContent className="p-6 relative z-10">
               <div className="flex justify-between items-start mb-4">
                 <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-white transition-colors duration-300">
                   <stat.icon className="w-5 h-5" />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
           <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
               <h3 className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Cash Timeline</h3>
               <Badge variant="outline" className="border-white/5 text-[10px] font-medium text-neutral-400">Real-time Dues</Badge>
             </div>
             <RepaymentTimeline repayments={stats.repayments || []} />
           </div>

           <Card className="glass-dark overflow-hidden rounded-2xl">
             <CardHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between">
               <div>
                 <CardTitle className="text-lg font-bold text-white tracking-tight">Recent Activity</CardTitle>
                 <p className="text-xs text-neutral-400 font-medium mt-1">Latest asset status transitions</p>
               </div>
               <Link href="/msme/invoices">
                 <Button variant="ghost" className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors h-9 px-3 rounded-lg">Operational History</Button>
               </Link>
             </CardHeader>
             <CardContent className="p-0">
               {recentInvoices.length === 0 ? (
                 <div className="text-center py-20 space-y-4">
                   <div className="mx-auto w-12 h-12 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                     <Plus className="w-5 h-5 text-neutral-500" />
                   </div>
                   <div className="space-y-1">
                     <p className="text-white font-semibold text-sm">Pool is Empty</p>
                     <p className="text-neutral-400 font-normal text-xs max-w-xs mx-auto">Upload an invoice to initiate your first funding request.</p>
                   </div>
                 </div>
               ) : (
                 <div className="divide-y divide-white/5">
                   {recentInvoices.map((invoice) => (
                     <div key={invoice.id} className="p-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors group">
                       <div className="flex items-center gap-3">
                         <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                           <ArrowUpRight className="w-4 h-4" />
                         </div>
                         <div>
                           <p className="text-sm font-semibold text-white">#{invoice.invoice_number}</p>
                           <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">{invoice.buyer_name}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="text-sm font-semibold text-white">{formatINR(invoice.amount)}</p>
                         <Badge variant="outline" className="text-[9px] font-medium mt-1 border-white/5">
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
            <Card className="glass-dark overflow-hidden h-fit relative rounded-2xl">
             <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl -mr-12 -mt-12" />
             <CardHeader className="p-6 border-b border-white/5 bg-white/[0.01]">
               <div className="flex items-center gap-3">
                 <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400">
                   <ShieldCheck className="w-4 h-4" />
                 </div>
                 <CardTitle className="text-base font-bold text-white tracking-tight">Credit Health</CardTitle>
               </div>
               <p className="text-xs text-neutral-400 font-medium mt-1">Utilization Analytics</p>
             </CardHeader>
             <CardContent className="p-6">
               <CreditHealthDial 
                 utilization={stats.totalFundedAmount} 
                 limit={stats.platformLimit} 
                 kycStatus={stats.kycStatus} 
               />
               
               <Link href="/msme/repayments" className="block mt-6">
                 <Button className="w-full h-10 bg-white/[0.02] border border-white/5 hover:bg-white/5 text-white font-medium text-xs rounded-xl transition-all">
                   Optimize Dues
                 </Button>
               </Link>
             </CardContent>
           </Card>

                <Card className="glass-dark overflow-hidden rounded-2xl">
                 <CardHeader className="p-6 border-b border-white/5">
                   <CardTitle className="text-base font-bold text-white tracking-tight">Buyer Concentration</CardTitle>
                   <p className="text-xs text-neutral-400 font-medium mt-1">Buyer Exposure</p>
                 </CardHeader>
                 <CardContent className="p-6">
                   <BuyerConcentration analytics={stats.buyerAnalytics || []} />
                 </CardContent>
               </Card>

               <Card className="glass-dark overflow-hidden rounded-2xl">
                 <CardHeader className="p-6 border-b border-white/5">
                   <CardTitle className="text-base font-bold text-white tracking-tight">Quick Actions</CardTitle>
                 </CardHeader>
                 <CardContent className="p-3 space-y-1">
                  <Link href="/msme/invoices">
                    <Button variant="ghost" className="w-full justify-start text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 h-9 px-3 rounded-lg">
                      <Plus className="mr-2 h-4 w-4" /> New Invoice
                    </Button>
                  </Link>
                  <Link href="/msme/support">
                    <Button variant="ghost" className="w-full justify-start text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 h-9 px-3 rounded-lg">
                      <AlertCircle className="mr-2 h-4 w-4" /> Open Ticket
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start text-xs font-semibold text-neutral-400 hover:text-white hover:bg-white/5 h-9 px-3 rounded-lg">
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
