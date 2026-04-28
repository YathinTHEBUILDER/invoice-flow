import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import { Logo } from "@/components/ui/logo";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  User as UserIcon,
  Bell
} from "lucide-react";

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

  const role = user.user_metadata.role || "investor";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Simple Sidebar for now */}
      <aside className="w-64 border-r border-white/5 bg-background/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="h-24 flex items-center px-8 border-b border-white/5">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <Link 
            href={`/dashboard/${role}`}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
          <Link 
            href="/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
          >
            <UserIcon className="w-5 h-5" />
            Profile
          </Link>
        </nav>

        <div className="p-6 border-t border-white/5">
          <form action={signOutAction}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-400/5 px-4 py-3 h-auto font-bold">
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-24 border-b border-white/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-8">
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest text-muted-foreground">
              {role} Workspace
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black">
              {user.email?.[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
