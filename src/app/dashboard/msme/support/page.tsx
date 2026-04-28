import { createClient } from "@/lib/server";
import { db } from "@/db";
import { disputes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LifeBuoy, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Plus,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DisputeForm } from "@/components/dashboard/dispute-form";

export default async function MSMESupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const msmeDisputes = await db.query.disputes.findMany({
    where: eq(disputes.userId, user.id),
    orderBy: [desc(disputes.createdAt)],
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Under Review</Badge>;
      case "in_review":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Processing</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Resolved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Support & Resolution</h2>
          <p className="text-muted-foreground mt-1">Raise issues, track disputes, and get help from our operations team.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1.5 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-primary" />
                Raise a New Dispute
              </CardTitle>
              <CardDescription>Describe your issue clearly for faster resolution.</CardDescription>
            </CardHeader>
            <CardContent>
              <DisputeForm userId={user.id} />
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {msmeDisputes.length > 0 ? (
                <div className="space-y-4">
                  {msmeDisputes.map((dispute) => (
                    <div key={dispute.id} className="p-4 rounded-xl border border-muted-foreground/10 bg-muted/5 hover:bg-muted/10 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-base group-hover:text-primary transition-colors">{dispute.title}</h4>
                        {getStatusBadge(dispute.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{dispute.description}</p>
                      <div className="flex items-center justify-between pt-4 border-t border-muted-foreground/5">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Ticket ID: {dispute.id.slice(0, 8)}</span>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-muted-foreground">{new Date(dispute.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <Button variant="ghost" size="sm" className="h-7 text-primary hover:text-primary/80 px-2">
                            View Details <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 border-2 border-dashed rounded-xl">
                  <div className="p-4 bg-muted rounded-full">
                    <LifeBuoy className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <div>
                    <h3 className="font-medium">No open tickets</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">If you have any issues with invoices or payments, our team is here to help.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-md bg-slate-900 text-slate-50">
            <CardHeader>
              <CardTitle className="text-lg">Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs font-bold text-primary uppercase">Direct Support</p>
                <p className="text-sm font-semibold">support@invoiceflowindia.tech</p>
                <p className="text-xs text-slate-400">Response time: &lt; 4 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

