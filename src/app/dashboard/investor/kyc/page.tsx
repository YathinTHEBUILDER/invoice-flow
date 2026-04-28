import { createClient } from "@/lib/server";
import { db } from "@/db";
import { users, kycDocuments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  FileText, 
  Upload, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Building2,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { KYCUploadForm } from "@/components/dashboard/kyc-upload-form";

export default async function InvestorKYCPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });

  const documents = await db.query.kycDocuments.findMany({
    where: eq(kycDocuments.userId, user.id),
    orderBy: [desc(kycDocuments.createdAt)],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-500 text-white border-none px-3 py-1 font-bold">VERIFIED</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-3 py-1 font-bold uppercase">PENDING REVIEW</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="px-3 py-1 font-bold">REJECTED</Badge>;
      default:
        return <Badge variant="outline" className="px-3 py-1 font-bold uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Identity Verification</h2>
          <p className="text-muted-foreground mt-1">Institutional-grade KYC compliance for secure investing.</p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(userRecord?.kycStatus || "pending")}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <div className={`h-1.5 w-full ${userRecord?.kycStatus === 'approved' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Compliance Status</CardTitle>
                  <CardDescription>Current standing of your investment profile.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {userRecord?.kycStatus === 'approved' ? (
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-600">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-900">Your profile is fully verified!</p>
                    <p className="text-xs text-emerald-700 font-medium">You have unrestricted access to the invoice marketplace and funding participation.</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-full text-amber-600 animate-pulse">
                    <Clock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-900">Verification in Progress</p>
                    <p className="text-xs text-amber-700 font-medium">Our compliance team is reviewing your documents. This typically takes 12-24 business hours.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Required Documentation</CardTitle>
              <CardDescription>Upload clear copies of the following documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "PAN Card", type: "Identity Proof", icon: User },
                  { name: "Aadhar / Passport", type: "Address Proof", icon: FileText },
                  { name: "Bank Statement", type: "Financial Proof", icon: Building2 },
                  { name: "Cancelled Cheque", type: "Account Verification", icon: CheckCircle2 },
                ].map((doc) => (
                  <div key={doc.name} className="p-4 rounded-xl border border-muted-foreground/10 bg-muted/5 flex items-center gap-4">
                    <div className="p-2 bg-white dark:bg-black/20 rounded-lg shadow-sm">
                      <doc.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{doc.type}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-muted">
                <KYCUploadForm userId={user.id} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-md bg-primary/5 border border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Why KYC?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  "RBI Compliance & Guidelines",
                  "Anti-Money Laundering (AML) Checks",
                  "Secure Fund Transfer Authorization",
                  "Institutional-grade Security"
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-xs font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-primary/5">
                <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                  "As a regulated fintech infrastructure, InvoiceFlow maintains the highest standards of participant verification to protect the integrity of the marketplace."
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Lock className="h-3 w-3" />
                Data Privacy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Your documents are encrypted using AES-256 and stored in secure, private Supabase buckets. Only authorized compliance officers have access for verification purposes.
              </p>
              <div className="mt-4 pt-4 border-t border-muted flex items-center justify-center gap-2 text-[10px] font-bold text-primary">
                <ShieldCheck className="h-3 w-3" /> ISO 27001 COMPLIANT
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
