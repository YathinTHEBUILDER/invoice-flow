import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, CheckCircle2, Building2, LineChart, Lock, ChevronRight, Activity, Zap } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full items-center bg-background selection:bg-blue-500/30 overflow-hidden">
      
      {/* Background ambient gradients */}
      <div className="absolute top-0 left-0 right-0 h-[800px] w-full bg-gradient-to-b from-blue-950/20 via-background to-background pointer-events-none -z-10" />
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-40 left-1/4 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      {/* Hero Section */}
      <section className="relative w-full max-w-7xl mx-auto px-4 md:px-8 pt-32 pb-24 md:pt-48 md:pb-32">
        <div className="flex flex-col items-center text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          <div className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-md shadow-sm transition-colors hover:bg-blue-500/10">
            <span className="relative flex h-2.5 w-2.5 mr-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
            </span>
            Institutional-Grade Invoice Factoring Infrastructure
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight max-w-5xl text-balance leading-[1.1]">
            Unlock Working Capital <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-500">Without Compromise.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            InvoiceFlow is the transparent marketplace where verified MSMEs access reliable liquidity, and institutional investors discover secure, asset-backed yields.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
            <Button size="lg" asChild className="h-14 px-8 text-base font-semibold w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link href="#">
                Get Funded Today
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-14 px-8 text-base font-semibold w-full sm:w-auto border-border/60 hover:bg-muted/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Link href="#">
                Investor Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Architecture Section */}
      <section className="w-full relative py-24 border-y border-border/40 bg-muted/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Enterprise Infrastructure</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Built from the ground up to support the security and compliance requirements of modern financial institutions.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-background/50 border-border/50 backdrop-blur-md shadow-lg shadow-blue-900/5 hover:border-blue-500/30 transition-colors group">
              <CardContent className="p-8 flex flex-col items-start space-y-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Bank-Grade Security</h3>
                <p className="text-muted-foreground leading-relaxed">Comprehensive KYC/AML infrastructure with end-to-end encryption securing every transaction and data point.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 border-border/50 backdrop-blur-md shadow-lg shadow-blue-900/5 hover:border-indigo-500/30 transition-colors group">
              <CardContent className="p-8 flex flex-col items-start space-y-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 group-hover:bg-indigo-500/20 transition-colors">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Verified Identity</h3>
                <p className="text-muted-foreground leading-relaxed">Strict verification frameworks for both MSMEs and Investors, ensuring complete marketplace integrity.</p>
              </CardContent>
            </Card>
            <Card className="bg-background/50 border-border/50 backdrop-blur-md shadow-lg shadow-blue-900/5 hover:border-emerald-500/30 transition-colors group">
              <CardContent className="p-8 flex flex-col items-start space-y-4">
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                  <LineChart className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Clear Settlements</h3>
                <p className="text-muted-foreground leading-relaxed">Direct investment routing into verified invoice assets with clearly defined and automated settlement processes.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Streamlined Capital Flow</h2>
              <p className="text-lg text-muted-foreground">
                A highly optimized workflow designed to remove friction from supply chain financing.
              </p>
            </div>

            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.4rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500/50 before:via-indigo-500/50 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-background bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/30 z-10 group-hover:scale-110 transition-transform">1</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm group-hover:border-blue-500/30 transition-colors">
                  <h3 className="text-xl font-bold mb-2">Invoice Upload</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">MSMEs upload outstanding invoices securely to the platform for instant processing.</p>
                </div>
              </div>
              
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-background bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/30 z-10 group-hover:scale-110 transition-transform">2</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm group-hover:border-indigo-500/30 transition-colors">
                  <h3 className="text-xl font-bold mb-2">Risk Assessment</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Platform validates the invoice integrity and assesses the corporate buyer&apos;s credit profile.</p>
                </div>
              </div>

              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                <div className="flex items-center justify-center w-12 h-12 rounded-full border-[3px] border-background bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/30 z-10 group-hover:scale-110 transition-transform">3</div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-sm group-hover:border-emerald-500/30 transition-colors">
                  <h3 className="text-xl font-bold mb-2">Marketplace Funding</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">Approved invoices are securely listed on the marketplace for fractional or full funding.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative lg:ml-10 perspective-1000">
            <div className="absolute -inset-10 bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 blur-3xl rounded-[3rem] -z-10 opacity-70" />
            <Card className="border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-blue-950/50 overflow-hidden transform-gpu rotate-y-[-5deg] rotate-x-[2deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700 ease-out">
              <div className="p-3 border-b border-border/50 bg-muted/40 flex items-center gap-3">
                <div className="flex gap-1.5 ml-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="flex-1 text-center mr-12">
                  <span className="inline-flex items-center justify-center gap-1.5 bg-background/60 text-muted-foreground text-xs font-medium px-4 py-1.5 rounded-md shadow-sm border border-border/50">
                    <Lock className="w-3 h-3" /> app.invoiceflowindia.tech
                  </span>
                </div>
              </div>
              <CardContent className="p-8 space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xl text-foreground">Marketplace Overview</h4>
                    <p className="text-sm text-muted-foreground">Live asset allocation</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Platform Liquidity Flow</span>
                    <span className="text-emerald-500 font-medium flex items-center gap-1"><Zap className="w-3 h-3"/> Active</span>
                  </div>
                  <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 w-[70%] rounded-full relative">
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:1rem_1rem] animate-[shimmer_1s_infinite_linear]"></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Example Invoices</div>
                  {[1, 2].map((i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border/40 bg-background/50 hover:bg-background/80 transition-colors gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-foreground">INV-DEMO-00{i}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Corporate Buyer • 60 Days</div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:items-end text-left sm:text-right">
                        <div className="text-xs text-muted-foreground uppercase">Status</div>
                        <div className="text-sm font-bold text-emerald-500">Available</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="w-full relative overflow-hidden mt-10">
        <div className="absolute inset-0 bg-blue-600/5 -z-10" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center space-y-10 relative">
          <div className="mx-auto w-20 h-20 mb-8 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <ShieldCheck className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to access institutional capital?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Join the transparent marketplace building the future of secure B2B supply chain financing.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" asChild className="h-14 px-10 bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-xl text-base font-semibold">
              <Link href="#">
                Create Your Account
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />
      </section>

      {/* Footer */}
      <footer className="w-full bg-background border-t border-border/40 relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <div className="col-span-2 md:col-span-1 space-y-6">
              <Logo className="mb-4" />
              <p className="text-sm text-muted-foreground pr-4 leading-relaxed">
                The modern, transparent marketplace for institutional-grade invoice factoring.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Platform</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-blue-500 transition-colors">For MSMEs</Link></li>
                <li><Link href="#" className="hover:text-blue-500 transition-colors">For Investors</Link></li>
                <li><Link href="#" className="hover:text-blue-500 transition-colors">Login to Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-foreground">Legal & Security</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">AML & KYC Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/40 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} InvoiceFlow Platform. All rights reserved.</p>
            <p className="flex items-center gap-1.5">
              Deployed securely on 
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:text-blue-500 transition-colors flex items-center gap-1">
                <svg width="12" height="10" viewBox="0 0 116 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M57.5 0L115 100H0L57.5 0Z"/></svg>
                Vercel
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
