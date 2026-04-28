"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";

export function NavAuth({ initialUser }: { initialUser: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (event === "SIGNED_OUT") {
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (user) {
    return (
      <Button variant="ghost" onClick={handleSignOut} className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all">
        Logout
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <Link href="/login" className="text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
        Login
      </Link>
      <Button asChild className="hidden md:inline-flex h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:scale-105 active:scale-95">
        <Link href="/register">
          Get Started
        </Link>
      </Button>
    </div>
  );
}
