"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Users, 
  FileText, 
  ShieldAlert, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  IndianRupee, 
  Settings, 
  History, 
  Bell, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  Gavel
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Stats matching official financial model (1% Platform Fee)
  const stats = {
    gmv: "Rs. 12.5 Cr",
    revenue: "Rs. 12.5 Lakhs", // 1% of 12.5 Cr
    msmes: 142,
    investors: 86,
    activeInvoices: 24,
    pendingKYC: 15,
    disputes: 3,
    health: "99.9%"
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header section with Premium feel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-2 py-0.5 font-bold uppercase tracking-widest text-[10px]">
              System Live
            </Badge>
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Last update: 2 mins ago
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">Operations Control</h1>
          <p className="text-muted-foreground font-medium text-lg">Centralized governance for InvoiceFlow ecosystem.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="glass border-white/5 font-bold h-11 px-6">
            <History className="mr-2 h-4 w-4" /> Audit Logs
          </Button>
          <Button variant="destructive" className="h-11 px-6 font-bold shadow-lg shadow-red-500/20">
            <ShieldAlert className="mr-2 h-4 w-4" /> Security Audit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8" onValueChange={setActiveTab}>
        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md py-2 border-b border-white/5">
          <ScrollArea className="w-full">
            <TabsList className="bg-white/5 p-1 h-14 border border-white/5 inline-flex w-max md:w-full justify-start md:justify-center">
              <TabsTrigger value="overview" className="px-6 font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="kyc" className="px-6 font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white">KYC Approvals <Badge className="ml-2 bg-blue-500/20 text-blue-400 border-none px-1.5 h-4 text-[10px]">{stats.pendingKYC}</Badge></TabsTrigger>
              <TabsTrigger value="invoices" className="px-6 font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white">Invoices</TabsTrigger>
              <TabsTrigger value="risk" className="px-6 font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white">Risk & Fraud</TabsTrigger>
              <TabsTrigger value="disputes" className="px-6 font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white">Disputes <Badge className="ml-2 bg-red-500/20 text-red-400 border-none px-1.5 h-4 text-[10px]">{stats.disputes}</Badge></TabsTrigger>
              <TabsTrigger value="repayments" className="px-6 font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white">Repayments</TabsTrigger>
              <TabsTrigger value="settings" className="px-6 font-bold data-[state=active]:bg-white/10 data-[state=active]:text-white">Settings</TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>

        <TabsContent value="overview" className="space-y-8">
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-dark border-white/5 hover:border-white/10 transition-all duration-300 group">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[10px]">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total GMV</p>
                  <h3 className="text-2xl font-black">{stats.gmv}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">Total volume disbursed</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-white/5 hover:border-white/10 transition-all duration-300 group">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <Badge className="bg-blue-500/10 text-blue-500 border-none font-bold text-[10px]">
                    1.0% FIXED
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform Revenue</p>
                  <h3 className="text-2xl font-black">{stats.revenue}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">Accumulated platform fees</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-white/5 hover:border-white/10 transition-all duration-300 group">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted" />
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Stakeholders</p>
                  <h3 className="text-2xl font-black">{stats.msmes + stats.investors}</h3>
                  <p className="text-[10px] text-muted-foreground font-medium">{stats.msmes} MSMEs • {stats.investors} Investors</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-white/5 hover:border-white/10 transition-all duration-300 group">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
                    <Activity className="w-5 h-5" />
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-500 border-none font-bold text-[10px]">
                    HEALTHY
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Health</p>
                  <h3 className="text-2xl font-black">{stats.health}</h3>
                  <Progress value={99.9} className="h-1 bg-white/5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-dark border-white/5">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black">Transaction Activity</CardTitle>
                  <CardDescription>Real-time funding and repayment flow</CardDescription>
                </div>
                <Button variant="ghost" className="text-xs font-bold">View Detailed Reports</Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
                  <div className="text-center space-y-2">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                    <p className="text-muted-foreground font-bold">Volume Visualization Layer</p>
                    <p className="text-[10px] text-muted-foreground/60">Active monitoring of capital flow enabled</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="glass-dark border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-500" /> Critical Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { type: "risk", title: "Unusual Funding Pattern", desc: "Investor #824 large deposit detected", time: "12m ago" },
                    { type: "payment", title: "Repayment Overdue", desc: "MSME #42 overdue by Rs. 2.4L", time: "45m ago" },
                    { type: "kyc", title: "High Value KYC", desc: "Institutional MSME pending review", time: "2h ago" },
                  ].map((alert, i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                      <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${alert.type === "risk" ? "bg-red-500" : "bg-orange-500"}`} />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{alert.title}</p>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">{alert.desc}</p>
                        <p className="text-[9px] font-black text-muted-foreground/50 uppercase">{alert.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Button className="w-full h-12 font-black shadow-xl">
                Generate Monthly Report
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kyc">
          <Card className="glass-dark border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-8">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black italic">Verification Queue</CardTitle>
                <CardDescription>Review and approve new stakeholder registrations.</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input className="bg-white/5 border border-white/5 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20 w-64" placeholder="Search entity name..." />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left bg-white/[0.02]">
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Entity Name</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Type</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Submitted</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Documents</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { name: "Global Exports Ltd", type: "MSME", date: "28 Apr 2026", docs: 4, status: "Pending" },
                      { name: "Rahul Sharma", type: "Investor", date: "27 Apr 2026", docs: 2, status: "Under Review" },
                      { name: "Precision Tools Co", type: "MSME", date: "27 Apr 2026", docs: 5, status: "Pending" },
                      { name: "Anita Varma", type: "Investor", date: "26 Apr 2026", docs: 2, status: "Under Review" },
                    ].map((entity, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center font-black text-white text-sm">
                              {entity.name[0]}
                            </div>
                            <span className="font-bold text-white">{entity.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className="border-white/10 text-[10px] font-black">{entity.type}</Badge>
                        </td>
                        <td className="px-8 py-6 text-sm text-muted-foreground">{entity.date}</td>
                        <td className="px-8 py-6 text-sm">
                          <span className="font-bold text-blue-400 cursor-pointer hover:underline">{entity.docs} Files Uploaded</span>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className={entity.status === "Pending" ? "bg-blue-500/10 text-blue-500 border-none" : "bg-orange-500/10 text-orange-500 border-none"}>
                            {entity.status}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10">
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0 border-red-500/20 text-red-500 hover:bg-red-500/10">
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 px-3 text-[10px] font-black uppercase tracking-widest">Review</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="glass-dark border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-8">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black italic">Invoice Monitoring</CardTitle>
                <CardDescription>Track funding progress and verify authenticity.</CardDescription>
              </div>
              <Button className="h-11 px-6 font-bold shadow-lg shadow-primary/20">
                Bulk Verify Invoices
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left bg-white/[0.02]">
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Invoice ID</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Issuer (MSME)</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Funding</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Platform Fee (1%)</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { id: "INV-2024-001", issuer: "AgroFarms Pvt Ltd", amount: "Rs. 12,40,000", funding: 75, fee: "Rs. 12,400", status: "Active" },
                      { id: "INV-2024-002", issuer: "TextileHub", amount: "Rs. 8,50,000", funding: 100, fee: "Rs. 8,500", status: "Funded" },
                      { id: "INV-2024-003", issuer: "SteelWorks", amount: "Rs. 25,00,000", funding: 20, fee: "Rs. 25,000", status: "Active" },
                      { id: "INV-2024-004", issuer: "Modern Logistics", amount: "Rs. 5,20,000", funding: 0, fee: "Rs. 5,200", status: "Pending Verification" },
                    ].map((inv, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 font-black text-white">{inv.id}</td>
                        <td className="px-8 py-6 font-bold text-muted-foreground">{inv.issuer}</td>
                        <td className="px-8 py-6 font-black text-white">{inv.amount}</td>
                        <td className="px-8 py-6">
                          <div className="space-y-1.5 min-w-[120px]">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                              <span className="text-white">{inv.funding}%</span>
                              <span className="text-muted-foreground">Target Met</span>
                            </div>
                            <Progress value={inv.funding} className="h-1 bg-white/5" />
                          </div>
                        </td>
                        <td className="px-8 py-6 font-bold text-emerald-400">{inv.fee}</td>
                        <td className="px-8 py-6">
                          <Badge className={inv.status === "Funded" ? "bg-emerald-500/10 text-emerald-500 border-none" : "bg-blue-500/10 text-blue-500 border-none"}>
                            {inv.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass-dark border-white/5 md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-black italic">Risk Analysis Engine</CardTitle>
                    <CardDescription>Automated detection of suspicious activities.</CardDescription>
                  </div>
                  <Badge variant="outline" className="border-red-500/20 text-red-500 bg-red-500/5 font-black uppercase tracking-widest text-[10px]">
                    4 High Risk Detected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { title: "Duplicate Invoice Submission", level: "High", entity: "MSME #129", desc: "Similar invoice metadata detected in previous 30 days.", action: "Flagged for manual review" },
                  { title: "Unusual Funding Velocity", level: "Medium", entity: "Investor #48", desc: "Funding volume increased by 400% within 24 hours.", action: "Verification required" },
                  { title: "Repayment Delay Chain", level: "High", entity: "Group #2", desc: "3 MSMEs in the same cluster experiencing simultaneous delays.", action: "Risk limit reduced" },
                ].map((risk, i) => (
                  <div key={i} className="p-5 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${risk.level === "High" ? "text-red-500" : "text-orange-500"}`} />
                        <h4 className="font-black text-white">{risk.title}</h4>
                        <Badge className={`${risk.level === "High" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"} border-none text-[10px]`}>{risk.level}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium italic">{risk.entity} • {risk.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] font-black text-muted-foreground/60 uppercase">{risk.action}</span>
                      <Button size="sm" variant="outline" className="h-9 px-4 font-bold border-white/10 hover:bg-white/5">Investigate</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="glass-dark border-white/5">
                <CardHeader>
                  <CardTitle className="text-lg font-black italic">Platform Trust Score</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center space-y-4 py-8">
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle className="text-white/5 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                      <circle className="text-emerald-500 stroke-current" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="25.12" fill="transparent" r="40" cx="50" cy="50" style={{ transformOrigin: "center", transform: "rotate(-90deg)" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black italic">92</span>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Excellent</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic font-medium px-4">
                    "Platform health is maintained through proactive monitoring and automated validation protocols."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="disputes">
          <Card className="glass-dark border-white/5">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-8">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black italic">Dispute Management</CardTitle>
                <CardDescription>Resolve conflicts between MSMEs and Investors.</CardDescription>
              </div>
              <Badge className="bg-red-500/20 text-red-500 border-none font-black h-8 px-4">
                3 Open Cases
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left bg-white/[0.02]">
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Case ID</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Parties</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Subject</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Amount Disputed</th>
                      <th className="px-8 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-right text-[10px] font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {[
                      { id: "DSP-401", parties: "MSME #42 vs Investor #11", subject: "Repayment Delay Verification", amount: "Rs. 1,50,000", status: "Investigation" },
                      { id: "DSP-402", parties: "Investor #86 vs Platform", subject: "Return Calculation Query", amount: "Rs. 12,400", status: "New" },
                      { id: "DSP-403", parties: "MSME #88 vs Investor #2", subject: "Partial Funding Conflict", amount: "Rs. 4,20,000", status: "Hearing" },
                    ].map((caseItem, i) => (
                      <tr key={i} className="group hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 font-black text-white">{caseItem.id}</td>
                        <td className="px-8 py-6 text-sm font-bold text-muted-foreground italic">{caseItem.parties}</td>
                        <td className="px-8 py-6 text-sm text-white font-medium">{caseItem.subject}</td>
                        <td className="px-8 py-6 font-black text-white">{caseItem.amount}</td>
                        <td className="px-8 py-6">
                          <Badge className="bg-white/5 text-muted-foreground border border-white/10 uppercase text-[10px] font-black">{caseItem.status}</Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button size="sm" variant="outline" className="h-9 px-6 font-black uppercase tracking-widest border-white/10 hover:bg-white/5">Resolve</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repayments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-dark border-white/5">
              <CardHeader>
                <CardTitle className="text-xl font-black italic">Repayment Performance</CardTitle>
                <CardDescription>Aggregated metrics across all active loans.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 py-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">On-Time Repayments</span>
                    <span className="text-xl font-black text-emerald-500 italic">98.2%</span>
                  </div>
                  <Progress value={98.2} className="h-2 bg-white/5" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Next 7 Days</p>
                    <p className="text-lg font-black text-white italic">Rs. 42.8 Lakhs</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Overdue Total</p>
                    <p className="text-lg font-black text-red-500 italic">Rs. 2.4 Lakhs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-white/5">
              <CardHeader>
                <CardTitle className="text-xl font-black italic flex items-center gap-2">
                  <Gavel className="w-5 h-5 text-primary" /> Pre-Closure & Penalties
                </CardTitle>
                <CardDescription>Monitoring non-standard repayment activities.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody className="divide-y divide-white/5">
                      {[
                        { type: "Penalty", entity: "MSME #12", amount: "Rs. 5,000", reason: "3 Days Overdue" },
                        { type: "Pre-Closure", entity: "MSME #82", amount: "Rs. 2.5L", reason: "Early Settlement" },
                        { type: "Penalty", entity: "MSME #4", amount: "Rs. 1,200", reason: "Late Fee" },
                      ].map((item, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <Badge className={`${item.type === "Penalty" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"} border-none text-[10px] font-black`}>{item.type}</Badge>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-white">{item.entity}</td>
                          <td className="px-6 py-4 text-xs font-black text-white italic">{item.amount}</td>
                          <td className="px-6 py-4 text-[10px] text-muted-foreground italic font-medium">{item.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="glass-dark border-white/5 max-w-4xl mx-auto">
            <CardHeader className="border-b border-white/5 p-8">
              <CardTitle className="text-2xl font-black italic">Platform Configuration</CardTitle>
              <CardDescription>Manage global settings and business logic parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-12">
              <div className="space-y-6">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <IndianRupee className="w-3 h-3" /> Financial Parameters
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Platform Commission Fee (%)</label>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-black italic text-xl w-full">1.0%</div>
                      <Button variant="outline" className="h-12 border-white/10 font-bold">Edit</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Fixed percentage applied to all invoice values (Official Model).</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Pre-Closure Penalty Fee (%)</label>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 font-black italic text-xl w-full">2.5%</div>
                      <Button variant="outline" className="h-12 border-white/10 font-bold">Edit</Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">Applied on principal amount for early settlements.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <ShieldAlert className="w-3 h-3" /> Security & Governance
                </h4>
                <div className="space-y-4">
                  {[
                    { title: "Automatic KYC Approval", desc: "Enable AI-driven verification for standard identity documents.", enabled: false },
                    { title: "Risk-Based Funding Limits", desc: "Dynamically adjust investor caps based on entity risk score.", enabled: true },
                    { title: "System-Wide Maintenance Mode", desc: "Suspend all transactions and dashboard access for maintenance.", enabled: false },
                  ].map((setting, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white">{setting.title}</p>
                        <p className="text-[10px] text-muted-foreground italic font-medium">{setting.desc}</p>
                      </div>
                      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${setting.enabled ? "bg-emerald-500" : "bg-white/10"}`}>
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${setting.enabled ? "translate-x-6" : ""}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

