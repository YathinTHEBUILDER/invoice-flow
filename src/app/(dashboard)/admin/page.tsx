"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Settings, 
  History, 
  Search,
  Gavel,
  Loader2,
  RefreshCcw,
  ShieldCheck,
  Briefcase,
  FileText
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { 
  getAdminStats, 
  getKYCQueue, 
  getInvoices, 
  approveKYCAction,
  rejectKYCAction,
  getPlatformSettings,
  updateSettingAction,
  getDisputes,
  getAuditLogs
} from "@/app/actions/admin";
import { createClient } from "@/lib/client";
import { toast } from "sonner";

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") || "overview";
  
  const [activeTab, setActiveTab] = useState(tabParam);
  const [stats, setStats] = useState<any>(null);
  const [kycQueue, setKycQueue] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [disputes, setDisputes] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionNotes, setRejectionNotes] = useState("");

  useEffect(() => {
    setActiveTab(tabParam);
  }, [tabParam]);

  const loadData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.app_metadata?.role !== 'admin') {
        toast.error("Access Denied: Administrative authority required.");
        router.push("/");
        return;
      }

      const [statsData, kycData, invoiceData, settingsData, disputeData, logsData] = await Promise.all([
        getAdminStats(),
        getKYCQueue(),
        getInvoices(),
        getPlatformSettings(),
        getDisputes(),
        getAuditLogs()
      ]);
      setStats(statsData);
      setKycQueue(kycData);
      setInvoices(invoiceData);
      setSettings(settingsData);
      setDisputes(disputeData);
      setAuditLogs(logsData);
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error);
      if (error.message?.includes("Unauthorized") || error.message?.includes("Admin access required")) {
        router.push("/");
      } else {
        toast.error("Failed to sync with real-time platform data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleKYCUpdate = async (requestId: string, status: "approved" | "rejected", userId: string) => {
    setActionLoading(requestId);
    try {
      if (status === "approved") {
        const result = await approveKYCAction({ requestId, userId });
        if (result?.data?.success) {
          toast.success("Identity approved successfully.");
          setSelectedRequest(null);
          await loadData();
        } else {
          toast.error(result?.serverError || "Failed to approve KYC.");
        }
      } else {
        if (!rejectionNotes || rejectionNotes.length < 5) {
          toast.error("Please provide a detailed rejection reason.");
          return;
        }
        const result = await rejectKYCAction({ requestId, userId, notes: rejectionNotes });
        if (result?.data?.success) {
          toast.success("Identity rejected successfully.");
          setSelectedRequest(null);
          setRejectionNotes("");
          await loadData();
        } else {
          toast.error(result?.serverError || "Failed to reject KYC.");
        }
      }
    } catch (error) {
      toast.error("An unexpected system error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    try {
      const result = await updateSettingAction({ key, value });
      if (result?.data?.success) {
        toast.success(`Platform setting ${key} updated.`);
        await loadData();
      }
    } catch (error) {
      toast.error("Failed to update platform settings.");
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse text-xs">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white">
            Operations <span className="text-primary italic">Terminal</span>
          </h1>
          <p className="text-muted-foreground font-medium text-lg max-w-2xl text-balance">
            Manual administrative control and oversight for the InvoiceFlow liquidity ecosystem.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadData}
          className="glass border-white/5 font-black uppercase tracking-widest text-[10px] h-12 px-6 hover:bg-white/5"
        >
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => router.push(`/admin?tab=${v}`)} className="space-y-10">
        <div className="sticky top-[96px] z-40 bg-background/80 backdrop-blur-xl py-4 border-b border-white/5 -mx-8 px-8">
          <ScrollArea className="w-full">
            <TabsList className="bg-white/5 p-1 h-14 border border-white/5 inline-flex w-max md:w-full justify-start md:justify-center">
              <TabsTrigger value="overview" className="px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-white">Overview</TabsTrigger>
              <TabsTrigger value="kyc" className="px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Compliance 
                {stats.pendingKYC > 0 && (
                  <Badge className="ml-2 bg-primary text-white border-none px-2 h-4 text-[10px] font-black">{stats.pendingKYC}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="invoices" className="px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-white">Assets</TabsTrigger>
              <TabsTrigger value="disputes" className="px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-white">
                Conflicts 
                {stats.disputes > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white border-none px-2 h-4 text-[10px] font-black">{stats.disputes}</Badge>
                )}
              </TabsTrigger>

              <TabsTrigger value="logs" className="px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-white">Audit Logs</TabsTrigger>
              <TabsTrigger value="settings" className="px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-white/10 data-[state=active]:text-white">Settings</TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>

        {/* --- OVERVIEW TAB --- */}
        <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-dark border-white/5 hover:border-white/10 transition-all group overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Volume (GMV)</p>
                  <h3 className="text-3xl font-black text-white">{formatCurrency(stats.gmv)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-white/5 hover:border-white/10 transition-all group overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-2">{stats.commissionPercent}%</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Platform Revenue</p>
                  <h3 className="text-3xl font-black text-white">{formatCurrency(stats.revenue)}</h3>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-dark border-white/5 hover:border-white/10 transition-all group overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500 w-fit">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Total Stakeholders</p>
                  <h3 className="text-3xl font-black text-white">{stats.msmeCount + stats.investorCount}</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stats.msmeCount} MSMEs • {stats.investorCount} Investors</p>
                </div>
              </CardContent>
            </Card>


          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">


            <div className="space-y-8">
              <Card className="glass-dark border-white/5">
                <CardHeader className="p-6 border-b border-white/5">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Action Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {stats.pendingKYC > 0 && (
                    <div 
                      onClick={() => router.push("/admin?tab=kyc")}
                      className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-primary shadow-lg shadow-primary/40 group-hover:scale-125 transition-transform" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-wider">Compliance Bottleneck</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{stats.pendingKYC} Entities Awaiting ID Verification</p>
                      </div>
                    </div>
                  )}
                  {stats.disputes > 0 && (
                    <div 
                      onClick={() => router.push("/admin?tab=disputes")}
                      className="flex gap-4 p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:border-red-500/30 transition-all cursor-pointer group"
                    >
                      <div className="mt-1 w-2 h-2 rounded-full shrink-0 bg-red-500 shadow-lg shadow-red-500/40 group-hover:scale-125 transition-transform" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white uppercase tracking-wider">Liquidity Conflict</p>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase">{stats.disputes} Active Disputes Requiring Mediation</p>
                      </div>
                    </div>
                  )}
                  {stats.pendingKYC === 0 && stats.disputes === 0 && (
                    <div className="py-12 text-center space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mx-auto" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No Critical Interruptions</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              

            </div>
          </div>
        </TabsContent>

        {/* --- KYC TAB --- */}
        <TabsContent value="kyc" className="focus-visible:outline-none">
          {selectedRequest ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedRequest(null)}
                  className="font-black uppercase tracking-widest text-[10px] hover:bg-white/5"
                >
                  <RefreshCcw className="mr-2 h-4 w-4" /> Back to Queue
                </Button>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="border-white/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                    Request #{selectedRequest.id.split('-')[0]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-10">
                  <Card className="glass-dark border-white/5 overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                      <CardTitle className="text-2xl font-black italic">Submitted Repositories</CardTitle>
                      <CardDescription>Inspect high-resolution business registrations and tax identifiers.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {Object.entries(selectedRequest.documents || {}).filter(([key]) => key !== 'selfie').map(([key, url]: [string, any]) => (
                        <div key={key} className="space-y-4">
                          <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">{key.replace('_', ' ')}</label>
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group relative block aspect-video rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-primary/30 transition-all shadow-2xl"
                          >
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Search className="w-8 h-8 text-white" />
                            </div>
                            {url.endsWith('.pdf') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
                                  <FileText className="w-12 h-12 text-primary/40" />
                                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">PDF Document</span>
                                </div>
                            ) : (
                                <img src={url} alt={key} className="w-full h-full object-cover" />
                            )}
                          </a>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="glass-dark border-white/5 bg-primary/[0.01]">
                    <CardHeader className="p-8 border-b border-white/5">
                      <CardTitle className="text-xl font-black italic">Administrative Decision</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Rejection Remarks (Required if rejecting)</label>
                        <Input 
                          placeholder="Provide detailed feedback for the MSME..." 
                          value={rejectionNotes}
                          onChange={(e) => setRejectionNotes(e.target.value)}
                          className="bg-white/5 border-white/10 h-16 font-bold focus:bg-white/10 transition-all"
                        />
                      </div>
                      <div className="flex gap-6">
                        <Button 
                          className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-500/20"
                          onClick={() => handleKYCUpdate(selectedRequest.id, "approved", selectedRequest.user_id)}
                          disabled={actionLoading === selectedRequest.id}
                        >
                          {actionLoading === selectedRequest.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                          Confirm Clearance
                        </Button>
                        <Button 
                          variant="destructive"
                          className="flex-1 h-14 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-500/20"
                          onClick={() => handleKYCUpdate(selectedRequest.id, "rejected", selectedRequest.user_id)}
                          disabled={actionLoading === selectedRequest.id}
                        >
                          {actionLoading === selectedRequest.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-5 w-5" />}
                          Issue Rejection
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-10">
                  <Card className="glass-dark border-white/5 overflow-hidden">
                    <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                      <CardTitle className="text-xl font-black italic">Biometric Selfie</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="aspect-[3/4] w-full rounded-[60px/80px] border-4 border-dashed border-white/10 overflow-hidden bg-white/[0.02]">
                        {selectedRequest.documents?.selfie ? (
                          <img src={selectedRequest.documents.selfie} alt="Identity Selfie" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground italic text-xs">No selfie submitted</div>
                        )}
                      </div>
                      <p className="mt-6 text-[10px] text-muted-foreground font-medium text-center leading-relaxed italic">
                        Verify if the person in the selfie matches the identity proof and business records.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-dark border-white/5">
                    <CardHeader className="p-8 border-b border-white/5">
                      <CardTitle className="text-sm font-black uppercase tracking-widest">Entity Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      {[
                        { label: "Entity Name", value: selectedRequest.profiles?.company_name || selectedRequest.profiles?.full_name },
                        { label: "Role", value: selectedRequest.profiles?.role },
                        { label: "Email", value: selectedRequest.profiles?.email },
                        { label: "Submission", value: new Date(selectedRequest.created_at).toLocaleString() },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.label}</span>
                          <span className="text-xs font-black text-white italic">{item.value}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : (
            <Card className="glass-dark border-white/5 overflow-hidden animate-in fade-in duration-500">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black italic tracking-tighter text-white">Compliance Verification</CardTitle>
                  <CardDescription className="text-sm font-bold uppercase tracking-wider text-muted-foreground">ID & Business Entity Approval Queue</CardDescription>
                </div>
                <div className="relative w-full md:w-80 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input className="pl-12 bg-white/5 border-white/10 h-12 font-bold focus:bg-white/10 transition-all" placeholder="Search stakeholders..." />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5 text-left bg-white/[0.01]">
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Entity Identity</th>
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Node Role</th>
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Submission Epoch</th>
                        <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Status</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Governance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {kycQueue.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-8 py-20 text-center">
                            <div className="space-y-4">
                              <ShieldCheck className="w-12 h-12 text-muted-foreground/10 mx-auto" />
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Queue Purged: All Entities Verified</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        kycQueue.map((req) => (
                          <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-8">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/5 flex items-center justify-center font-black text-white text-lg group-hover:border-primary/20 transition-all shadow-inner">
                                  {req.profiles?.company_name?.[0] || req.profiles?.full_name?.[0] || "?"}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-black text-white text-base tracking-tight">{req.profiles?.company_name || req.profiles?.full_name}</span>
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{req.profiles?.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-8">
                              <Badge variant="outline" className="border-white/10 text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-white/[0.02]">{req.profiles?.role}</Badge>
                            </td>
                            <td className="px-8 py-8">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-white/80">{new Date(req.created_at).toLocaleDateString()}</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </td>
                            <td className="px-8 py-8">
                              <Badge className={
                                req.status === "approved" ? "bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]" : 
                                req.status === "pending" ? "bg-primary/10 text-primary border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]" : 
                                "bg-orange-500/10 text-orange-500 border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]"
                              }>
                                {req.status}
                              </Badge>
                            </td>
                            <td className="px-8 py-8 text-right">
                              <Button 
                                size="sm" 
                                className="h-10 px-6 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[9px] border border-white/10 opacity-0 group-hover:opacity-100 transition-all shadow-xl"
                                onClick={() => setSelectedRequest(req)}
                              >
                                Review Dossier
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* --- INVOICES TAB --- */}
        <TabsContent value="invoices" className="focus-visible:outline-none">
          <Card className="glass-dark border-white/5">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black italic tracking-tighter text-white">Asset Monitoring</CardTitle>
                <CardDescription className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Invoice Debt Instruments</CardDescription>
              </div>

            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left bg-white/[0.01]">
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Instrument ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Issuer (MSME)</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Face Value</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Status</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="space-y-4">
                            <Briefcase className="w-12 h-12 text-muted-foreground/10 mx-auto" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No active assets detected in liquidity pool</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => (
                        <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-8 font-black text-white tracking-tight text-lg">#{inv.invoice_number}</td>
                          <td className="px-8 py-8">
                            <span className="font-bold text-white/80">{inv.profiles?.company_name || "Unknown MSME"}</span>
                          </td>
                          <td className="px-8 py-8 font-black text-primary text-lg">{formatCurrency(inv.amount)}</td>
                          <td className="px-8 py-8">
                            <Badge className={
                              inv.status === "funded" ? "bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]" : 
                              inv.status === "active" ? "bg-primary/10 text-primary border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]" : 
                              "bg-white/5 text-muted-foreground border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]"
                            }>
                              {inv.status}
                            </Badge>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- DISPUTES TAB --- */}
        <TabsContent value="disputes" className="focus-visible:outline-none">
          <Card className="glass-dark border-white/5">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-3xl font-black italic tracking-tighter text-white">Conflict Mediation</CardTitle>
              <CardDescription className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Dispute Resolution Protocol for Non-Performance</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left bg-white/[0.01]">
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Conflict ID</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Raised By</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Subject</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Status</th>

                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {disputes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <div className="space-y-4">
                            <Gavel className="w-12 h-12 text-muted-foreground/10 mx-auto" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">Clean Slate: No unresolved conflicts detected</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      disputes.map((dispute) => (
                        <tr key={dispute.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-8 font-black text-white">DIS-{dispute.id.split('-')[0].toUpperCase()}</td>
                          <td className="px-8 py-8">
                            <div className="flex flex-col">
                              <span className="font-bold text-white/80">{dispute.profiles?.full_name}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{dispute.profiles?.email}</span>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white">{dispute.subject}</span>
                              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Inv #{dispute.invoices?.invoice_number}</span>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <Badge className="bg-red-500/10 text-red-500 border-none px-3 py-1 font-black uppercase tracking-widest text-[9px]">
                              {dispute.status}
                            </Badge>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- AUDIT LOGS TAB --- */}
        <TabsContent value="logs" className="focus-visible:outline-none">
          <Card className="glass-dark border-white/5">
            <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
              <CardTitle className="text-3xl font-black italic tracking-tighter text-white">Audit Trail</CardTitle>
              <CardDescription className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Comprehensive Log of Administrative Actions & System Changes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 text-left bg-white/[0.01]">
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Timestamp (UTC)</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Operator</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Action</th>
                      <th className="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Entity Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No operational logs recorded in current epoch</p>
                        </td>
                      </tr>
                    ) : (
                      auditLogs.map((log) => (
                        <tr key={log.id} className="group hover:bg-white/[0.01] transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-white/80">{new Date(log.created_at).toLocaleDateString()}</span>
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-muted-foreground">
                                {log.profiles?.full_name?.[0]}
                              </div>
                              <span className="text-xs font-black text-white">{log.profiles?.full_name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <Badge variant="outline" className="border-white/10 bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-primary/80">
                              {log.action}
                            </Badge>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{log.entity_type} <span className="text-white/40 ml-1">#{log.entity_id?.split('-')[0]}</span></span>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CONFIG TAB --- */}
        <TabsContent value="settings" className="focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <Card className="glass-dark border-white/5 lg:col-span-3">
              <CardHeader className="p-8 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Settings className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-2xl font-black italic">Platform Settings</CardTitle>
                </div>
                <CardDescription>Calibrate core financial engines and operational limits.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Platform Commission (%)</label>
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black">{settings.platform_commission || "1.0"}%</Badge>
                    </div>
                    <div className="flex gap-4">
                      <Input 
                        type="number" 
                        defaultValue={settings.platform_commission}
                        step="0.1"
                        className="bg-white/5 border-white/10 h-12 font-black text-white text-lg focus:bg-white/10 transition-all"
                        onBlur={(e) => handleUpdateSetting('platform_commission', e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider italic">Basis point calculation for liquidity dispersal</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Preclosure Penalty (%)</label>
                      <Badge className="bg-orange-500/10 text-orange-400 border-none text-[10px] font-black">{settings.preclosure_penalty || "2.5"}%</Badge>
                    </div>
                    <Input 
                      type="number" 
                      defaultValue={settings.preclosure_penalty}
                      step="0.1"
                      className="bg-white/5 border-white/10 h-12 font-black text-white text-lg focus:bg-white/10 transition-all"
                      onBlur={(e) => handleUpdateSetting('preclosure_penalty', e.target.value)}
                    />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider italic">Fee applied for early debt liquidation</p>
                  </div>
                </div>
              </CardContent>
            </Card>


          </div>
        </TabsContent>


      </Tabs>
    </div>
  );
}
