import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";

export default function MsmeDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">MSME Dashboard</h2>
          <p className="text-muted-foreground font-medium text-lg">Manage your invoices and liquidity requests.</p>
        </div>
        <Button className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-5 w-5" /> Raise Funding
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Requests", value: "₹0", sub: "0 Invoices", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Total Funded", value: "₹0", sub: "0 Invoices", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Platform Fee Paid", value: "₹0", sub: "Fixed 1% Fee", icon: ArrowUpRight, color: "text-purple-500", bg: "bg-purple-500/10" },
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
          <CardTitle className="text-2xl font-black">Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center py-20 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No recent activity to display.</p>
            <Button variant="outline" className="border-white/10 hover:bg-white/5">Upload your first invoice</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
