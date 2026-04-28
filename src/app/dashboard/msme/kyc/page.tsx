"use client";

import { createClient } from "@/lib/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { 
  ShieldCheck,
  Info
} from "lucide-react";
import { KYCUploadForm } from "@/components/dashboard/kyc-upload-form";
import { useState, useEffect } from "react";

export default function MSMEKycPage() {
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Compliance & KYC</h2>
          <p className="text-muted-foreground">Complete your verification to unlock full platform features.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-sm font-bold border border-emerald-500/20">
          <ShieldCheck className="h-4 w-4" />
          Bank-grade Security Enabled
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-xl">Upload Business Documents</CardTitle>
              <CardDescription>Select a document type and upload a clear digital copy.</CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <KYCUploadForm userId={user.id} />
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-slate-900 text-slate-50">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold">Important Note</p>
                  <p className="text-xs text-slate-400">All documents are stored with AES-256 encryption. Only verified risk officers can access them.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
           <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="text-base">KYC Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>• Documents must be in PDF, JPG, or PNG format.</p>
              <p>• Maximum file size per document is 5MB.</p>
              <p>• Ensure all details are clearly legible.</p>
              <p>• PAN and GSTIN must match the registered business details.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
