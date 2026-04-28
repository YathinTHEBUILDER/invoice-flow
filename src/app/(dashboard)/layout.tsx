import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings, 
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  PieChart,
  Gavel,
  History,
  Mail,
  ChevronRight
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata.role || "investor";
  const initials = user.email?.[0].toUpperCase() || "U";

  const navItems = {
    admin: [
      {
        group: "Control Center",
        items: [
          { label: "Overview", href: "/admin", icon: LayoutDashboard },
        ]
      },
      {
        group: "Market Operations",
        items: [
          { label: "KYC Approvals", href: "/admin?tab=kyc", icon: ShieldCheck },
          { label: "Invoice Review", href: "/admin?tab=invoices", icon: Briefcase },
        ]
      },
      {
        group: "Financials",
        items: [
          { label: "Disputes", href: "/admin?tab=disputes", icon: Gavel },
        ]
      },
      {
        group: "System",
        items: [
          { label: "Audit Logs", href: "/admin?tab=logs", icon: History },
          { label: "Settings", href: "/settings", icon: Settings },
        ]
      }
    ],
    msme: [
      {
        group: "Operations",
        items: [
          { label: "Dashboard", href: "/msme", icon: LayoutDashboard },
          { label: "Invoice Management", href: "/msme/invoices", icon: Briefcase },
          { label: "Funding Requests", href: "/msme/funding", icon: PieChart },
          { label: "Repayments", href: "/msme/repayments", icon: History },
        ]
      },
      {
        group: "Compliance & Support",
        items: [
          { label: "KYC Verification", href: "/msme/kyc", icon: ShieldCheck },
          { label: "Notifications", href: "/msme/notifications", icon: Mail },
          { label: "Support Desk", href: "/msme/support", icon: Gavel },
        ]
      },
      {
        group: "Account",
        items: [
          { label: "My Profile", href: "/profile", icon: UserIcon },
        ]
      }
    ],
    investor: [
      {
        group: "Investments",
        items: [
          { label: "Marketplace", href: "/investor", icon: LayoutDashboard },
          { label: "Portfolio", href: "/investor/portfolio", icon: PieChart },
        ]
      },
      {
        group: "Account",
        items: [
          { label: "Profile", href: "/profile", icon: UserIcon },
          { label: "Settings", href: "/settings", icon: Settings },
        ]
      }
    ]
  };

  const currentNav = navItems[role as keyof typeof navItems] || navItems.investor;

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Premium Sidebar */}
      <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-2xl hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
          {currentNav.map((group, idx) => (
            <div key={idx} className="space-y-3">
              <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                {group.group}
              </h3>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <Link 
                    key={itemIdx}
                    href={item.href}
                    className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold text-muted-foreground hover:text-white hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 group-hover:text-primary transition-colors" />
                      {item.label}
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 bg-white/[0.02]">
          <Link 
            href="/profile"
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 transition-all group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate">{user.email?.split('@')[0]}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{role}</p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Header */}
        <header className="h-24 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="md:hidden">
              <Logo />
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span className="text-primary/50">InvoiceFlow</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white capitalize">{role}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/profile">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-white font-black text-xs hover:scale-110 transition-transform">
                {initials}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
