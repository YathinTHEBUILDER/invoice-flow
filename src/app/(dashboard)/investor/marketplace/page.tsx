"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  AlertCircle,
  FileText
} from "lucide-react";
import { getMarketplaceInvoices, getInvestorStats } from "@/app/actions/investor";
import { formatINR, formatIndianNumber, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { InvestmentModal } from "@/components/investor/InvestmentModal";

export default function InvestorMarketplace() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  function handleOpenModal(invoice: any) {
    if (profile?.kycStatus !== 'verified') {
      toast.error("Compliance Lock", {
        description: "Your account is not yet verified. Please complete KYC to deploy capital."
      });
      router.push("/investor/kyc");
      return;
    }
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Asset Marketplace</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Smart money investment into checked MSME invoices.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 px-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Cash</p>
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
            const targetAmount = Number(invoice.verified_amount || invoice.amount);
            const fundedAmount = Number(invoice.funded_amount || 0);
            const progress = (fundedAmount / targetAmount) * 100;
            const remaining = targetAmount - fundedAmount;
            
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
                        <p className="text-3xl font-black text-white tracking-tighter">{formatIndianNumber(targetAmount)}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-end">
                          <div className="space-y-1">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Funding Progress</p>
                             <p className="text-sm font-black text-white italic">{progress.toFixed(1)}% Completed</p>
                          </div>
                          <div className="text-right space-y-1">
                             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Remaining</p>
                             <p className="text-sm font-black text-primary italic">{formatINR(remaining)}</p>
                          </div>
                       </div>
                       <Progress value={progress} className="h-2 bg-white/5" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-white/5">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Financing Rate</p>
                        <p className="text-lg font-black text-white uppercase italic">{(invoice.discount_rate * 100 || 14.5).toFixed(1)}% p.a.</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Duration</p>
                        <p className="text-lg font-black text-white uppercase italic">{invoice.tenure_days || 45} Days</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">MSME Receives</p>
                        <p className="text-lg font-black text-emerald-400 uppercase italic">
                          {formatINR(targetAmount - (targetAmount * (invoice.discount_rate || 0.145) * (invoice.tenure_days || 45) / 365))}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Investor ROI</p>
                        <p className="text-lg font-black text-primary uppercase italic">
                          ~{((targetAmount * (invoice.discount_rate || 0.145) * (invoice.tenure_days || 45) / 365) / (targetAmount - (targetAmount * (invoice.discount_rate || 0.145) * (invoice.tenure_days || 45) / 365)) * (365 / (invoice.tenure_days || 45)) * 100).toFixed(1)}% p.a.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Due {formatDate(invoice.due_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Immediate Funding</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button 
                          variant="ghost"
                          onClick={() => {
                            const url = invoice.documents?.invoice_url;
                            if (url) {
                              window.open(url, '_blank');
                            } else {
                              const mockUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                              toast.info("Invoice document missing. Opening Demo Preview.");
                              window.open(mockUrl, '_blank');
                            }
                          }}
                          className="h-14 px-6 font-black uppercase tracking-widest text-[10px] text-white/40 hover:text-white"
                        >
                          <FileText className="mr-2 w-4 h-4" /> View
                        </Button>
                        <Button 
                          onClick={() => handleOpenModal(invoice)}
                          className="h-14 px-10 bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-white/5"
                        >
                          Invest Now <ArrowUpRight className="ml-2 w-4 h-4" />
                        </Button>
                      </div>
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
              <h4 className="text-xl font-black text-white italic">Verification Lock Active</h4>
              <p className="text-sm font-medium text-muted-foreground italic">Your money investment features are restricted until professional checking is complete.</p>
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

      {/* Investment Modal */}
      {selectedInvoice && (
        <InvestmentModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          invoice={selectedInvoice}
          userBalance={profile?.walletBalance || 0}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
