import { createClient } from "@/lib/server";
import { db } from "@/db";
import { invoices, fundingRequests } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ExternalLink,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default async function MSMEInvoicesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const msmeInvoices = await db.query.invoices.findMany({
    where: eq(invoices.msmeId, user.id),
    orderBy: [desc(invoices.createdAt)],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending_verification":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending Verification</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      case "funded":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Funded</Badge>;
      case "repaid":
        return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">Repaid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage your uploaded invoices and track their verification status.</p>
        </div>
        <Button asChild className="bg-primary shadow-lg shadow-primary/20">
          <Link href="/dashboard/msme/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Upload New Invoice
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {msmeInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice #</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Due Date</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Uploaded On</th>
                      <th className="p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {msmeInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-muted/5 transition-colors group">
                        <td className="p-4">
                          <div className="font-medium flex items-center gap-2 text-sm">
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="p-4 text-sm font-semibold">₹{invoice.amount}</td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(invoice.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4">{getStatusBadge(invoice.status)}</td>
                        <td className="p-4 text-xs text-muted-foreground">
                          {new Date(invoice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <a href={invoice.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                  <ExternalLink className="h-3.5 w-3.5" /> View Document
                                </a>
                              </DropdownMenuItem>
                              {invoice.status === 'approved' && (
                                <DropdownMenuItem>
                                  <Link href={`/dashboard/msme/financing/new?invoiceId=${invoice.id}`} className="flex items-center gap-2 text-primary font-medium">
                                    <ArrowRight className="h-3.5 w-3.5" /> Request Financing
                                  </Link>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-lg font-medium">No Invoices Yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                  Upload your first invoice to begin the financing process.
                </p>
                <Button asChild className="mt-6" variant="outline">
                  <Link href="/dashboard/msme/invoices/new">Upload Now</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
