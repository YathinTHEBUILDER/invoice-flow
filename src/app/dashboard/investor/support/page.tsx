import { createClient } from "@/lib/server";
import { db } from "@/db";
import { disputes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LifeBuoy, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ShieldQuestion,
  ArrowRight,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DisputeForm } from "@/components/dashboard/dispute-form";

export default async function InvestorSupportPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const userDisputes = await db.query.disputes.findMany({
    where: eq(disputes.userId, user.id),
    orderBy: [desc(disputes.createdAt)],
  });

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Support & Resolution</h2>
          <p className="text-muted-foreground mt-1">Raise disputes, report repayment issues, or contact our support team.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="h-1.5 bg-primary w-full" />
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldQuestion className="h-5 w-5 text-primary" />
                Raise a New Dispute
              </CardTitle>
              <CardDescription>Our legal and compliance team will review your case within 24 hours.</CardDescription>
            </CardHeader>
            <CardContent>
              <DisputeForm userId={user.id} />
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Your Recent Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userDisputes.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/20">
                  <p className="text-muted-foreground italic">No active disputes or support tickets found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDisputes.map((dispute) => (
                    <div key={dispute.id} className="p-4 rounded-xl border border-muted-foreground/10 bg-card hover:bg-muted/5 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest">
                          {dispute.type}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {dispute.status === 'open' ? (
                            <Badge className="bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/10 font-bold text-[10px]">IN REVIEW</Badge>
                          ) : (
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/10 font-bold text-[10px]">RESOLVED</Badge>
                          )}
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{dispute.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{dispute.description}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                        <span>CREATED: {new Date(dispute.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase p-0 px-2 group-hover:text-primary transition-colors">
                          View Details <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg">Need Immediate Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-black/20 rounded-xl border border-muted-foreground/5">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <LifeBuoy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Support Email</p>
                    <p className="text-sm font-black">support@invoiceflow.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white dark:bg-black/20 rounded-xl border border-muted-foreground/5">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Priority Helpline</p>
                    <p className="text-sm font-black">+91 800-PLATINUM</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Platform Resources</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" className="justify-start font-bold h-10 border-muted-foreground/10" asChild>
                    <Link href="/faq"><FileText className="mr-2 h-4 w-4" /> Investor FAQ</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="justify-start font-bold h-10 border-muted-foreground/10" asChild>
                    <Link href="/terms"><FileText className="mr-2 h-4 w-4" /> Legal Terms</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Dispute Resolution Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                All disputes are handled according to the Platform Participation Agreement. For repayment delays, penalties are automatically calculated and credited to the investor's ledger upon settlement.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
