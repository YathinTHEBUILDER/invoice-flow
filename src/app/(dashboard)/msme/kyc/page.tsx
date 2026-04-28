"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  Building2, 
  FileCheck, 
  CreditCard, 
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Loader2,
  Info
} from "lucide-react";
import { updateKYCAction } from "@/app/actions/msme";
import { createClient } from "@/lib/client";
import { toast } from "sonner";

export default function KYCPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await updateKYCAction(formData);
      if (result.success) {
        toast.success("Business documents submitted for manual review");
        fetchProfile();
      } else {
        toast.error(result.error || "Failed to submit documents");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const getKYCBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black uppercase tracking-widest text-[10px] px-4 py-1">Manual Review Pending</Badge>;
      case "verified":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[10px] px-4 py-1">Business Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-widest text-[10px] px-4 py-1">Verification Failed</Badge>;
      default:
        return <Badge className="bg-white/5 text-muted-foreground border-white/10 font-black uppercase tracking-widest text-[10px] px-4 py-1">Not Started</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Initializing Compliance Module...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">KYC Verification</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Complete your business profile for platform clearance.</p>
        </div>
        <div>
          {getKYCBadge(profile?.kyc_status)}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {profile?.kyc_status === 'verified' && (
          <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-white italic">Compliance Verified</p>
              <p className="text-xs text-muted-foreground font-medium">Your business is fully cleared for invoice financing operations.</p>
            </div>
          </div>
        )}

        <Card className="glass-dark border-white/5 overflow-hidden">
          <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <CardTitle className="text-2xl font-black italic">Business Credentials</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground font-medium italic mt-1">Provide legal identity and tax information of your entity.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileCheck className="w-3.5 h-3.5 text-primary" />
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">GSTIN (Tax ID)</label>
                  </div>
                  <Input 
                    name="gstin" 
                    defaultValue={profile?.gstin}
                    required 
                    readOnly={profile?.kyc_status === 'verified'}
                    className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                    placeholder="29AAAAA0000A1Z5"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">PAN Number</label>
                  </div>
                  <Input 
                    name="pan" 
                    defaultValue={profile?.pan}
                    required 
                    readOnly={profile?.kyc_status === 'verified'}
                    className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                    placeholder="ABCDE1234F"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Bank Account Number</label>
                  </div>
                  <Input 
                    name="bank_account_no" 
                    defaultValue={profile?.bank_account_no}
                    required 
                    readOnly={profile?.kyc_status === 'verified'}
                    className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                    placeholder="50200012345678"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-3.5 h-3.5 text-primary" />
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">IFSC Code</label>
                  </div>
                  <Input 
                    name="ifsc_code" 
                    defaultValue={profile?.ifsc_code}
                    required 
                    readOnly={profile?.kyc_status === 'verified'}
                    className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                    placeholder="HDFC0001234"
                  />
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Registered Company Address</label>
                  </div>
                  <Input 
                    name="company_address" 
                    defaultValue={profile?.company_address}
                    required 
                    readOnly={profile?.kyc_status === 'verified'}
                    className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                    placeholder="Plot No. 42, Industrial Area, Bangalore, Karnataka - 560001"
                  />
                </div>
              </div>

              {profile?.kyc_status !== 'verified' && (
                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-black text-white italic">Document Verification Required</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                    All business information provided will be manually cross-verified by the InvoiceFlow risk team. Please ensure details match exactly with your official government documents to avoid rejection.
                  </p>
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20"
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                    Submit Business Profile for Review
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl bg-blue-500/5 border border-blue-500/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest">Manual Process</p>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              No automatic approvals exist on this platform. Every registration is vetted by a physical agent to maintain institutional grade financial security.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-xs font-black text-white uppercase tracking-widest">Support Line</p>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              If your KYC is stuck for more than 48 hours, please reach out to our support desk with your registered email and business name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
