import { Activity, BarChart3, PieChart, Shield } from "lucide-react";

export default function TransparencyPage() {
  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient leading-[0.9]">
          True <br />Transparency.
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
          At InvoiceFlow, transparency isn't just a buzzword—it's the core of our financial model. We provide real-time visibility into marketplace performance and risk metrics.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Real-Time Ledger",
            desc: "Every transaction is recorded on our immutable ledger, accessible to participants in real-time.",
            icon: Activity
          },
          {
            title: "Performance Data",
            desc: "Publicly disclosed default rates and yield performance across the entire marketplace.",
            icon: BarChart3
          },
          {
            title: "Risk Engine",
            desc: "Complete disclosure of our risk assessment methodology and buyer credit scoring.",
            icon: Shield
          }
        ].map((item, i) => (
          <div key={i} className="glass-dark border-white/5 rounded-3xl p-10 space-y-6 group hover:border-primary/50 transition-colors">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <item.icon className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-black tracking-tight leading-none">Risk Management <br />Framework</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our proprietary risk engine analyzes over 200 data points to score invoices and corporate buyers. This ensures that only high-quality, asset-backed opportunities reach our individual investors.
          </p>
          <ul className="space-y-4">
            {[
              "Automated bank statement analysis",
              "Corporate buyer credit history verification",
              "GST verification and reconciliation",
              "Historical payment performance tracking"
            ].map((check, i) => (
              <li key={i} className="flex items-center gap-3 font-bold text-sm text-foreground">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {check}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full -z-10" />
          <div className="glass-dark border-white/10 rounded-[3rem] p-12 aspect-square flex flex-col items-center justify-center text-center space-y-8">
            <PieChart className="w-32 h-32 text-primary/40" />
            <div className="space-y-2">
              <div className="text-5xl font-black">0.12%</div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Historical Default Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
