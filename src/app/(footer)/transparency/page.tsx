import { Activity, BarChart3, PieChart, Shield } from "lucide-react";
import { createClient } from "@/lib/server";
import { formatPercent } from "@/lib/utils";

export default async function TransparencyPage() {
  const supabase = await createClient();
  const { data: repayments } = await supabase
    .from("repayments")
    .select("status");

  const repaymentList = repayments || [];
  const totalRepayments = repaymentList.length;
  const overdueRepayments = repaymentList.filter(r => r.status === "overdue").length;
  const defaultRateDecimal = totalRepayments > 0 ? overdueRepayments / totalRepayments : 0;
  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          True <br />Transparency.
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
          At InvoiceFlow, transparency isn't just a buzzword—it's the core of our financial model. We provide live updates on marketplace performance and risk metrics.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Real-Time Ledger",
            desc: "Every transaction is recorded on our permanent record, accessible to participants live.",
            icon: Activity
          },
          {
            title: "Performance Data",
            desc: "Publicly disclosed default rates and yield performance across the entire marketplace.",
            icon: BarChart3
          },
          {
            title: "Expert Credit Review",
            desc: "Full disclosure of our manual credit assessment methodology and risk control protocols.",
            icon: Shield
          }
        ].map((item, i) => (
          <div key={i} className="glass-dark rounded-2xl p-8 space-y-6 group hover:border-primary/50 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <item.icon className="w-7 h-7" />
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight leading-tight text-white">Risk Control <br />Framework</h2>
          <p className="text-muted-foreground leading-relaxed">
            Our manual credit assessment process involves a deep-dive analysis of corporate buyers and MSME assets. This ensures that only high-quality, verified opportunities reach our individual investors.
          </p>
          <ul className="space-y-4">
            {[
              "Manual bank statement verification",
              "Corporate buyer credit history audit",
              "GST and manual verification",
              "Verified historical payment performance"
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
          <div className="glass-dark rounded-2xl p-12 aspect-square flex flex-col items-center justify-center text-center space-y-8">
            <PieChart className="w-32 h-32 text-primary/40" />
            <div className="space-y-2">
              <div className="text-5xl font-black">{formatPercent(defaultRateDecimal)}</div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground">Historical Default Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
