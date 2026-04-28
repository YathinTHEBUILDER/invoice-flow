import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/server";
import { NavAuth } from "@/components/nav-auth";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-24 items-center justify-between px-4 md:px-8">
        <Link href="/" className="transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6 md:gap-10">
          <Link href="#" className="hidden lg:inline-flex text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Platform</Link>
          <Link href="#" className="hidden lg:inline-flex text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Institutional</Link>
          <div className="h-4 w-px bg-white/10 hidden lg:block" />
          <NavAuth initialUser={user} />
        </nav>
      </div>
    </header>
  );
}
