import { Shield, Users, Target, Rocket } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient leading-[0.9]">
          Democratizing <br />Working Capital.
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
          InvoiceFlow is India's premier marketplace for invoice discounting, connecting verified MSMEs with a community of individual investors looking for secure, asset-backed yields.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed">
            To bridge the credit gap for small businesses by unlocking the value of their unpaid invoices, while providing investors with a low-risk, high-return alternative to traditional debt instruments.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Rocket className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Our Vision</h2>
          <p className="text-muted-foreground leading-relaxed">
            To become the backbone of India's supply chain finance infrastructure, facilitating seamless liquidity flow for every enterprise, no matter the size.
          </p>
        </div>
      </div>

      <div className="glass-dark border-white/5 rounded-3xl p-8 md:p-12 space-y-8">
        <h2 className="text-3xl font-black tracking-tight">Why InvoiceFlow?</h2>
        <div className="grid sm:grid-cols-2 gap-8">
          <div className="flex gap-4">
            <Shield className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h3 className="font-bold">Trust & Transparency</h3>
              <p className="text-sm text-muted-foreground">Every MSME and buyer undergoes rigorous KYC and credit assessment.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <Users className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h3 className="font-bold">Community Driven</h3>
              <p className="text-sm text-muted-foreground">Our platform is built for individual investors to participate in premium-quality assets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
