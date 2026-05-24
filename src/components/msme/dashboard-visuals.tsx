"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils";
import { Calendar, ChevronRight, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";

interface Repayment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  invoiceNumber: string;
  buyerName: string;
}

export function RepaymentTimeline({ repayments }: { repayments: Repayment[] }) {
  const upcoming = repayments.filter(r => r.status === 'scheduled' || r.status === 'overdue');

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
        <Calendar className="w-8 h-8 text-white/10" />
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">No upcoming cash dues detected</p>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="flex gap-6 overflow-x-auto pb-6 pt-2 no-scrollbar scroll-smooth">
        {upcoming.map((repayment, i) => {
          const isOverdue = repayment.status === 'overdue' || new Date(repayment.dueDate) < new Date();
          const daysToDue = Math.ceil((new Date(repayment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <Card key={repayment.id} className="w-[280px] md:min-w-[320px] glass-dark border-white/5 hover:border-primary/20 transition-all duration-500 group/card relative overflow-hidden shrink-0">
               <div className={`absolute top-0 left-0 w-1 h-full ${isOverdue ? 'bg-red-500' : daysToDue <= 3 ? 'bg-orange-500' : 'bg-emerald-500'}`} />
               <CardContent className="p-6 space-y-6">
                 <div className="flex justify-between items-start">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Due Date</p>
                     <p className={`text-sm font-black italic ${isOverdue ? 'text-red-500' : 'text-white'}`}>
                       {new Date(repayment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                     </p>
                   </div>
                   <Badge className={isOverdue ? "bg-red-500/10 text-red-500 border-none" : "bg-emerald-500/10 text-emerald-500 border-none"}>
                     {isOverdue ? "URGENT" : `${daysToDue} Days Left`}
                   </Badge>
                 </div>

                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Amount Due</p>
                   <p className="text-2xl font-black text-white">{formatINR(repayment.amount)}</p>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">INV #{repayment.invoiceNumber} • {repayment.buyerName}</p>
                 </div>

                 <Link href="/msme/repayments" className="block">
                   <Button variant="ghost" className="w-full h-10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] group/btn">
                     Settle Now <ChevronRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                   </Button>
                 </Link>
               </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function CreditHealthDial({ utilization, limit, kycStatus }: { utilization: number, limit: number, kycStatus: string }) {
  const percentage = Math.min(100, (utilization / limit) * 100);
  const strokeDasharray = 251.2; // 2 * PI * r (where r=40)
  const offset = strokeDasharray - (percentage / 100) * strokeDasharray;

  if (kycStatus !== 'verified') {
    return (
       <div className="space-y-6">
         <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-orange-500/20" />
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
            </svg>
         </div>
         <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed px-4">
           Verification required to activate credit monitoring
         </p>
       </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative w-48 h-48 mx-auto group">
        <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <svg className="w-full h-full -rotate-90 relative z-10">
          <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
          <circle 
            cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" 
            strokeDasharray="502.4"
            strokeDashoffset={502.4 - (percentage / 100) * 502.4}
            className="text-primary transition-all duration-[1500ms] ease-out stroke-round"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
          <span className="text-4xl font-black text-white italic">{Math.round(percentage)}%</span>
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Utilized</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Available Credit</span>
           <span className="text-sm font-black text-white">{formatINR(limit - utilization)}</span>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
           <TrendingUp className="w-4 h-4 text-primary shrink-0 mt-0.5" />
           <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
             Maintain a utilization below 70% to improve your credit score and unlock higher limits.
           </p>
        </div>
      </div>
    </div>
  );
}

export function BuyerConcentration({ analytics }: { analytics: any[] }) {
  if (!analytics || analytics.length === 0) {
    return (
      <div className="py-12 text-center bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">No buyer data available</p>
      </div>
    );
  }

  const totalExposure = analytics.reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="space-y-6">
      {analytics.slice(0, 4).map((buyer, i) => {
        const share = (buyer.totalAmount / totalExposure) * 100;
        const fundingRate = (buyer.fundedCount / buyer.count) * 100;
        
        return (
          <div key={buyer.name} className="space-y-3 group/buyer">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-white italic group-hover/buyer:text-primary transition-colors">{buyer.name}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                  {buyer.count} Invoices • {Math.round(fundingRate)}% Funding Rate
                </p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-xs font-black text-white">{formatINR(buyer.totalAmount)}</p>
                <p className="text-[9px] font-black text-primary uppercase tracking-tighter">{Math.round(share)}% Share</p>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out delay-300" 
                style={{ width: `${share}%` }} 
              />
            </div>
          </div>
        );
      })}
      
      {analytics.length > 4 && (
        <p className="text-[9px] font-black text-center text-muted-foreground uppercase tracking-widest pt-2">
          + {analytics.length - 4} more buyers
        </p>
      )}
    </div>
  );
}

export function IntelligentFeed({ insights }: { insights: any[] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-1000">
      {insights.slice(0, 3).map((insight, i) => (
        <div 
          key={i} 
          className={`p-6 rounded-3xl border flex flex-col justify-between gap-4 group transition-all duration-500 hover:shadow-2xl ${
            insight.type === 'warning' ? 'bg-orange-500/5 border-orange-500/20 hover:border-orange-500/40' :
            insight.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40' :
            'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
          }`}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                 insight.type === 'warning' ? 'bg-orange-500' :
                 insight.type === 'success' ? 'bg-emerald-500' :
                 'bg-blue-500'
               }`} />
               <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{insight.title}</h4>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed">{insight.message}</p>
          </div>
          
          <Link href={insight.action}>
            <Button variant="ghost" className="h-8 px-0 text-[10px] font-black uppercase tracking-widest text-white group-hover:text-primary transition-colors">
              {insight.actionLabel} <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      ))}
    </div>
  );
}
