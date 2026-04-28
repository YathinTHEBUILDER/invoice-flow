import { createClient } from "@/lib/server";
import { db } from "@/db";
import { kycDocuments, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, FileText } from "lucide-react";
import { KycActionButtons } from "./kyc-action-buttons";


export default async function AdminKycPage() {
  const supabase = await createClient();
  
  // Fetch pending KYC documents along with user details
  const pendingDocs = await db
    .select({
      docId: kycDocuments.id,
      docType: kycDocuments.documentType,
      fileUrl: kycDocuments.fileUrl,
      createdAt: kycDocuments.createdAt,
      userId: users.id,
      userFullName: users.fullName,
      userCompany: users.companyName,
    })
    .from(kycDocuments)
    .innerJoin(users, eq(kycDocuments.userId, users.id))
    .where(eq(kycDocuments.status, "pending"));

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">KYC Approvals</h2>
        <p className="text-muted-foreground">Review and manually approve uploaded MSME documents.</p>
      </div>

      <div className="grid gap-4">
        {pendingDocs.length === 0 ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Check className="h-8 w-8 mb-2 opacity-50" />
              <p>No pending KYC documents to review.</p>
            </CardContent>
          </Card>
        ) : (
          pendingDocs.map((doc) => (
            <Card key={doc.docId}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/10 rounded-full text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{doc.userCompany || doc.userFullName}</h3>
                    <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                      {doc.docType.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted on {doc.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                
                <KycActionButtons 
                  docId={doc.docId} 
                  userId={doc.userId} 
                  filePath={doc.fileUrl} 
                />

              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
