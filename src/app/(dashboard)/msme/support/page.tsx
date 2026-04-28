"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Gavel, 
  Plus, 
  MessageSquare, 
  History, 
  AlertCircle,
  X,
  Send,
  Loader2,
  ChevronRight,
  LifeBuoy
} from "lucide-react";
import { createSupportTicketAction } from "@/app/actions/msme";
import { createClient } from "@/lib/client";
import { toast } from "sonner";

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
    if (user) {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setTickets(data || []);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await createSupportTicketAction(formData);
      if (result.success) {
        toast.success("Support ticket raised successfully");
        setShowTicketModal(false);
        fetchTickets();
      } else {
        toast.error(result.error || "Failed to raise ticket");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-black uppercase tracking-widest text-[8px]">Open Case</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black uppercase tracking-widest text-[8px]">In Review</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[8px]">Resolved</Badge>;
      default:
        return <Badge variant="outline" className="font-black uppercase tracking-widest text-[8px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Support Desk</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Raise concerns and track dispute resolutions.</p>
        </div>
        <Button 
          onClick={() => setShowTicketModal(true)}
          className="h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20"
        >
          <Plus className="mr-2 h-5 w-5" /> Raise New Ticket
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <History className="w-5 h-5" />
              </div>
              <CardTitle className="text-2xl font-black italic">Recent Tickets</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground font-medium italic mt-1">Audit log of your support interactions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Support History...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-32 space-y-6">
                <div className="mx-auto w-20 h-20 rounded-3xl bg-white/[0.02] flex items-center justify-center border border-white/10">
                  <LifeBuoy className="w-10 h-10 text-white/20" />
                </div>
                <div className="space-y-2">
                  <p className="text-white font-black text-xl italic">No Tickets Found</p>
                  <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">Need help with an invoice or verification? Open a ticket to get assistance.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-8 hover:bg-white/[0.01] transition-all group flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground">
                        <MessageSquare className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-white italic">{ticket.subject}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{ticket.category}</p>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(ticket.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {getStatusBadge(ticket.status)}
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="glass-dark border-white/5 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-black text-white uppercase tracking-widest">Dispute Policy</p>
            </div>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
              Disputes related to invoice payments or verification must be raised within 48 hours of the event. Our legal team reviews all manual disputes within 3-5 business days.
            </p>
            <div className="pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <span>Avg Response Time</span>
                <span className="text-white">~4 Hours</span>
              </div>
            </div>
          </Card>

          <Card className="glass-dark border-white/5 overflow-hidden">
            <CardHeader className="p-8 border-b border-white/5">
              <CardTitle className="text-xl font-black italic">Quick Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {["Invoice Rejection", "Repayment Issues", "KYC Verification", "Disbursement Delay"].map((cat, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 group cursor-pointer hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{cat}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !submitting && setShowTicketModal(false)} />
          <Card className="relative w-full max-w-xl glass-dark border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
            <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black italic">Open Support Ticket</CardTitle>
                <CardDescription className="text-muted-foreground font-medium">Our desk will review your concern manually.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowTicketModal(false)}
                className="hover:bg-white/5"
                disabled={submitting}
              >
                <X className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Subject</label>
                    <Input 
                      name="subject" 
                      required 
                      className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder="Briefly describe the issue"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Category</label>
                      <select 
                        name="category" 
                        required 
                        className="w-full bg-white/5 border border-white/10 h-14 rounded-md px-4 font-bold text-white focus:bg-white/10 transition-all appearance-none outline-none"
                      >
                        <option value="invoice">Invoice Issue</option>
                        <option value="kyc">KYC/Verification</option>
                        <option value="repayment">Repayment/Late Fee</option>
                        <option value="technical">Technical Problem</option>
                        <option value="other">Other Concern</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Priority</label>
                      <select 
                        name="priority" 
                        required 
                        className="w-full bg-white/5 border border-white/10 h-14 rounded-md px-4 font-bold text-white focus:bg-white/10 transition-all appearance-none outline-none"
                      >
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Detailed Message</label>
                    <textarea 
                      name="message" 
                      required 
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-md p-4 font-bold text-white focus:bg-white/10 transition-all outline-none resize-none"
                      placeholder="Please provide all relevant details, including invoice numbers or transaction IDs..."
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="ghost" 
                    onClick={() => setShowTicketModal(false)}
                    className="flex-1 h-14 font-black uppercase tracking-widest text-[10px]"
                    disabled={submitting}
                  >
                    Discard
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-[2] h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Initialize Ticket
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
