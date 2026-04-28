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
  ArrowRight
} from "lucide-react";
import { createClient } from "@/lib/client";
import { updateProfileAction } from "@/app/actions/admin";
import { signOutAction } from "@/app/actions/auth";
import { toast } from "sonner";
import Link from "next/link";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
      if (user) {
        setUser(user);
        setFullName(user.user_metadata.full_name || "");
        const role = user.user_metadata.role;
        const company = user.user_metadata.company_name;
        if (role === 'admin' && !company) {
          setCompanyName("InvoiceFlow");
        } else {
          setCompanyName(company || "");
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const result = await updateProfileAction({ fullName, companyName });
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
      <div className="flex flex-col items-center justify-center min-h-[600px] space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse text-xs">Loading profile data...</p>
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
                  {user?.user_metadata.role}
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
        {/* Identity Management */}
        <Card className="glass-dark border-white/5 overflow-hidden">
          <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserIcon className="w-5 h-5" />
              </div>
              <CardTitle className="text-2xl font-black italic">Identity Management</CardTitle>
            </div>
            <CardDescription>Configure your administrative profile and platform affiliation.</CardDescription>
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
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Affiliated Entity</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="pl-12 bg-white/5 border-white/10 h-14 font-bold text-white focus:bg-white/10 transition-all"
                    placeholder="Enter company name"
                    readOnly={user?.user_metadata.role === 'admin'}
                  />
                </div>
              </div>
            </div>

            {user?.user_metadata.role === 'admin' && (
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">System Authority Verified</p>
                  <p className="text-xs text-muted-foreground">As a platform administrator, your verification is managed at the system level. No further action required.</p>
                </div>
              </div>
            )}

            {user?.user_metadata.role === 'msme' && (
              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-full bg-primary/20 text-primary">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Business Verification Status</p>
                    <p className="text-xs text-muted-foreground">Manage your GST, PAN, and Bank details for platform clearance.</p>
                  </div>
                </div>
                <Link href="/msme/kyc">
                  <Button variant="outline" className="h-10 px-6 border-primary/20 text-primary hover:bg-primary/5 font-black uppercase tracking-widest text-[9px]">
                    Manage Verification <ArrowRight className="ml-2 w-3 h-3" />
                  </Button>
                </Link>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleUpdateProfile}
                disabled={saving}
                className="w-full md:w-auto h-12 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
              >
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Commit Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
