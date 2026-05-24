"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  FileText, 
  Filter, 
  Upload, 
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Calendar
} from "lucide-react";
import { uploadInvoiceAction, raiseDisputeAction } from "@/app/actions/msme";
import { createClient } from "@/lib/client";
import { formatINR } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [disputing, setDisputing] = useState(false);
  const [formData, setFormData] = useState({
    dueDate: "",
    tenure: ""
  });

  useEffect(() => {
    if (formData.dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [year, month, day] = formData.dueDate.split('-').map(Number);
      const due = new Date(year, month - 1, day);
      due.setHours(0, 0, 0, 0);

      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        toast.warning("Financing typically requires >30 days duration.");
      }
      
      setFormData(prev => ({ ...prev, tenure: Math.max(0, diffDays).toString() }));
    } else {
      setFormData(prev => ({ ...prev, tenure: "" }));
    }
  }, [formData.dueDate]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const [profile, setProfile] = useState<any>(null);

  async function fetchInvoices() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (user) {
      const { data: invoicesData } = await supabase
        .from("invoices")
        .select("*")
        .eq("msme_id", user.id)
        .order("created_at", { ascending: false });
      setInvoices(invoicesData || []);
      setFilteredInvoices(invoicesData || []);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("kyc_status")
        .eq("id", user.id)
        .single();
      setProfile(profileData);
    }
    setLoading(false);
  }

  useEffect(() => {
    let result = invoices;
    
    if (searchQuery) {
      result = result.filter(inv => 
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(inv => inv.status === statusFilter);
    }

    setFilteredInvoices(result);
  }, [searchQuery, statusFilter, invoices]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await uploadInvoiceAction(formData);
      if (result.success) {
        toast.success("Invoice submitted for verification");
        setShowUploadModal(false);
        setFormData({ dueDate: "", tenure: "" });
        fetchInvoices();
      } else {
        toast.error(result.error || "Failed to submit invoice");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setUploading(false);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisputing(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await raiseDisputeAction(formData);
      if (result.success) {
        toast.success("Dispute raised successfully. Admin will review.");
        setSelectedInvoice(null);
        fetchInvoices();
      } else {
        toast.error(result.error || "Failed to raise dispute");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setDisputing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_verification":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black uppercase tracking-widest text-[9px]">Under Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[9px]">Approved</Badge>;
      case "funded":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[9px]">Funded</Badge>;
      case "disbursed":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[9px]">Disbursed</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-widest text-[9px]">Rejected</Badge>;
      case "repaid":
        return <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-black uppercase tracking-widest text-[10px]">Repaid</Badge>;
      default:
        return <Badge variant="outline" className="font-black uppercase tracking-widest text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Invoice Management</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Submit and track your receivables for financing.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => fetchInvoices()}
            variant="outline"
            className="h-14 px-6 border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-xs"
          >
            <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            onClick={() => profile?.kyc_status === 'verified' ? setShowUploadModal(true) : toast.error("KYC Verification Required")}
            disabled={profile?.kyc_status !== 'verified'}
            className="h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 disabled:opacity-50"
          >
            <Plus className="mr-2 h-5 w-5" /> {profile?.kyc_status === 'verified' ? "Submit New Invoice" : "Verification Required"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-[300px] md:w-[350px] bg-white/5 border-white/10 h-11 font-bold text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setStatusFilter("all")}
                  className={`h-11 border-white/10 font-black uppercase tracking-widest text-[10px] px-6 ${statusFilter === 'all' ? 'bg-primary/20 border-primary/40 text-primary' : 'text-white'}`}
                >
                  All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStatusFilter("pending_verification")}
                  className={`h-11 border-white/10 font-black uppercase tracking-widest text-[10px] px-6 ${statusFilter === 'pending_verification' ? 'bg-blue-500/20 border-blue-500/40 text-blue-500' : 'text-white'}`}
                >
                  Review
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setStatusFilter("funded")}
                  className={`h-11 border-white/10 font-black uppercase tracking-widest text-[10px] px-6 ${statusFilter === 'funded' ? 'bg-primary/20 border-primary/40 text-primary' : 'text-white'}`}
                >
                  Funded
                </Button>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Invoices</p>
              <p className="text-xl font-black text-white">{invoices.length}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-32 space-y-6">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                  <FileText className="w-10 h-10 text-white/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black text-xl italic">No Invoices Found</p>
                  <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">Start your financing journey by uploading your first verifiable invoice.</p>
                </div>
                <Button 
                  onClick={() => setShowUploadModal(true)}
                  variant="outline" className="h-12 px-10 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
                >
                  Submit First Invoice
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5">
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Invoice Details</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Buyer Information</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Amount</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Due Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Status</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-white">{invoice.invoice_number}</p>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">Uploaded {new Date(invoice.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="text-sm font-bold text-white">{invoice.buyer_name || "N/A"}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{invoice.buyer_gstin || "No GSTIN"}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-black text-white">{formatINR(invoice.amount)}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-white">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "N/A"}</p>
                        </td>
                        <td className="px-8 py-6">
                          {getStatusBadge(invoice.status)}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedInvoice(invoice)}
                              className="h-9 text-[10px] font-black uppercase text-red-500/80 hover:text-red-500 hover:bg-red-500/10"
                            >
                              Dispute
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                const url = invoice.documents?.invoice_url;
                                if (url) window.open(url, '_blank');
                                else toast.error("Invoice document not available.");
                              }}
                              className="h-9 text-white/60 hover:text-white"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => router.push(`/msme/investments?id=${invoice.id}`)}
                              className="h-9 text-white/60 hover:text-white"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !uploading && setShowUploadModal(false)} />
          <Card className="relative w-full max-w-2xl glass-dark border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black italic">Submit Invoice</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Initialize a financing request with invoice details.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowUploadModal(false)}
                className="hover:bg-white/5"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleUpload} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Invoice Number</label>
                    <Input 
                      name="invoice_number" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Invoice Amount (₹)</label>
                    <Input 
                      name="amount" 
                      type="number" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Buyer Name</label>
                    <Input 
                      name="buyer_name" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Buyer GSTIN</label>
                    <Input 
                      name="buyer_gstin" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      placeholder=""
                    />
                  </div>                   <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Due Date</label>
                    <div className="relative group">
                      <Input 
                        name="due_date" 
                        type="date" 
                        required 
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all pl-12"
                      />
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Duration (Days)</label>
                    <div className="relative group">
                      <Input 
                        name="tenure_days" 
                        type="number" 
                        value={formData.tenure}
                        readOnly
                        className="bg-white/5 border-white/10 h-14 font-bold text-white/50 focus:bg-white/10 transition-all pl-12 cursor-not-allowed"
                        placeholder="Auto-calculated"
                      />
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-hover:text-primary transition-colors" />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Upload Invoice Document (PDF/JPG)</label>
                    <div className="relative group">
                      <Input 
                        name="invoice_file" 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        required 
                        className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all pt-3 cursor-pointer file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/20 text-primary">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    By submitting this invoice, you certify that the details are accurate and represent a valid trade receivable. Fraudulent submissions will lead to platform suspension.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => {
                      setShowUploadModal(false);
                      setFormData({ dueDate: "", tenure: "" });
                    }}
                    className="flex-1 h-14 font-black uppercase tracking-widest text-[10px]"
                    disabled={uploading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit for Verification
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Dispute Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !disputing && setSelectedInvoice(null)} />
          <Card className="relative w-full max-w-lg glass-dark border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-2xl font-black italic">Raise Dispute</CardTitle>
              <CardDescription className="text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Contest Invoice #{selectedInvoice.invoice_number}</CardDescription>
            </CardHeader>
            <form onSubmit={handleRaiseDispute}>
              <CardContent className="p-8 space-y-6">
                <input type="hidden" name="invoice_id" value={selectedInvoice.id} />
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Dispute Subject</label>
                  <Input 
                    name="subject"
                    required
                    placeholder="e.g., Buyer payment already received"
                    className="bg-white/5 border-white/10 h-12 font-bold text-white focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Detailed Message</label>
                  <textarea 
                    name="message"
                    required
                    rows={4}
                    placeholder="Explain the conflict in detail for admin mediation..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-bold text-white text-sm focus:bg-white/10 transition-all resize-none focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-[10px] text-muted-foreground font-medium italic leading-relaxed">
                    Formal disputes will suspend all cash operations on this asset until resolved by an administrator.
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 h-12 font-black uppercase tracking-widest text-[10px] hover:bg-white/5"
                    disabled={disputing}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={disputing}
                    className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-[10px]"
                  >
                    {disputing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initiate Mediation"}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
