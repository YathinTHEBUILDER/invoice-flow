import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Building2, 
  LineChart, 
  Lock, 
  Activity, 
  Zap, 
  Shield, 
  BarChart3, 
  Globe, 
  Users,
  Briefcase
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { createClient } from "@/lib/server";
import { formatINR } from "@/lib/utils";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const role = user?.user_metadata?.role || "investor";
  const { data: marketplaceInvoices } = await supabase
    .from('invoices')
    .select('*, profiles(company_name)')
    .in('status', ['approved', 'partially_funded'])
    .limit(2);

  return (
    <div className="flex flex-col w-full items-center bg-background selection:bg-blue-500/30 overflow-hidden font-sans">
      <Navbar />
      
      {/* Background ambient gradients */}
      <div className="absolute top-0 left-0 right-0 h-[1000px] w-full hero-gradient pointer-events-none -z-10 opacity-40" />
      <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse-slow" />
      <div className="absolute top-[20%] left-[5%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-20 md:pt-52 md:pb-32">
        <div className="flex flex-col items-center text-center space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs md:text-sm font-semibold text-primary backdrop-blur-xl shadow-2xl transition-all hover:bg-primary/10 hover:border-primary/30">
            <span className="relative flex h-2.5 w-2.5 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="tracking-wide uppercase">Asset-Backed Invoice Factoring</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter max-w-6xl text-balance leading-[0.9] text-gradient">
            Liquidity <br className="hidden md:block" />
            Redefined.
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground/80 max-w-3xl mx-auto text-balance leading-relaxed font-medium">
            The high-performance marketplace where verified MSMEs access liquidity with a fixed 1% platform fee, and individual investors discover secure, asset-backed yields.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 w-full sm:w-auto">
            {user ? (
              <Button size="lg" asChild className="h-16 px-12 text-lg font-bold w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] transition-all hover:scale-[1.05] active:scale-[0.95]">
                <Link href={`/dashboard/${role}`}>
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="h-16 px-12 text-lg font-bold w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] transition-all hover:scale-[1.05] active:scale-[0.95]">
                <Link href="/get-started">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 pt-20 w-full max-w-5xl">
            {[
              { label: "Target Yields", value: "12-15% ARR", icon: Activity },
              { label: "Platform Fee", value: "Fixed 1%", icon: LineChart },
              { label: "Asset-Backed", value: "100% Verified", icon: ShieldCheck },
              { label: "Origin", value: "Mysuru, KA", icon: Globe },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 group">
                <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-foreground">{stat.value}</div>
                <div className="text-xs md:text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="w-full relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4 max-w-2xl text-left">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none">Built for <br />MSMEs.</h2>
              <p className="text-lg md:text-xl text-muted-foreground font-medium">Professional infrastructure designed to provide reliable liquidity with complete transparency and a fixed 1% fee.</p>
            </div>
            <div className="flex gap-4">
              <div className="glass-dark p-4 rounded-2xl border-white/5">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div className="glass-dark p-4 rounded-2xl border-white/5">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Fixed 1% Fee",
                desc: "Transparent and predictable pricing. No hidden charges—we charge a flat 1% platform fee for every invoice funded.",
                icon: LineChart,
                color: "text-blue-500",
                bg: "bg-blue-500/10"
              },
              {
                title: "MSME Verification",
                desc: "Every MSME on our platform undergoes a multi-step verification process to ensure asset integrity and stability.",
                icon: Shield,
                color: "text-indigo-500",
                bg: "bg-indigo-500/10"
              },
              {
                title: "Targeted Yields",
                desc: "Individual investors access asset-backed opportunities with projected annualized returns between 12% and 15%.",
                icon: Activity,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10"
              }
            ].map((pillar, i) => (
              <Card key={i} className="glass-dark border-white/5 hover:border-primary/50 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-10 flex flex-col items-start space-y-6 relative z-10">
                  <div className={`p-4 rounded-2xl ${pillar.bg} ${pillar.color} group-hover:scale-110 transition-transform duration-500`}>
                    <pillar.icon className="h-8 w-8" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black tracking-tight">{pillar.title}</h3>
                    <p className="text-muted-foreground leading-relaxed font-medium">{pillar.desc}</p>
                  </div>
                  <Link href="/transparency" className="pt-4 flex items-center text-sm font-bold text-primary group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Live Marketplace Preview */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-40">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">The Engine</div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.95]">Precision <br />Capital Flow.</h2>
              <p className="text-xl text-muted-foreground font-medium max-w-lg">
                Our platform manages the entire invoice lifecycle, from rigorous credit review to secure settlement.
              </p>
            </div>

            <div className="space-y-10 relative">
              {[
                { step: "01", title: "Document Ingestion", desc: "MSMEs upload invoices; our team verifies document integrity and authenticity." },
                { step: "02", title: "Credit Review", desc: "Corporate buyer profiles are manually evaluated for marketplace stability." },
                { step: "03", title: "Funding", desc: "Individual investors deploy capital into verified, asset-backed invoices." }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 group">
                  <div className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors duration-500 leading-none">{item.step}</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/30 to-blue-600/30 blur-3xl rounded-[3rem] -z-10 opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
            <Card className="glass border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]">
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                </div>
                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest">Secure Marketplace Terminal</div>
                <div className="w-3 h-3" />
              </div>
              <CardContent className="p-10 space-y-10">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h4 className="font-black text-2xl">Active Assets</h4>
                    <p className="text-sm font-bold text-muted-foreground">Marketplace Liquidity</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                    <Activity className="w-7 h-7" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-muted-foreground">
                    <span>Marketplace Activity</span>
                    <span className="text-emerald-500">Live</span>
                  </div>
                  <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                    <div className="h-full bg-gradient-to-r from-primary to-blue-400 w-[84%] rounded-full relative shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:1.5rem_1.5rem] animate-shimmer"></div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4">
                  {marketplaceInvoices && marketplaceInvoices.length > 0 ? (
                    marketplaceInvoices.map((inv: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-white/5 glass-dark hover:border-primary/30 transition-all gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-sm font-black uppercase tracking-tight">#{inv.invoice_number}</div>
                            <div className="text-xs text-muted-foreground font-bold">{inv.profiles?.company_name || inv.buyer_name}</div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-black text-emerald-500">{formatINR(inv.amount)}</div>
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{inv.tenure_days} Days • {(Number(inv.discount_rate) * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-white/20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Marketplace Standby</p>
                        <p className="text-[10px] font-medium italic text-muted-foreground/60 max-w-[200px]">New institutional-grade assets are currently undergoing manual vetting.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full relative px-4 py-40 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-20" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        <div className="max-w-5xl mx-auto glass-dark rounded-[3rem] border border-white/5 p-12 md:p-24 text-center space-y-12 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
          
          <div className="mx-auto w-24 h-24 mb-4 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/20 group-hover:rotate-12 transition-transform duration-500">
            <ShieldCheck className="w-12 h-12 text-primary" />
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9]">Ready for premium <br />liquidity?</h2>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              Join the elite marketplace building the future of transparent, asset-backed supply chain financing.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
            {user ? (
              <Button size="lg" asChild className="h-16 px-12 bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-2xl text-lg font-black tracking-tight">
                <Link href={`/dashboard/${role}`}>
                  Open Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="h-16 px-12 bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95 shadow-2xl text-lg font-black tracking-tight">
                  <Link href="/signup">
                    Create Account
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="h-16 px-12 glass border-white/10 hover:bg-white/10 transition-all hover:scale-105 active:scale-95 text-lg font-black tracking-tight">
                  <Link href="/transparency">
                    Learn More
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
