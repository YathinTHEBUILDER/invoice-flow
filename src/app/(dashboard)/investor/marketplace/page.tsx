"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ShieldCheck, 
  Clock, 
  TrendingUp,
  Building2,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getMarketplaceInvoices, fundInvoiceAction } from "@/app/actions/investor";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";
import Link from "next/link";

export default function MarketplacePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundingId, setFundingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    try {
      const data = await getMarketplaceInvoices();
      setInvoices(data || []);
    } catch (error) {
      toast.error("Failed to load marketplace assets.");
    } finally {
      setLoading(false);
    }
  }

  const handleFund = async (invoiceId: string) => {
    if (!confirm("Are you sure you want to fund this asset? This will deduct the amount from your wallet balance.")) {
      return;
    }

    setFundingId(invoiceId);
    try {
      const result = await fundInvoiceAction({ invoiceId });
      if (result?.data?.success) {
        toast.success("Liquidity deployed successfully!");
        await loadInvoices();
      } else {
        toast.error(result?.serverError || "Funding failed.");
      }
    } catch (error) {
      toast.error("System error during settlement.");
    } finally {
      setFundingId(null);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.profiles?.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">Marketplace</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Discover and fund verified high-yield debt instruments.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              placeholder="Search by MSME or Buyer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 p-0 border-white/10 hover:bg-white/5">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Scanning Liquidity Pool...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="text-center py-40 space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
            <Search className="w-10 h-10 text-muted-foreground/20" />
          </div>
          <p className="text-muted-foreground font-medium italic">No available assets match your current search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredInvoices.map((inv) => (
            <Card key={inv.id} className="glass-dark border-white/5 group hover:border-primary/20 transition-all duration-500 overflow-hidden flex flex-col">
              <CardHeader className="p-8 pb-0 flex flex-row justify-between items-start">
                <div className="space-y-1">
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]">
                    Verified Asset
                  </Badge>
                  <h3 className="text-2xl font-black text-white tracking-tighter">#{inv.invoice_number}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Yield (XIRR)</p>
                  <p className="text-xl font-black text-primary">14.5%</p>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8 flex-1 flex flex-col">
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Issuer</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{inv.profiles?.company_name}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Buyer</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate">{inv.buyer_name}</p>
                  </div>
                </div>

                <div className="flex justify-between items-end p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Asset Value</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{formatINR(inv.amount)}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Tenure</span>
                    </div>
                    <p className="text-sm font-bold text-white">{inv.tenure_days} Days</p>
                  </div>
                </div>

                <div className="flex-1" />

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Risk Rating</span>
                    <span className="text-emerald-500">Low (A+)</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-emerald-500/50" />
                  </div>
                </div>

                <Button 
                  onClick={() => handleFund(inv.id)}
                  disabled={fundingId === inv.id}
                  className="w-full h-14 bg-white/5 hover:bg-primary hover:text-primary-foreground text-white font-black uppercase tracking-widest text-[10px] transition-all duration-500 group-hover:scale-[1.02] active:scale-[0.98] border border-white/10"
                >
                  {fundingId === inv.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Deploy Liquidity <ArrowUpRight className="ml-2 w-4 h-4" /></>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="glass-dark border-white/5 p-10 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black italic tracking-tighter text-white">Institutional-Grade Security</h4>
              <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">All assets are 100% principal-protected by the platform's collateralized guarantee fund.</p>
            </div>
          </div>
          <Link href="/support">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5">
              Read Risk Disclosure <ArrowUpRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
