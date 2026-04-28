import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { NotificationPanel } from "@/components/dashboard/notification-panel";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;
  const fullName = user.user_metadata?.full_name || user.email;

  const userNotifications = await db.query.notifications.findMany({
    where: eq(notifications.userId, user.id),
    orderBy: [desc(notifications.createdAt)],
    limit: 10,
  });

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">InvoiceFlow</span>
            <span className="hidden md:inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20 uppercase tracking-wider ml-4">
              {role}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationPanel initialNotifications={userNotifications} />
            
            <div className="flex items-center gap-3 pl-4 border-l">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold leading-none">{fullName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-1">{role}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User className="h-5 w-5" />
              </div>
              
              <form action="/auth/signout" method="POST">
                <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-destructive/10 hover:text-destructive h-9 w-9">
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Sign out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10 px-4 md:px-8 py-8">
        
        {/* Role-Specific Sidebar */}
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8 border-r">
            <div className="w-full space-y-1">
              <Link
                href={`/dashboard/${role}`}
                className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-foreground bg-muted"
              >
                Overview
              </Link>
              {role === "msme" && (
                <>
                  <Link href="/dashboard/msme/kyc" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">KYC Verification</Link>
                  <Link href="/dashboard/msme/invoices" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Invoices</Link>
                  <Link href="/dashboard/msme/financing" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Financing Requests</Link>
                  <Link href="/dashboard/msme/repayments" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Repayment Schedule</Link>
                  <Link href="/dashboard/msme/support" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Support & Disputes</Link>
                  <Link href="/dashboard/msme/settings" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Account Settings</Link>
                </>
              )}
              {role === "investor" && (
                <>
                  <Link href="/dashboard/investor/marketplace" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Marketplace</Link>
                  <Link href="/dashboard/investor/portfolio" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">My Portfolio</Link>
                  <Link href="/dashboard/investor/wallet" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Wallet & Ledger</Link>
                </>
              )}
              {role === "admin" && (
                <>
                  <Link href="/dashboard/admin" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Platform Stats</Link>
                  <Link href="/dashboard/admin/users" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">User Management</Link>
                  <Link href="/dashboard/admin/kyc" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">KYC Approvals</Link>
                  <Link href="/dashboard/admin/invoices" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Invoice Verification</Link>
                  <Link href="/dashboard/admin/fraud" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Fraud Monitoring</Link>
                  <Link href="/dashboard/admin/audit" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 hover:bg-muted hover:text-foreground text-sm font-medium text-muted-foreground">Audit Logs</Link>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Dashboard Content */}
        <main className="flex w-full flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
