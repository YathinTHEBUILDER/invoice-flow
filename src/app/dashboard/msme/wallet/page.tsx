import { db } from "@/db";
import { transactions, users } from "@/db/schema";
import { createClient } from "@/lib/server";
import { eq, desc } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Briefcase, 
  History, 
  ShieldCheck, 
  Info,
  CreditCard,
  Building,
  Lock,
  Wallet
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { WalletOperations } from "@/app/dashboard/investor/wallet/wallet-operations"; // Reuse the same component for now

export default async function MSMEWalletPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, user.id)
  });

  const ledger = await db.query.transactions.findMany({
    where: eq(transactions.userId, user.id),
    orderBy: [desc(transactions.createdAt)],
    limit: 20
  });

  return (
    <div className="flex-1 space-y-8 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Center</h2>
          <p className="text-muted-foreground mt-1">Manage your funds and track disbursement history.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
          <ShieldCheck className="h-3.5 w-3.5" />
          Verified Business Account
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-slate-900 text-white border-none shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wallet className="h-32 w-32 rotate-12" />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 opacity-80">
                <Building className="h-4 w-4" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Available Balance</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-8">
              <div className="text-6xl font-black tracking-tighter">
                {formatCurrency(userRecord?.walletBalance || 0)}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Badge className="bg-white/10 hover:bg-white/20 border-none text-white backdrop-blur-md font-bold">
                  Funded Invoices: ₹{userRecord?.walletBalance}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" />
                  Disbursement Ledger
                </CardTitle>
                <CardDescription>History of invoice funding and withdrawals.</CardDescription>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold">LATEST 20 ENTRIES</Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ledger.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/20">
                    <History className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No financial history yet.</p>
                  </div>
                ) : (
                  ledger.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-muted-foreground/10 bg-card hover:bg-muted/5 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-full shadow-sm transition-transform group-hover:scale-110 ${
                          tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-600' : 
                          tx.type === 'repayment' ? 'bg-rose-500/10 text-rose-600' :
                          tx.type === 'withdrawal' ? 'bg-blue-500/10 text-blue-600' :
                          'bg-slate-500/10 text-slate-600'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold capitalize tracking-tight">{tx.type}</p>
                          <p className="text-[10px] text-muted-foreground font-medium">{tx.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-foreground'}`}>
                          {tx.type === 'deposit' ? '+' : '-'} {formatCurrency(tx.amount)}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-bold tabular-nums">
                          {new Date(tx.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-xl shadow-primary/5 bg-muted/30 border border-muted-foreground/5">
            <CardHeader>
              <CardTitle className="text-lg">Withdraw Funds</CardTitle>
              <CardDescription>Transfer your earnings to your linked bank account.</CardDescription>
            </CardHeader>
            <CardContent>
              <WalletOperations />
            </CardContent>
          </Card>

          <Card className="border-none shadow-md overflow-hidden bg-primary/5 border border-primary/10">
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-primary">Settlement Details</h3>
              </div>
              <div className="p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-primary/10 space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Bank Account</p>
                  <p className="text-sm font-black tabular-nums">ICICI BANK •••• 9902</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-emerald-600">
                  <span>KYC VERIFIED</span>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
