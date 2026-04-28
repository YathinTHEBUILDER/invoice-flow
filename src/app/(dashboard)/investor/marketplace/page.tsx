"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Calendar,
  Building2,
  ArrowUpRight,
  Info,
  Loader2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { getMarketplaceInvoices, fundInvoiceAction, getInvestorStats } from "@/app/actions/investor";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InvestorMarketplace() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [invoiceData, statsData] = await Promise.all([
        getMarketplaceInvoices(),
        getInvestorStats()
      ]);
      setInvoices(invoiceData);
      setProfile(statsData);
    } catch (error) {
      console.error("Failed to fetch marketplace data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleFund(invoiceId: string) {
    if (profile?.kycStatus !== 'verified') {
      toast.error("Compliance Lock", {
        description: "Your account is not yet verified. Please complete KYC to deploy capital."
      });
      router.push("/investor/kyc");
      return;
    }

    setFundingId(invoiceId);
    try {
      const result = await fundInvoiceAction({ invoiceId });
      if (result?.data?.success) {
        toast.success("Capital Deployed", {
          description: "Investment successfully executed. Assets are now active in your portfolio."
        });
        fetchData();
      } else {
        throw new Error(result?.serverError || "Deployment failed.");
      }
    } catch (error: any) {
      toast.error("Execution Error", {
        description: error.message
      });
    } finally {
      setFundingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Liquidity Market...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Asset Marketplace</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Strategic capital deployment into vetted MSME receivables.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 px-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Liquidity</p>
            <p className="text-xl font-black text-white italic">{formatINR(profile?.walletBalance || 0)}</p>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {invoices.length === 0 ? (
          <div className="lg:col-span-2 py-32 text-center space-y-6 glass-dark border border-white/5 rounded-[40px]">
             <div className="mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground/20" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-black text-white italic">No Assets Available</h3>
                <p className="text-muted-foreground font-medium italic">All current opportunities have been fully funded. Check back shortly.</p>
             </div>
          </div>
        ) : (
          invoices.map((invoice) => {
            const yieldRate = (invoice.discount_rate || 0.12) * 100;
            const absoluteReturn = Number(invoice.amount) * (invoice.discount_rate / 365 * (invoice.tenure_days || 45));
            
            return (
              <Card key={invoice.id} className="glass-dark border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-500">
                <CardContent className="p-0">
                  <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{invoice.profiles?.company_name}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-white/10 text-muted-foreground bg-white/5">
                            Verified MSME
                          </Badge>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                            Asset Backed
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Asset Value</p>
                        <p className="text-3xl font-black text-white tracking-tighter">{formatINR(invoice.amount)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 py-6 border-y border-white/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Net Yield</p>
                        <p className="text-lg font-black text-emerald-400 uppercase italic">~{yieldRate.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tenure</p>
                        <p className="text-lg font-black text-white uppercase italic">{invoice.tenure_days || 45} Days</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Est. Return</p>
                        <p className="text-lg font-black text-white uppercase italic">{formatINR(absoluteReturn)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Due {new Date(invoice.due_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Immediate Funding</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleFund(invoice.id)}
                        disabled={fundingId === invoice.id}
                        className="h-14 px-10 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-white/5"
                      >
                        {fundingId === invoice.id ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>Deploy Liquidity <ArrowUpRight className="ml-2 w-4 h-4" /></>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Trust Footer */}
                  <div className="bg-white/[0.02] border-t border-white/5 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Invoice Verification: 100% Verified by Risk Desk</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Info className="w-4 h-4 text-muted-foreground/30" />
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Ref: #{invoice.invoice_number}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* KYC Lock Message */}
      {profile?.kycStatus !== 'verified' && (
        <div className="p-8 rounded-[30px] bg-orange-500/5 border border-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-orange-500/10 text-orange-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-black text-white italic">Compliance Lock Active</h4>
              <p className="text-sm font-medium text-muted-foreground italic">Your capital deployment features are restricted until institutional vetting is complete.</p>
            </div>
          </div>
          <Button 
            onClick={() => router.push("/investor/kyc")}
            className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-2xl shadow-orange-500/20"
          >
            Finalize KYC Now
          </Button>
        </div>
      )}
    </div>
  );
}
