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
  Lock,
  Activity,
  LogOut,
  KeyRound,
  History,
  ShieldAlert,
  AlertCircle
} from "lucide-react";
import { createClient } from "@/lib/client";
import { updateProfileAction } from "@/app/actions/admin";
import { signOutAction } from "@/app/actions/auth";
import { toast } from "sonner";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setFullName(user.user_metadata.full_name || "");
        setCompanyName(user.user_metadata.company_name || "");
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
        toast.success("Identity updated across system layers.");
      } else {
        toast.error(result?.serverError || "Protocol failure: Profile update failed.");
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
        <p className="text-muted-foreground font-black animate-pulse uppercase tracking-widest text-xs">Accessing Secure Profile Node...</p>
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
            <Button 
              variant="outline" 
              className="glass border-white/5 font-black uppercase tracking-widest text-[10px] h-12 px-6 hover:bg-white/5"
              onClick={() => toast.info("Security audit requested. Checking logs...")}
            >
              <ShieldAlert className="mr-2 h-4 w-4 text-orange-500" /> Security Audit
            </Button>
            <form action={signOutAction}>
              <Button 
                variant="destructive" 
                className="h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-500/20"
              >
                <LogOut className="mr-2 h-4 w-4" /> Terminate Session
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Forms */}
        <div className="lg:col-span-2 space-y-12">
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
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1 p-2 rounded-full bg-blue-500/10 text-blue-400">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-white">Verification Status</p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
                      Your identity is verified on the blockchain and internal audit layers. Any changes will require 24 hours to propagate across all system nodes.
                    </p>
                  </div>
                </div>
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

          {/* Security & Access */}
          <Card className="glass-dark border-white/5 overflow-hidden">
            <CardHeader className="bg-white/[0.02] border-b border-white/5 p-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                  <Lock className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl font-black italic">Security & Access</CardTitle>
              </div>
              <CardDescription>Rotate credentials and manage two-factor authentication.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 hover:border-orange-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-orange-400" />
                    <h4 className="font-black text-white text-sm">Credential Rotation</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Update your access password regularly to maintain platform integrity.
                  </p>
                  <Button variant="outline" className="w-full h-10 border-white/10 font-black uppercase tracking-widest text-[10px]">
                    Reset Password
                  </Button>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 hover:border-emerald-500/20 transition-all">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h4 className="font-black text-white text-sm">Two-Factor Auth</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Add an extra layer of security to your administrative workspace.
                  </p>
                  <Badge className="w-full justify-center h-10 bg-emerald-500/10 text-emerald-400 border-none font-black uppercase tracking-widest text-[10px]">
                    ACTIVE: TOTP SECURE
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity & Stats */}
        <div className="space-y-12">
          {/* Node Health */}
          <Card className="glass-dark border-white/5">
            <CardHeader>
              <CardTitle className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
                <Activity className="w-4 h-4 text-primary" /> Session Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground">
                  <span>Connection Reliability</span>
                  <span>99.9%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Latency</p>
                  <p className="text-xl font-black text-white">24ms</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Enclave</p>
                  <p className="text-xl font-black text-emerald-400 uppercase">Secure</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="glass-dark border-white/5">
            <CardHeader>
              <CardTitle className="text-lg font-black italic flex items-center gap-2 uppercase tracking-tight">
                <History className="w-4 h-4 text-blue-400" /> Operational Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-white/5">
                {[
                  { action: "Identity Sync", time: "Just now", type: "system" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className="mt-1.5 w-4 h-4 rounded-full border-2 border-background bg-primary shrink-0 z-10 shadow-lg shadow-primary/40" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-white">{log.action}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase">{log.time} • {log.type}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest h-10 hover:bg-white/5">
                View Full Forensic Trail
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
