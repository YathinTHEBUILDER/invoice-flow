import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/server";
import { NavAuth } from "@/components/nav-auth";

export async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex h-24 items-center justify-between px-4 md:px-8">
        <Link href="/" className="transition-all hover:scale-[1.02] active:scale-[0.98]">
          <Logo />
        </Link>
        <nav className="flex items-center gap-6 md:gap-10">
          <div className="hidden md:flex items-center gap-8 text-sm font-black uppercase tracking-widest text-muted-foreground mr-2">
            <Link href="/#how-it-works" className="hover:text-primary transition-colors">
              How it Works
            </Link>
            <Link href="/transparency" className="hover:text-primary transition-colors">
              Transparency
            </Link>
            <Link href="/#investors" className="hover:text-primary transition-colors">
              For Investors
            </Link>
          </div>
          <NavAuth initialUser={user} />
        </nav>
      </div>
    </header>
  );
}
