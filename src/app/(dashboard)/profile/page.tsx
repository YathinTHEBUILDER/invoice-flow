"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon,
  Mail,
  Building,
  Shield,
  Save,
  Loader2,
  LogOut,
  ArrowRight,
  MapPin,
  CreditCard,
  Landmark
} from "lucide-react";
import { createClient } from "@/lib/client";
import { updateProfileAction } from "@/app/actions/admin";
import { signOutAction } from "@/app/actions/auth";
import { toast } from "sonner";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [gstin, setGstin] = useState("");
  const [pan, setPan] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [role, setRole] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (user) {
        setUser(user);
        
        // Fetch full profile details from the database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setFullName(profile.full_name || "");
          setCompanyName(profile.company_name || "");
          setCompanyAddress(profile.company_address || "");
          setGstin(profile.gstin || "");
          setPan(profile.pan || "");
          setBankAccountNo(profile.bank_account_no || "");
          setIfscCode(profile.ifsc_code || "");
          setRole(profile.role || "");
        } else {
          setFullName(user.user_metadata.full_name || "");
          const r = user.app_metadata?.role || user.user_metadata?.role || "";
          setRole(r);
          const company = user.user_metadata.company_name;
          if (r === 'admin' && !company) {
            setCompanyName("InvoiceFlow");
          } else {
            setCompanyName(company || "");
          }
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const result = await updateProfileAction({ 
        fullName, 
        companyName,
        companyAddress,
        gstin,
        pan,
        bankAccountNo,
        ifscCode
      });
      if (result?.data?.success) {
        toast.success("Profile updated successfully.");
      } else {
        toast.error(result?.serverError || "Failed to update profile.");
      }
    } catch (error) {
      toast.error("An unexpected system exception occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const initials = user?.email?.[0].toUpperCase() || "?";

  return (
    <div className="space-y-12 pb-20">
      {/* Header section with User Identity Card */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent blur-3xl -z-10" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-purple-600 p-1 shadow-2xl shadow-primary/20">
              <div className="h-full w-full rounded-[20px] bg-black flex items-center justify-center text-4xl font-black text-white">
                {initials}
              </div>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter text-white">
                {fullName || user?.email?.split('@')[0]}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black uppercase tracking-widest text-[10px] px-3 py-1">
                  {role}
                </Badge>
                <span className="text-muted-foreground text-sm font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {user?.email}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <form action={signOutAction}>
              <Button 
                variant="destructive" 
                className="h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-500/20"
              >
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Card 1: Identity Management */}
        <Card className="glass-dark border-white/5 overflow-hidden">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserIcon className="w-5 h-5" />
              </div>
              <CardTitle className="text-2xl font-black italic">Identity Management</CardTitle>
            </div>
            <CardDescription>Configure your administrative profile details.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Administrative Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Registered Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input 
                    value={user?.email || ""}
                    disabled
                    className="pl-12 bg-white/5 border-white/5 h-14 font-bold text-white/40 select-none cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Business Entity Details (Only for MSMEs) */}
        {role === "msme" && (
          <Card className="glass-dark border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Building className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-black italic">Business Entity Details</CardTitle>
              </div>
              <CardDescription>Calibrate entity name, GSTIN, and corporate office address.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Affiliated Entity</label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder="Company Name"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">GSTIN</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      placeholder="GSTIN"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Company Office Address</label>
                <div className="relative group">
                  <MapPin className="absolute left-4 top-[22px] w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <textarea 
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg min-h-[90px] font-semibold text-sm text-white focus:bg-white/10 focus:border-primary/50 focus:outline-none transition-all resize-none"
                    placeholder="Enter corporate office address"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 3: Settlement Bank Account (MSME & Investor) */}
        {role !== "admin" && role !== "" && (
          <Card className="glass-dark border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Landmark className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-black italic">Settlement Bank Account</CardTitle>
              </div>
              <CardDescription>Verify your payout destination for withdrawals and repayments.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Bank Account Number</label>
                  <div className="relative group">
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                      placeholder="Bank Account Number"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">IFSC Code</label>
                  <div className="relative group">
                    <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      placeholder="IFSC Code"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card 4: Tax and Compliance Identifiers (MSME & Investor) */}
        {role !== "admin" && role !== "" && (
          <Card className="glass-dark border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-black italic">Tax & Verification Identifiers</CardTitle>
              </div>
              <CardDescription>Configure corporate tax registration codes.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">PAN / Tax ID</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      value={pan}
                      onChange={(e) => setPan(e.target.value)}
                      className="pl-12 bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all uppercase"
                      placeholder="PAN Number"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save/Commit Changes */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleUpdateProfile}
            disabled={saving}
            className="w-full md:w-auto h-12 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Commit Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
