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
  Camera,
  X,
  Plus,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getInvestorStats, submitInvestorKYCAction } from "@/app/actions/investor";
import { SelfieCapture } from "@/components/investor/SelfieCapture";
import { toast } from "sonner";

export default function InvestorKYCPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSelfie, setShowSelfie] = useState(false);

  // Form State for Files
  const [documents, setDocuments] = useState<{
    pan: File | null;
    aadhaar: File | null;
    bankProof: File | null;
    addressProof: File | null;
    selfie: Blob | null;
  }>({
    pan: null,
    aadhaar: null,
    bankProof: null,
    addressProof: null,
    selfie: null
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

  const handleSelfieCapture = (blob: Blob) => {
    setDocuments(prev => ({ ...prev, selfie: blob }));
    const url = URL.createObjectURL(blob);
    setPreviews(prev => ({ ...prev, selfie: url }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!documents.pan || !documents.aadhaar || !documents.selfie) {
      toast.error("Compliance Error", {
        description: "PAN Card, Identity Proof, and Face Alignment Capture are mandatory."
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
      if (documents.selfie) formData.append("selfie", documents.selfie, "selfie.jpg");

      const result = await submitInvestorKYCAction(formData);
      if (result.error) throw new Error(result.error);

      toast.success("Compliance Submitted", {
        description: "Your credentials are now under manual vetting by our risk assessment team."
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
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Synchronizing Identity State...</p>
      </div>
    );
  }

  const kycStatus = profile?.kycStatus;

  return (
    <div className="space-y-12 pb-20">
      <div className="max-w-4xl mx-auto text-center space-y-4">
        <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-4 border border-primary/20">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-white italic uppercase">Institutional Compliance</h1>
        <p className="text-muted-foreground font-medium text-lg italic max-w-2xl mx-auto">
          Manual vetting of identity documents and face alignment is required to unlock capital deployment features.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        {kycStatus === 'verified' ? (
          <div className="animate-in fade-in zoom-in duration-700">
            <Card className="glass-dark border-white/5 overflow-hidden text-center p-20 space-y-8">
              <div className="mx-auto w-24 h-24 rounded-[30px] bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <div className="space-y-3">
                <h3 className="text-4xl font-black text-white italic">Identity Authenticated</h3>
                <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                  Your investor credentials have been formally vetted. All capital deployment features and portfolio tools are now fully unlocked.
                </p>
              </div>
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => router.push("/investor")}
                  className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 rounded-2xl"
                >
                  Enter Command Center
                </Button>
              </div>
            </Card>
          </div>
        ) : kycStatus === 'pending' ? (
          <Card className="glass-dark border-white/5 overflow-hidden text-center p-20 space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="mx-auto w-24 h-24 rounded-[30px] bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-2xl shadow-blue-500/10 animate-pulse">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-white italic">Manual Vetting in Progress</h3>
              <p className="text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                Our risk assessment team is manually verifying your documents. This process typically concludes within 24-48 business hours.
              </p>
            </div>
            <div className="pt-4">
              <Badge variant="outline" className="h-10 px-6 rounded-xl border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">
                Verification Phase: Document Audit
              </Badge>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <Card className="glass-dark border-white/5 overflow-hidden">
                  <CardHeader className="p-10 border-b border-white/5">
                    <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">Identity Repositories</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Upload mandatory institutional documentation</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {/* PAN Upload */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
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
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{documents.pan?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Click or Drop File</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Aadhaar Upload */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
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
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{documents.aadhaar?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aadhaar / Passport / DL</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bank Proof */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
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
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{documents.bankProof?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cancelled Cheque / Statement</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Address Proof */}
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
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
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{documents.addressProof?.name.slice(0, 20)}...</span>
                              </div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-muted-foreground" />
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Utility Bill / Rental Agreement</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-dark border-white/5 overflow-hidden">
                  <CardHeader className="p-10 border-b border-white/5">
                    <CardTitle className="text-2xl font-black italic tracking-tighter text-white uppercase">Identity Capture</CardTitle>
                    <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Real-time camera verification</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 flex flex-col items-center justify-center space-y-6">
                    {!previews.selfie ? (
                      <div 
                        onClick={() => setShowSelfie(true)}
                        className="w-full max-w-md aspect-square rounded-[40px] bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center space-y-4 hover:bg-white/[0.08] transition-all cursor-pointer group"
                      >
                        <div className="p-6 rounded-[25px] bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                          <Camera className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black text-white italic uppercase tracking-widest">Initialize Camera</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Live camera photo mandatory</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full max-w-sm aspect-square rounded-[40px] overflow-hidden border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10">
                         <img src={previews.selfie} className="w-full h-full object-cover scale-x-[-1]" />
                         <Button 
                          onClick={() => {
                            setDocuments(prev => ({ ...prev, selfie: null }));
                            setPreviews(prev => ({ ...prev, selfie: "" }));
                          }}
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-4 right-4 rounded-full z-20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <div className="absolute bottom-0 inset-x-0 p-4 bg-emerald-500/90 text-white text-center">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">Photo Captured</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                <Card className="glass-dark border-white/5 overflow-hidden">
                  <CardContent className="p-10 space-y-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-black text-white italic uppercase tracking-widest">Compliance Status</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span>Progress</span>
                        <span>{Object.values(documents).filter(Boolean).length} / 5</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-700" 
                          style={{ width: `${(Object.values(documents).filter(Boolean).length / 5) * 100}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                      By submitting these documents, you authorize InvoiceFlow to perform institutional-grade manual vetting and financial due diligence.
                    </p>

                    <Button 
                      type="submit"
                      disabled={saving}
                      className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 rounded-2xl"
                    >
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                      Submit Documents for Audit
                    </Button>
                  </CardContent>
                </Card>

                <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-[0.2em] mb-2">Institutional Security</Badge>
                  <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                    Every document is encrypted and stored in an isolated vault with zero public ingress. Our physical agents manually verify each claim.
                  </p>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {showSelfie && (
        <SelfieCapture 
          onCapture={handleSelfieCapture} 
          onClose={() => setShowSelfie(false)} 
        />
      )}
    </div>
  );
}
