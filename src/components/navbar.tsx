import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { createClient } from "@/lib/server";
import { NavAuth } from "@/components/nav-auth";

export async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        <Link href="/" className="transition-opacity hover:opacity-90">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4 md:gap-6">
          <NavAuth initialUser={user} />
        </nav>
      </div>
    </header>
  );
}
