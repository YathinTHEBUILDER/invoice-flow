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
  Loader2
} from "lucide-react";
import { uploadInvoiceAction } from "@/app/actions/msme";
import { createClient } from "@/lib/client";
import { formatINR } from "@/lib/format";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
    if (user) {
      const { data } = await supabase
        .from("invoices")
        .select("*")
        .eq("msme_id", user.id)
        .order("created_at", { ascending: false });
      setInvoices(data || []);
    }
    setLoading(false);
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await uploadInvoiceAction(formData);
      if (result.success) {
        toast.success("Invoice submitted for verification");
        setShowUploadModal(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_verification":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black uppercase tracking-widest text-[8px]">Under Review</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[8px]">Approved</Badge>;
      case "funded":
        return <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black uppercase tracking-widest text-[8px]">Funded</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-widest text-[8px]">Rejected</Badge>;
      case "repaid":
        return <Badge variant="outline" className="bg-white/10 text-white border-white/20 font-black uppercase tracking-widest text-[8px]">Repaid</Badge>;
      default:
        return <Badge variant="outline" className="font-black uppercase tracking-widest text-[8px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Invoice Management</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Submit and track your receivables for financing.</p>
        </div>
        <Button 
          onClick={() => setShowUploadModal(true)}
          className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20"
        >
          <Plus className="mr-2 h-5 w-5" /> Submit New Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search by invoice number or buyer..." 
                  className="pl-10 w-[350px] bg-white/5 border-white/10 h-11 font-bold text-xs"
                />
              </div>
              <Button variant="outline" className="h-11 border-white/10 text-white font-black uppercase tracking-widest text-[9px]">
                <Filter className="w-3.5 h-3.5 mr-2" /> Filter
              </Button>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Invoices</p>
              <p className="text-xl font-black text-white">{invoices.length}</p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Retrieving Asset Ledger...</p>
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
                    {invoices.map((invoice) => (
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
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
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
                      placeholder="INV-2024-001"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Invoice Amount (₹)</label>
                    <Input 
                      name="amount" 
                      type="number" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Buyer Name</label>
                    <Input 
                      name="buyer_name" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder="Corporate Client Name"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Buyer GSTIN</label>
                    <Input 
                      name="buyer_gstin" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      placeholder="29AAAAA0000A1Z5"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Due Date</label>
                    <Input 
                      name="due_date" 
                      type="date" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tenure (Days)</label>
                    <Input 
                      name="tenure_days" 
                      type="number" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder="90"
                    />
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
                    onClick={() => setShowUploadModal(false)}
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
                    {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Submit for Verification
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
