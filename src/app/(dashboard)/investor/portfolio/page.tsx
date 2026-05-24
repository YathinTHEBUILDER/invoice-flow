"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Clock, 
  Calendar,
  Building2,
  Loader2,
  ShieldCheck,
  History,
  TrendingUp,
  FileText
} from "lucide-react";
import { getInvestorPortfolio, getInvestorProfile } from "@/app/actions/investor";
import { formatINR, formatIndianNumber, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function InvestorPortfolio() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [investorName, setInvestorName] = useState("");

  useEffect(() => {
    fetchPortfolio();
  }, []);

  async function fetchPortfolio() {
    try {
      const data = await getInvestorPortfolio();
      setInvestments(data);
      
      const profile = await getInvestorProfile();
      if (profile?.full_name) {
        setInvestorName(profile.full_name);
      } else {
        setInvestorName(profile?.email || "Valued Investor");
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
    }
  }

  const generateCertificate = (inv: any) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Gradient (Deep Charcoal to Navy-Black)
    const grad = ctx.createRadialGradient(800, 500, 100, 800, 500, 900);
    grad.addColorStop(0, "#15161f");
    grad.addColorStop(1, "#07070b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1600, 1000);

    // Watermark shield in background
    ctx.save();
    ctx.translate(800, 450);
    ctx.strokeStyle = "rgba(197, 168, 92, 0.02)";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, -140);
    ctx.lineTo(120, -90);
    ctx.lineTo(100, 60);
    ctx.lineTo(0, 140);
    ctx.lineTo(-100, 60);
    ctx.lineTo(-120, -90);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Premium gold borders
    ctx.strokeStyle = "#c5a85c";
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1520, 920);

    ctx.strokeStyle = "rgba(197, 168, 92, 0.2)";
    ctx.lineWidth = 2;
    ctx.strokeRect(52, 52, 1496, 896);

    // Gold corner decorations
    const drawCorner = (x: number, y: number, rx: number, ry: number) => {
      ctx.strokeStyle = "#c5a85c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x + rx * 40, y);
      ctx.lineTo(x, y);
      ctx.lineTo(x, y + ry * 40);
      ctx.stroke();
    };
    drawCorner(60, 60, 1, 1);
    drawCorner(1540, 60, -1, 1);
    drawCorner(60, 940, 1, -1);
    drawCorner(1540, 940, -1, -1);

    // Header Brand
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic bold 32px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("INVOICEFLOW", 800, 130);

    ctx.fillStyle = "#c5a85c";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("SECURED RECEIVABLES ASSET CLASS", 800, 155);

    // Main Heading
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText("CERTIFICATE OF DEBT DEPLOYMENT", 800, 250);

    // Subtext
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "20px sans-serif";
    ctx.fillText("This document verifies the allocation of trade credit capital towards a verified invoice", 800, 310);

    // Awarded to
    ctx.fillStyle = "#c5a85c";
    ctx.font = "italic 22px Georgia, serif";
    ctx.fillText("proudly awarded to", 800, 380);

    // Investor Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(investorName || "VALUED INVESTOR", 800, 440);

    // Line below name
    ctx.strokeStyle = "rgba(197, 168, 92, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(550, 465);
    ctx.lineTo(1050, 465);
    ctx.stroke();

    // Deployed Statement
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "18px sans-serif";
    ctx.fillText("representing senior debt participation with secondary buyer guarantee", 800, 505);

    // Parameters
    const invoice = inv.invoices;
    const yieldRate = (invoice?.discount_rate || 0.145);
    const tenureDays = invoice?.tenure_days || 45;
    const totalFaceValue = Number(inv.amount);
    const discountAmount = Math.round(totalFaceValue * yieldRate * (tenureDays / 365));
    const deployedCapital = totalFaceValue - discountAmount;
    const estimatedReturn = discountAmount;
    const annualizedROI = (discountAmount / deployedCapital) * (365 / tenureDays) * 100;

    const drawParam = (x: number, y: number, w: number, h: number, title: string, value: string, highlight = false) => {
      ctx.fillStyle = "rgba(255,255,255,0.015)";
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      ctx.strokeStyle = highlight ? "#10b981" : "#c5a85c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText(title.toUpperCase(), x + w/2, y + 35);

      ctx.fillStyle = highlight ? "#10b981" : "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(value, x + w/2, y + 80);
    };

    const row1Y = 560;
    const cardW = 280;
    const cardH = 120;
    const gap = 40;
    const startX = 800 - (cardW * 3 + gap * 2) / 2;

    drawParam(startX, row1Y, cardW, cardH, "Asset Reference", `#${invoice?.invoice_number || "INV-001"}`);
    drawParam(startX + cardW + gap, row1Y, cardW, cardH, "Capital Deployed", `INR ${deployedCapital.toLocaleString('en-IN')}`, true);
    drawParam(startX + (cardW + gap) * 2, row1Y, cardW, cardH, "Estimated Return", `INR ${estimatedReturn.toLocaleString('en-IN')}`);

    const row2Y = row1Y + cardH + 30;
    drawParam(startX, row2Y, cardW, cardH, "Maturity Date", invoice?.due_date ? new Date(invoice.due_date).toLocaleDateString('en-IN') : "N/A");
    drawParam(startX + cardW + gap, row2Y, cardW, cardH, "Annualized ROI", `~${annualizedROI.toFixed(1)}% p.a.`);
    drawParam(startX + (cardW + gap) * 2, row2Y, cardW, cardH, "Issuer (MSME)", invoice?.profiles?.company_name || "Enterprise");

    // Left Foot metadata
    const footerY = 880;
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "bold 10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("CERTIFICATE ID:", 150, footerY);
    ctx.fillStyle = "#c5a85c";
    ctx.font = "bold 12px monospace";
    ctx.fillText(`CERT-${inv.id.split('-')[0].toUpperCase()}-${invoice?.invoice_number || '001'}`, 150, footerY + 20);

    // Right signature
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "bold 10px sans-serif";
    ctx.fillText("AUTHORIZED SIGNATORY", 1450, footerY);

    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 24px Georgia, serif";
    ctx.fillText("InvoiceFlow Treasury", 1450, footerY + 28);

    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1250, footerY + 40);
    ctx.lineTo(1450, footerY + 40);
    ctx.stroke();

    // Seal
    ctx.textAlign = "center";
    ctx.save();
    ctx.translate(800, 890);
    ctx.fillStyle = "rgba(197, 168, 92, 0.05)";
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c5a85c";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#c5a85c";
    ctx.font = "bold 8px sans-serif";
    ctx.fillText("VERIFIED", 0, -5);
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("ASSET POOL", 0, 10);
    ctx.restore();

    // Trigger download
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `Investment_Certificate_${invoice?.invoice_number || "INV"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Certificate generated and downloaded successfully! 🛡️");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const activeParticipation = investments.filter(i => i.status === 'active').length;

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-white">Active Portfolio</h2>
          <p className="text-muted-foreground font-medium text-sm">Comprehensive governance of your invested cash.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 px-6">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active participations</p>
            <p className="text-xl font-bold text-white">{activeParticipation}</p>
          </div>
          <div className="w-px h-8 bg-white/10 mx-2" />
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {investments.length === 0 ? (
          <div className="py-32 text-center space-y-6 glass-dark rounded-2xl">
             <div className="mx-auto w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-muted-foreground/20" />
             </div>
             <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">No Invested Money</h3>
                <p className="text-muted-foreground font-medium">Explore the marketplace to begin building your portfolio secured by invoices.</p>
             </div>
          </div>
        ) : (
          investments.map((inv) => {
            const isRepaid = inv.status === 'repaid';
            const invoice = inv.invoices;
            if (!invoice) return null;
            
            // Yield Logic: Calculate days from today until maturity
            const yieldRate = (invoice.discount_rate || 0.145);
            const tenureDays = invoice.tenure_days || 45;
            
            const totalFaceValue = Number(inv.amount);
            const discountAmount = Math.round(totalFaceValue * yieldRate * (tenureDays / 365));
            const deployedCapital = totalFaceValue - discountAmount;
            
            const estimatedReturn = discountAmount;
            const annualizedROI = (discountAmount / deployedCapital) * (365 / tenureDays) * 100;
            
            return (
              <Card key={inv.id} className="glass-dark rounded-2xl overflow-hidden group hover:border-white/10 transition-all duration-500">
                <CardContent className="p-0">
                  <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
                    {/* Asset ID & Entity */}
                    <div className="w-full md:w-1/4 space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Asset #{invoice.invoice_number}</p>
                        <h3 className="text-xl font-bold text-white tracking-tight leading-none">{invoice.profiles?.company_name || "Enterprise Asset"}</h3>
                      </div>
                      <Badge variant="outline" className={`h-8 px-4 rounded-xl text-[8px] font-bold uppercase tracking-widest ${isRepaid ? 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' : 'border-blue-500/20 text-blue-400 bg-blue-500/5'}`}>
                        {isRepaid ? 'Settled' : 'Active Deployment'}
                      </Badge>
                    </div>

                    {/* Financial Metrics */}
                    <div className="flex-1 flex flex-wrap md:flex-nowrap gap-12 w-full border-y md:border-y-0 md:border-x border-white/5 py-8 md:py-0 px-0 md:px-12">
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Principal (Deployed)</p>
                        <p className="text-xl font-bold text-white tracking-tight">{formatINR(deployedCapital)}</p>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Est. Yield</p>
                        <p className="text-xl font-bold text-emerald-500 tracking-tight">+{formatINR(estimatedReturn)}</p>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Maturity</p>
                        <p className="text-xl font-bold text-white tracking-tight">{formatDate(invoice.due_date)}</p>
                      </div>
                      <div className="flex-1 min-w-[120px] space-y-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">ROI (p.a.)</p>
                        <p className="text-xl font-bold text-white tracking-tight">~{annualizedROI.toFixed(1)}%</p>
                      </div>
                    </div>

                    {/* Action/Progress */}
                    <div className="w-full md:w-1/4 space-y-8">
                       <div className="space-y-4">
                          <div className="flex justify-between items-end">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</p>
                             <div className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                {!isRepaid && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                                {isRepaid ? 'Settled' : 'Accruing'}
                             </div>
                          </div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${isRepaid ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: isRepaid ? '100%' : '65%' }} />
                          </div>
                       </div>
                       <Button 
                          variant="outline" 
                          size="sm" 
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
                          className="w-full h-11 border-white/5 bg-white/5 hover:bg-white/10 font-bold uppercase tracking-widest text-[9px] rounded-xl group/btn"
                        >
                          <FileText className="mr-2 w-3 h-3 text-muted-foreground group-hover/btn:text-white transition-colors" />
                          View Original Invoice
                        </Button>
                       <div className="flex justify-end items-center gap-4">
                          <div className="p-3 rounded-2xl bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer border border-white/10 hover:bg-white/10 group/btn" title="Transaction History">
                             <History className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          </div>
                          <div 
                             onClick={() => generateCertificate(inv)}
                             className="p-3 rounded-2xl bg-white/5 text-muted-foreground hover:text-white transition-all cursor-pointer border border-white/10 hover:bg-white/10 group/btn" 
                             title="Investment Certificate"
                          >
                             <ShieldCheck className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          </div>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Institutional Note */}
      <div className="p-10 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
           <ShieldCheck className="w-6 h-6 text-primary" />
           <h4 className="text-lg font-bold text-white uppercase tracking-tight">Asset Security Protocol</h4>
        </div>
        <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-4xl">
          All assets in your portfolio are backed by verified receivables and secondary corporate guarantees. Repayments are monitored in real-time by our institutional treasury operations. Overdue positions are immediately transitioned to our legal recovery portal.
        </p>
      </div>
    </div>
  );
}
