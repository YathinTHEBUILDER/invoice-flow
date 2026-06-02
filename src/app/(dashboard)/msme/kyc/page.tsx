"use client";

import { useState, useEffect, useRef } from "react";
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
  Info,
  FileText,
  UserCheck
} from "lucide-react";
import { submitKYCAction } from "@/app/actions/msme";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const REQUIRED_DOCS = [
  { id: "gst", label: "GST Certificate", icon: FileCheck },
  { id: "pan_card", label: "PAN Card", icon: CreditCard },
  { id: "business_reg", label: "Business Registration", icon: Building2 },
  { id: "bank_proof", label: "Bank Account Proof", icon: CreditCard },
  { id: "identity_proof", label: "Identity Proof (Aadhar/Passport)", icon: UserCheck },
  { id: "address_proof", label: "Address Proof", icon: MapPin },
];

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function KYCPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, [supabase]);

  // Queries
  const { data: profile, isLoading: loading } = useQuery({
    queryKey: ["msme-profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      return data;
    },
    enabled: !!userId,
  });

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setFiles(prev => ({ ...prev, [id]: file }));
      setPreviews(prev => ({ ...prev, [id]: URL.createObjectURL(file) }));
    }
  };

  const kycMutation = useMutation({
    mutationFn: async ({ formData, documentUrls }: { formData: FormData, documentUrls: Record<string, string> }) => {
      return await submitKYCAction(formData, documentUrls);
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Verification documents submitted for manual checking.");
      } else {
        toast.error(result.error || "Submission failed");
      }
      queryClient.invalidateQueries({ queryKey: ["msme-profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["msme-stats", userId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "An unexpected error occurred during upload");
    },
    onSettled: () => {
      setSaving(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const missingDocs = REQUIRED_DOCS.filter(doc => !files[doc.id] && profile?.kyc_status !== 'verified');
    if (missingDocs.length > 0 && profile?.kyc_status !== 'verified') {
      toast.error(`Please upload: ${missingDocs.map(d => d.label).join(", ")}`);
      return;
    }

    setSaving(true);
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!userId) return;

    try {
      const documentUrls: Record<string, string> = {};

      // Upload documents
      for (const [id, file] of Object.entries(files)) {
        const filePath = `${userId}/${id}_${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("kyc-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        documentUrls[id] = filePath;
      }

      kycMutation.mutate({ formData, documentUrls });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred during upload");
      setSaving(false);
    }
  };


  const getKYCBadge = (status: string) => {
    // Check for cooldown first
    if (profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt) {
      const lastRejected = new Date(profile.lastKycRejectedAt).getTime();
      const now = new Date().getTime();
      const cooldownMs = 8 * 60 * 60 * 1000;
      if (now - lastRejected < cooldownMs) {
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-bold uppercase tracking-wider text-[10px] px-4 py-1 rounded-full">Submission Locked - Cooldown Active</Badge>;
      }
    }

    switch (status) {
      case "pending":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-bold uppercase tracking-wider text-[10px] px-4 py-1 rounded-full">Manual Checking in Progress</Badge>;
      case "verified":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-bold uppercase tracking-wider text-[10px] px-4 py-1 rounded-full">Business Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-bold uppercase tracking-wider text-[10px] px-4 py-1 rounded-full">Checking Failed - Resubmission Required</Badge>;
      default:
        return <Badge className="bg-white/5 text-muted-foreground border-white/10 font-bold uppercase tracking-wider text-[10px] px-4 py-1 rounded-full">Not Started</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-white">Verification Gateway</h2>
          <p className="text-muted-foreground font-medium text-sm">Complete verification to unlock financing operations.</p>
        </div>
        <div>
          {getKYCBadge(profile?.kyc_status)}
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {profile?.kyc_status === 'verified' ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <Card className="glass-dark overflow-hidden text-center p-20 space-y-8 rounded-2xl">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">Verification Cleared</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                  Your business entity has been formally checked and approved. All financing operations, invoice financing, and cash investment features are now fully unlocked.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => router.push("/msme")}
                  className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[10px] shadow-2xl shadow-primary/20 rounded-xl"
                >
                  Return to Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push("/msme/invoices")}
                  className="h-14 px-10 border-white/10 hover:bg-white/5 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl"
                >
                  Raise New Funding
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            {profile?.kyc_status === 'rejected' && (
              <div className="space-y-6">
                {(profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000)) ? (
                   <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3 text-red-500">
                      <AlertTriangle className="w-6 h-6" />
                      <p className="text-xl font-bold tracking-tight text-white">Temporary Lockout Active</p>
                    </div>
                    <div className="pl-9 space-y-2">
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        Due to multiple consecutive KYC rejections, a security cooldown has been applied to your account. 
                        You will be able to resubmit for manual checking in <span className="text-white font-bold">{
                          (() => {
                            const remaining = 8 * 60 * 60 * 1000 - (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime());
                            const hours = Math.floor(remaining / (1000 * 60 * 60));
                            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${minutes}m`;
                          })()
                        }</span>.
                      </p>
                      <div className="pt-2">
                        <p className="text-xs text-red-400 font-bold">Previous Rejection Reason: {profile.kyc_notes || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="text-sm font-bold">Rejection Remarks</p>
                    </div>
                    <p className="text-sm text-white font-medium pl-8">{profile.kyc_notes || "No specific reason provided. Please ensure all documents are clear and valid."}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Document Checklist */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="glass-dark overflow-hidden rounded-2xl">
                <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white tracking-tight">Business Repository</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground font-medium mt-1">Upload high-resolution scans of mandatory business registrations.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {REQUIRED_DOCS.map((doc) => (
                      <div key={doc.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <doc.icon className="w-3.5 h-3.5 text-primary" />
                            <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{doc.label}</label>
                          </div>
                          {files[doc.id] && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </div>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileChange(doc.id, e)}
                            className="hidden" 
                            id={`file-${doc.id}`}
                            disabled={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                          />
                          <label 
                            htmlFor={`file-${doc.id}`}
                            className={`flex items-center justify-center gap-3 h-14 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
                              files[doc.id] 
                              ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' 
                              : 'bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            {files[doc.id] ? (
                              <span className="text-xs font-bold truncate px-4">{files[doc.id].name}</span>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Select Document</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <FileCheck className="w-3.5 h-3.5 text-primary" />
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">GSTIN (Tax ID)</label>
                      </div>
                      <Input 
                        name="gstin" 
                        defaultValue={profile?.gstin}
                        required 
                        readOnly={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                        className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">PAN Number</label>
                      </div>
                      <Input 
                        name="pan" 
                        defaultValue={profile?.pan}
                        required 
                        readOnly={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                        className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Bank Account Number</label>
                      </div>
                      <Input 
                        name="bank_account_no" 
                        defaultValue={profile?.bank_account_no}
                        required 
                        readOnly={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                        className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Info className="w-3.5 h-3.5 text-primary" />
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">IFSC Code</label>
                      </div>
                      <Input 
                        name="ifsc_code" 
                        defaultValue={profile?.ifsc_code}
                        required 
                        readOnly={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                        className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Registered Company Address</label>
                      </div>
                      <Input 
                        name="company_address" 
                        defaultValue={profile?.company_address}
                        required 
                        readOnly={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                        className="bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Submission Status & Action */}
            <div className="space-y-8">


              <div className="p-8 rounded-2xl bg-primary/5 border border-primary/10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-bold text-white">Final Declaration</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  By submitting, you declare that all documents are authentic and represent your legal entity. Any falsification will result in a permanent platform ban.
                </p>
                
                {profile?.kyc_status !== 'verified' && profile?.kyc_status !== 'pending' ? (
                  <Button 
                    type="submit"
                    disabled={saving || (profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000))}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-xs shadow-2xl shadow-primary/20 rounded-xl"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />
                        {(profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000)) 
                          ? "Cooldown Active" 
                          : "Submit"}
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="h-14 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {profile?.kyc_status === 'verified' ? "Verification Active" : "Review in Progress"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
        </>
      )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-wider mb-2">Security</Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Documents are encrypted at rest and stored in a secure professional-grade vault with zero public access.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-wider mb-2">Manual Process</Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Every profile is checked by a physical agent. Decisions are typically finalized within 24-48 business hours.
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-wider mb-2">Support</Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Encountering issues? Reach out to compliance@invoiceflow.com with your PAN and business name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
