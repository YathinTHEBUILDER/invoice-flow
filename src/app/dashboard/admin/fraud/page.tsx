import { db } from "@/db";
import { fraudFlags, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShieldAlert, CheckCircle2, User, FileText, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function AdminFraudMonitoring() {
  const flags = await db
    .select({
      id: fraudFlags.id,
      entityType: fraudFlags.entityType,
      entityId: fraudFlags.entityId,
      reason: fraudFlags.reason,
      severity: fraudFlags.severity,
      status: fraudFlags.status,
      createdAt: fraudFlags.createdAt,
      flaggedByName: users.fullName,
    })
    .from(fraudFlags)
    .innerJoin(users, eq(fraudFlags.flaggedBy, users.id))
    .where(eq(fraudFlags.status, "active"))
    .orderBy(desc(fraudFlags.createdAt));

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-3">
            <ShieldAlert className="h-8 w-8" /> Fraud Control Center
          </h2>
          <p className="text-muted-foreground">Monitoring suspicious assets and high-risk platform participants.</p>
        </div>
        <Badge variant="destructive" className="h-8 px-4 font-black tracking-widest border-2 border-destructive shadow-lg shadow-destructive/20">
          {flags.length} ACTIVE THREATS
        </Badge>
      </div>

      <div className="grid gap-6">
        {flags.length === 0 ? (
          <Card className="border-none shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                <ShieldCheck className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold">Platform Safety Integrity: High</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                No active threats or suspicious entities detected. All automated monitoring systems are green.
              </p>
            </CardContent>
          </Card>
        ) : (
          flags.map((flag) => (
            <Card key={flag.id} className="border-l-4 border-l-destructive shadow-lg shadow-destructive/5 overflow-hidden">
              <CardHeader className="pb-2 bg-destructive/[0.02]">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-destructive/10 rounded-xl text-destructive shadow-sm">
                      {flag.entityType === 'user' ? <User className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    <div>
                      <CardTitle className="text-xl uppercase tracking-tight font-black">
                        {flag.entityType} Alert: {flag.entityId.slice(0, 12)}...
                      </CardTitle>
                      <p className="text-xs text-muted-foreground font-medium mt-1">
                        Triggered by <span className="text-foreground font-bold">{flag.flaggedByName}</span> on {new Date(flag.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${
                    flag.severity === 'critical' ? 'bg-destructive' :
                    flag.severity === 'high' ? 'bg-orange-600' :
                    'bg-amber-500'
                  } text-white border-none uppercase px-3 py-1 font-black text-[10px] tracking-widest shadow-md`}>
                    {flag.severity} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="bg-destructive/5 p-5 rounded-2xl border border-destructive/10">
                  <p className="text-sm font-bold text-destructive flex items-start gap-3 leading-relaxed">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /> 
                    {flag.reason}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 pt-2">
                   <Button size="sm" variant="outline" className="font-bold border-muted-foreground/20">
                     <ExternalLink className="mr-2 h-4 w-4" /> Deep Audit Entity
                   </Button>
                   <Button size="sm" variant="destructive" className="font-bold shadow-lg shadow-destructive/20">
                     <ShieldAlert className="mr-2 h-4 w-4" /> Force Suspend
                   </Button>
                   <Button size="sm" variant="ghost" className="font-bold text-muted-foreground">
                     Dismiss Flag
                   </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
