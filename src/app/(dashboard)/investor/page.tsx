import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Wallet, ShieldCheck, Search } from "lucide-react";

export default function InvestorDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">Investor Dashboard</h2>
          <p className="text-muted-foreground font-medium text-lg">Manage your portfolio and discover new opportunities.</p>
        </div>
        <Button className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
          <Search className="mr-2 h-5 w-5" /> Browse Marketplace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Portfolio Value", value: "₹0", sub: "Target 12-15% ARR", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Wallet Balance", value: "₹0", sub: "Available for deployment", icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Active Investments", value: "0 Assets", sub: "100% Asset-Backed", icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-dark border-white/5 overflow-hidden group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black">{stat.value}</h3>
                <p className="text-xs font-bold text-muted-foreground">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-dark border-white/5">
        <CardHeader className="p-8 border-b border-white/5">
          <CardTitle className="text-2xl font-black">Investment Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Your portfolio is ready for its first investment.</p>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">View Available Invoices</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
