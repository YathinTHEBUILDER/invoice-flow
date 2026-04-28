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
          <NavAuth initialUser={user} />
        </nav>
      </div>
    </header>
  );
}
