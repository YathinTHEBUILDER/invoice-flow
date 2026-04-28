import { db } from "@/db";
import { fraudFlags, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ShieldAlert, CheckCircle2, User, FileText } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-3">
            <ShieldAlert className="h-8 w-8" /> Fraud Control Center
          </h2>
          <p className="text-muted-foreground">Monitoring suspicious assets and high-risk platform participants.</p>
        </div>
        <Badge variant="destructive" className="h-6 px-3">
          {flags.length} ACTIVE THREATS
        </Badge>
      </div>

      <div className="grid gap-6">
        {flags.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/20">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold">No active fraud flags</h3>
            <p className="text-muted-foreground">The platform is currently operating within safety parameters.</p>
          </div>
        ) : (
          flags.map((flag) => (
            <Card key={flag.id} className="border-l-4 border-l-destructive shadow-lg shadow-destructive/5">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
                      {flag.entityType === 'user' ? <User className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg uppercase tracking-tight">
                        Flagged {flag.entityType}: {flag.entityId.slice(0, 12)}...
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">Reported by {flag.flaggedByName} on {new Date(flag.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <Badge className={`${
                    flag.severity === 'critical' ? 'bg-destructive' :
                    flag.severity === 'high' ? 'bg-orange-600' :
                    'bg-amber-500'
                  } text-white border-none uppercase text-[10px]`}>
                    {flag.severity} RISK
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/10">
                  <p className="text-sm font-medium text-destructive flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5" /> {flag.reason}
                  </p>
                </div>
                
                <div className="flex gap-2 mt-6">
                   <Button size="sm" variant="outline" className="text-xs">Deep Audit Entity</Button>
                   <Button size="sm" variant="destructive" className="text-xs">Force Suspend</Button>
                   <Button size="sm" variant="ghost" className="text-xs text-muted-foreground">Dismiss Flag</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// Minimal button import for the mapping (normally from UI but defining here for speed)
function Button({ children, variant, size, className }: any) {
  return (
    <button className={`px-4 py-2 rounded-md font-medium transition-all ${
      variant === 'outline' ? 'border hover:bg-muted' :
      variant === 'destructive' ? 'bg-destructive text-white hover:bg-destructive/90' :
      variant === 'ghost' ? 'hover:bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
    } ${size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-sm'} ${className}`}>
      {children}
    </button>
  );
}
