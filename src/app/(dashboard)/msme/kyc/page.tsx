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
  Camera,
  X,
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

export default function KYCPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  
  const selfieInputRef = useRef<HTMLInputElement>(null);

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

  const handleSelfieChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelfie(file);
      setSelfiePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selfie && profile?.kyc_status !== 'verified') {
      toast.error("Please upload a verification selfie");
      return;
    }

    const missingDocs = REQUIRED_DOCS.filter(doc => !files[doc.id] && profile?.kyc_status !== 'verified');
    if (missingDocs.length > 0 && profile?.kyc_status !== 'verified') {
      toast.error(`Please upload: ${missingDocs.map(d => d.label).join(", ")}`);
      return;
    }

    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) return;

    try {
      const documentUrls: Record<string, string> = {};

      // Upload documents
      for (const [id, file] of Object.entries(files)) {
        const filePath = `${user.id}/${id}_${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("kyc-documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        
        documentUrls[id] = filePath;
      }

      // Upload selfie
      if (selfie) {
        const selfiePath = `${user.id}/selfie_${Date.now()}.jpg`;
        const { error: selfieError } = await supabase.storage
          .from("kyc-documents")
          .upload(selfiePath, selfie);

        if (selfieError) throw selfieError;

        documentUrls["selfie"] = selfiePath;
      }

      const result = await submitKYCAction(formData, documentUrls);
      if (result.success) {
        toast.success("Compliance documents submitted for manual vetting.");
        fetchProfile();
      } else {
        toast.error(result.error || "Submission failed");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred during upload");
    } finally {
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
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-widest text-[10px] px-4 py-1">Submission Locked - Cooldown Active</Badge>;
      }
    }

    switch (status) {
      case "pending":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 font-black uppercase tracking-widest text-[10px] px-4 py-1">Manual Vetting in Progress</Badge>;
      case "verified":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-black uppercase tracking-widest text-[10px] px-4 py-1">Business Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-widest text-[10px] px-4 py-1">Vetting Failed - Resubmission Required</Badge>;
      default:
        return <Badge className="bg-white/5 text-muted-foreground border-white/10 font-black uppercase tracking-widest text-[10px] px-4 py-1">Not Started</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Accessing Compliance Terminal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <h2 className="text-5xl font-black tracking-tighter text-white">Compliance Gateway</h2>
          <p className="text-muted-foreground font-medium text-lg italic">Complete verification to unlock financing operations.</p>
        </div>
        <div>
          {getKYCBadge(profile?.kyc_status)}
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {profile?.kyc_status === 'verified' ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <Card className="glass-dark border-white/5 overflow-hidden text-center p-20 space-y-8">
              <div className="mx-auto w-24 h-24 rounded-[30px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <ShieldCheck className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black text-white italic">Compliance Cleared</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                  Your business entity has been formally vetted and approved. All financing operations, invoice discounting, and liquidity deployment features are now fully unlocked.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={() => router.push("/msme")}
                  className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20"
                >
                  Return to Dashboard
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => router.push("/msme/invoices")}
                  className="h-14 px-10 border-white/10 hover:bg-white/5 text-white font-black uppercase tracking-widest text-[10px]"
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
                   <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3 text-red-500">
                      <AlertTriangle className="w-6 h-6" />
                      <p className="text-xl font-black italic uppercase tracking-tighter text-white">Temporary Lockout Active</p>
                    </div>
                    <div className="pl-9 space-y-2">
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        Due to multiple consecutive KYC rejections, a security cooldown has been applied to your account. 
                        You will be able to resubmit for manual vetting in <span className="text-white font-bold">{
                          (() => {
                            const remaining = 8 * 60 * 60 * 1000 - (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime());
                            const hours = Math.floor(remaining / (1000 * 60 * 60));
                            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                            return `${hours}h ${minutes}m`;
                          })()
                        }</span>.
                      </p>
                      <div className="pt-2">
                        <p className="text-xs text-red-400 font-bold italic">Previous Rejection Reason: {profile.kyc_notes || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20 space-y-2 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3 text-red-500">
                      <AlertTriangle className="w-5 h-5" />
                      <p className="text-sm font-black italic">Rejection Remarks</p>
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
              <Card className="glass-dark border-white/5 overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <FileText className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-2xl font-black italic">Business Repository</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground font-medium italic mt-1">Upload high-resolution scans of mandatory business registrations.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {REQUIRED_DOCS.map((doc) => (
                      <div key={doc.id} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <doc.icon className="w-3.5 h-3.5 text-primary" />
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{doc.label}</label>
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
                              <span className="text-xs font-bold italic truncate px-4">{files[doc.id].name}</span>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Select Document</span>
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
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">GSTIN (Tax ID)</label>
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
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">PAN Number</label>
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
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Bank Account Number</label>
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
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">IFSC Code</label>
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
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Registered Company Address</label>
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

            {/* Right: Selfie & Submit */}
            <div className="space-y-8">
              <Card className="glass-dark border-white/5 overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5 bg-white/[0.01]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Camera className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-black italic">Identity Selfie</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="relative group">
                    <div className="aspect-[3/4] w-full max-w-[240px] mx-auto rounded-[120px/160px] border-4 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center bg-white/[0.02] transition-all group-hover:border-primary/30">
                      {selfiePreview ? (
                        <img src={selfiePreview} alt="Selfie preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center space-y-3 px-6">
                          <Camera className="w-10 h-10 text-white/10 mx-auto" />
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
                            Align face within the frame
                          </p>
                        </div>
                      )}
                    </div>
                    {selfiePreview && profile?.kyc_status !== 'verified' && profile?.kyc_status !== 'pending' && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => { setSelfie(null); setSelfiePreview(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full h-8 w-8 shadow-xl"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="user"
                    ref={selfieInputRef}
                    onChange={handleSelfieChange}
                    className="hidden"
                    disabled={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                  />
                  
                  <Button 
                    type="button"
                    variant="outline"
                    disabled={profile?.kyc_status === 'verified' || profile?.kyc_status === 'pending'}
                    onClick={() => selfieInputRef.current?.click()}
                    className="w-full h-12 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
                  >
                    {selfie ? "Retake Verification Photo" : "Launch Identity Capture"}
                  </Button>

                  <p className="text-[10px] text-muted-foreground font-medium italic text-center leading-relaxed">
                    Ensure your face is clearly visible without glasses or headwear. This image will be used for biometric cross-verification.
                  </p>
                </CardContent>
              </Card>

              <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-black text-white italic">Final Declaration</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                  By submitting, you declare that all documents are authentic and represent your legal entity. Any falsification will result in a permanent platform ban.
                </p>
                
                {profile?.kyc_status !== 'verified' && profile?.kyc_status !== 'pending' ? (
                  <Button 
                    type="submit"
                    disabled={saving || (profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000))}
                    className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20"
                  >
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                    {(profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000)) 
                      ? "Cooldown Active" 
                      : "Submit for Compliance Clearance"}
                  </Button>
                ) : (
                  <div className="h-14 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
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
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] mb-2">Security</Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Documents are encrypted at rest and stored in a secure institutional-grade vault with zero public access.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] mb-2">Manual Process</Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Every profile is vetted by a physical agent. Decisions are typically finalized within 24-48 business hours.
            </p>
          </div>
          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] mb-2">Support</Badge>
            <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
              Encountering issues? Reach out to compliance@invoiceflow.com with your PAN and business name.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
