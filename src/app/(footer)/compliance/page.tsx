import { ShieldCheck, FileText, Scale, Lock, Users } from "lucide-react";

export default function CompliancePage() {
  return (
    <div className="space-y-16">
      <div className="space-y-6">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gradient leading-[0.9]">
          Regulatory <br />Verification.
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-3xl leading-relaxed">
          At InvoiceFlow, we prioritize legal integrity and regulatory transparency. Our platform is built to exceed industry standards for financial marketplaces in India.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-8">
        {[
          {
            title: "KYC & AML",
            desc: "Thorough Know Your Customer (KYC) and Anti-Money Laundering (AML) checks for all participants.",
            icon: Users
          },
          {
            title: "Data Protection",
            desc: "Full adherence to the Digital Personal Data Protection Act (DPDP) and industry-best encryption.",
            icon: Lock
          },
          {
            title: "Legal Framework",
            desc: "Operating within the valid legal framework for invoice financing and peer-to-peer facilitation in India.",
            icon: Scale
          },
          {
            title: "Fair Practices",
            desc: "Adherence to fair practice codes, ensuring transparency in fees, risks, and payment processes.",
            icon: ShieldCheck
          }
        ].map((item, i) => (
          <div key={i} className="glass-dark border-white/5 rounded-3xl p-8 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <item.icon className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/5 rounded-[2.5rem] p-8 md:p-12 border border-white/10">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="space-y-6 flex-1">
            <h2 className="text-3xl font-black tracking-tight">Certification & Audits</h2>
            <p className="text-muted-foreground leading-relaxed">
              We undergo regular third-party security audits and financial verification reviews to ensure our systems remain bulletproof and our processes stay transparent.
            </p>
            <div className="flex gap-4">
              <div className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-black uppercase tracking-widest border border-emerald-500/20">ISO 27001 Certified</div>
              <div className="px-4 py-2 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-black uppercase tracking-widest border border-blue-500/20">SOC2 Type II Verified</div>
            </div>
          </div>
          <div className="w-48 h-48 bg-primary/20 rounded-full blur-3xl shrink-0 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
