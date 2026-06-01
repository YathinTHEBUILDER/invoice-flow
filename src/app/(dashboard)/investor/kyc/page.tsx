"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Plus,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getInvestorStats, submitInvestorKYCAction } from "@/app/actions/investor";
import { toast } from "sonner";

export default function InvestorKYCPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State for Files
  const [documents, setDocuments] = useState<{
    pan: File | null;
    aadhaar: File | null;
    bankProof: File | null;
    addressProof: File | null;
  }>({
    pan: null,
    aadhaar: null,
    bankProof: null,
    addressProof: null
  });

  const [previews, setPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const data = await getInvestorStats();
      setProfile(data);
    } catch (error) {
      console.error("Fetch profile error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (type: keyof typeof documents, file: File | null) => {
    if (!file) return;

    // Check file size (10MB limit per file for UX)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File Too Large", {
        description: `${file.name} exceeds the 10MB individual limit.`
      });
      return;
    }
    
    setDocuments(prev => ({ ...prev, [type]: file }));
    
    // Create preview
    const url = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [type]: url }));
  };



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!documents.pan || !documents.aadhaar) {
      toast.error("Verification Error", {
        description: "PAN Card and Identity Proof are mandatory."
      });
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      if (documents.pan) formData.append("pan", documents.pan);
      if (documents.aadhaar) formData.append("aadhaar", documents.aadhaar);
      if (documents.bankProof) formData.append("bank_proof", documents.bankProof);
      if (documents.addressProof) formData.append("address_proof", documents.addressProof);

      const result = await submitInvestorKYCAction(formData);
      if (result.error) throw new Error(result.error);

      toast.success("Verification Submitted", {
        description: "Your credentials are now under manual checking by our risk assessment team."
      });
      fetchProfile();
    } catch (error: any) {
      toast.error("Submission Failed", {
        description: error.message
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const kycStatus = profile?.kycStatus;

  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex p-4 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Professional Verification</h1>
        <p className="text-muted-foreground font-medium text-base max-w-2xl mx-auto">
          Manual checking of identity documents is required to unlock money investment features.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {kycStatus === 'verified' ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <Card className="glass-dark overflow-hidden text-center p-20 space-y-8 rounded-2xl">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white tracking-tight">Identity Authenticated</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                  Your investor credentials have been formally checked. All money investment features and portfolio tools are now fully unlocked.
                </p>
              </div>
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => router.push("/investor")}
                  className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[10px] shadow-2xl shadow-primary/20 rounded-xl"
                >
                  Enter Command Center
                </Button>
              </div>
            </Card>
          </div>
        ) : kycStatus === 'pending' ? (
          <Card className="glass-dark overflow-hidden text-center p-20 space-y-8 animate-in fade-in zoom-in duration-700 rounded-2xl">
            <div className="mx-auto w-24 h-24 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-2xl shadow-blue-500/10 animate-pulse">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white tracking-tight">Manual Checking in Progress</h3>
              <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                Our risk assessment team is manually verifying your documents. This process typically concludes within 24-48 business hours.
              </p>
            </div>
            <div className="pt-4">
              <Badge variant="outline" className="h-10 px-6 rounded-xl border-white/10 text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Verification Phase: Document Audit
              </Badge>
            </div>
          </Card>
        ) : (profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000)) ? (
          <Card className="glass-dark overflow-hidden text-center p-20 space-y-8 animate-in fade-in zoom-in duration-700 rounded-2xl">
            <div className="mx-auto w-24 h-24 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shadow-2xl shadow-red-500/10">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-white tracking-tight">Verification Lockout Active</h3>
              <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                Due to multiple consecutive KYC rejections, your ability to submit credentials has been temporarily restricted for security purposes.
              </p>
              <div className="pt-4 flex flex-col items-center gap-4">
                <div className="px-8 py-3 bg-red-500/5 border border-red-500/20 rounded-xl text-[10px] font-bold uppercase tracking-wider text-red-500">
                  Resubmission Available in: {
                    (() => {
                      const remaining = 8 * 60 * 60 * 1000 - (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime());
                      const hours = Math.floor(remaining / (1000 * 60 * 60));
                      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                      return `${hours}H ${minutes}M`;
                    })()
                  }
                </div>
                <p className="text-xs text-muted-foreground">Previous Rejection Remark: {profile.kycNotes || "N/A"}</p>
              </div>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="glass-dark overflow-hidden rounded-2xl">
                  <CardHeader className="p-10 border-b border-white/5">
                    <CardTitle className="text-2xl font-bold tracking-tight text-white uppercase">Identity Repositories</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upload mandatory investor documentation</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* PAN Upload */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Building2 className="w-3 h-3" /> PAN Card (Required)
                        </label>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileChange('pan', e.target.files?.[0] || null)}
                          />
                          <div className={`h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 ${previews.pan ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/5 group-hover:border-primary/40 group-hover:bg-white/[0.08]'}`}>
                            {previews.pan ? (
                              <div className="flex flex-col items-center">
                                <FileText className="w-8 h-8 text-emerald-500 mb-1" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{documents.pan?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Click or Drop File</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Aadhaar Upload */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <FileCheck className="w-3 h-3" /> Identity Proof (Required)
                        </label>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileChange('aadhaar', e.target.files?.[0] || null)}
                          />
                          <div className={`h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 ${previews.aadhaar ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/5 group-hover:border-primary/40 group-hover:bg-white/[0.08]'}`}>
                            {previews.aadhaar ? (
                              <div className="flex flex-col items-center">
                                <FileText className="w-8 h-8 text-emerald-500 mb-1" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{documents.aadhaar?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Aadhaar / Passport / DL</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bank Proof */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <CreditCard className="w-3 h-3" /> Bank Verification
                        </label>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileChange('bankProof', e.target.files?.[0] || null)}
                          />
                          <div className={`h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 ${previews.bankProof ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/5 group-hover:border-primary/40 group-hover:bg-white/[0.08]'}`}>
                            {previews.bankProof ? (
                              <div className="flex flex-col items-center">
                                <FileText className="w-8 h-8 text-emerald-500 mb-1" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{documents.bankProof?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cancelled Cheque / Statement</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address Proof */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Address Validation
                        </label>
                        <div className="relative group">
                          <input 
                            type="file" 
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => handleFileChange('addressProof', e.target.files?.[0] || null)}
                          />
                          <div className={`h-32 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 ${previews.addressProof ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-white/5 group-hover:border-primary/40 group-hover:bg-white/[0.08]'}`}>
                            {previews.addressProof ? (
                              <div className="flex flex-col items-center">
                                <FileText className="w-8 h-8 text-emerald-500 mb-1" />
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{documents.addressProof?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Utility Bill / Rental Agreement</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>


              </div>

              <div className="space-y-8">
                <Card className="glass-dark border-white/5 overflow-hidden rounded-2xl">
                  <CardContent className="p-10 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">Verification Status</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Progress</span>
                        <span>{Object.values(documents).filter(Boolean).length} / 4</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-700" 
                          style={{ width: `${(Object.values(documents).filter(Boolean).length / 4) * 100}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                      By submitting these documents, you authorize InvoiceFlow to perform professional-grade manual checking and financial due diligence.
                    </p>

                    <Button 
                      type="submit"
                      disabled={saving || (profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000))}
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-[10px] shadow-2xl shadow-primary/20 rounded-xl"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <ShieldCheck className="mr-2 h-5 w-5" />
                          {(profile?.kycRejectionCount >= 2 && profile?.lastKycRejectedAt && (new Date().getTime() - new Date(profile.lastKycRejectedAt).getTime() < 8 * 60 * 60 * 1000)) 
                            ? "Cooldown In Effect" 
                            : "Submit Documents for Audit"}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-wider mb-2">Verified Security</Badge>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                    Every document is encrypted and stored in an isolated vault with zero public ingress. Our physical agents manually verify each claim.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
