import { db } from "@/db";
import { invoices, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { InvoiceApprovalActions } from "./invoice-approval-actions";

export default async function AdminInvoiceVerification() {
  const pendingInvoices = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount,
      dueDate: invoices.dueDate,
      fileUrl: invoices.fileUrl,
      msmeName: users.companyName,
      msmeEmail: users.email,
    })
    .from(invoices)
    .innerJoin(users, eq(invoices.msmeId, users.id))
    .where(eq(invoices.status, "pending_verification"))
    .orderBy(desc(invoices.createdAt));

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Invoice Verification</h2>
        <p className="text-muted-foreground">Review and audit B2B invoices before they go live for funding.</p>
      </div>

      <div className="space-y-4">
        {pendingInvoices.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl">
            <p className="text-muted-foreground italic">No invoices awaiting verification.</p>
          </div>
        ) : (
          pendingInvoices.map((inv) => (
            <Card key={inv.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Invoice #{inv.invoiceNumber}</h3>
                      <p className="text-sm text-muted-foreground">From: {inv.msmeName} ({inv.msmeEmail})</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 mt-6">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Face Value</p>
                      <p className="text-2xl font-bold">₹{parseFloat(inv.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Due Date</p>
                      <p className="text-lg font-semibold">{new Date(inv.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="md:w-72 bg-muted/30 border-l p-6 flex flex-col justify-between gap-4">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/invoices/${inv.fileUrl}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> View Original
                    </a>
                  </Button>

                  
                  <InvoiceApprovalActions invoiceId={inv.id} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
