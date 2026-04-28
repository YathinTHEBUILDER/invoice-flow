"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  IndianRupee, 
  ShieldAlert, 
  Bell, 
  Settings as SettingsIcon,
  Save,
  Loader2
} from "lucide-react";
import { getPlatformSettings, updateSettingAction } from "@/app/actions/admin";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getPlatformSettings();
        setSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Failed to load platform settings.");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleUpdateSetting = async (key: string, value: any) => {
    setSaving(key);
    try {
      const result = await updateSettingAction({ key, value });
      if (result?.data?.success) {
        setSettings(prev => ({ ...prev, [key]: value }));
        toast.success(`Setting "${key}" updated successfully.`);
      } else {
        toast.error(result?.serverError || "Failed to update setting.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" /> Platform Configuration
        </h1>
        <p className="text-muted-foreground font-medium text-lg">Manage global settings and business logic parameters.</p>
      </div>

      <Card className="glass-dark border-white/5">
        <CardHeader className="border-b border-white/5 p-8">
          <CardTitle className="text-2xl font-black italic">Financial Parameters</CardTitle>
          <CardDescription>Configure core financial ratios and fees.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Platform Commission Fee (%)</label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  step="0.1"
                  value={settings.platform_commission || "1.0"}
                  onChange={(e) => setSettings(prev => ({ ...prev, platform_commission: e.target.value }))}
                  className="bg-white/5 border-white/10 font-black italic text-xl h-14"
                />
                <Button 
                  onClick={() => handleUpdateSetting('platform_commission', settings.platform_commission)}
                  disabled={saving === 'platform_commission'}
                  className="h-14 px-6 font-bold"
                >
                  {saving === 'platform_commission' ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                  Save
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Fixed percentage applied to all invoice values (Official Model).</p>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-white/60 uppercase tracking-widest">Pre-Closure Penalty Fee (%)</label>
              <div className="flex items-center gap-3">
                <Input 
                  type="number"
                  step="0.1"
                  value={settings.preclosure_penalty || "2.5"}
                  onChange={(e) => setSettings(prev => ({ ...prev, preclosure_penalty: e.target.value }))}
                  className="bg-white/5 border-white/10 font-black italic text-xl h-14"
                />
                <Button 
                  onClick={() => handleUpdateSetting('preclosure_penalty', settings.preclosure_penalty)}
                  disabled={saving === 'preclosure_penalty'}
                  className="h-14 px-6 font-bold"
                >
                  {saving === 'preclosure_penalty' ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                  Save
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground italic">Applied on principal amount for early settlements.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-dark border-white/5">
        <CardHeader className="border-b border-white/5 p-8">
          <CardTitle className="text-2xl font-black italic">Platform Governance</CardTitle>
          <CardDescription>Manual oversight and system controls.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex items-center justify-between p-6 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="space-y-1">
              <p className="text-lg font-bold text-white">Manual Verification Protocol</p>
              <p className="text-sm text-muted-foreground italic font-medium">All KYC and Invoice approvals require explicit administrator authorization.</p>
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-bold">
              ENFORCED
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
