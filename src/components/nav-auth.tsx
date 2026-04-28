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
      <Button variant="ghost" onClick={handleSignOut} className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Logout
      </Button>
    );
  }

  return (
    <>
      <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        Login
      </Link>
      <Button asChild className="hidden md:inline-flex bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all">
        <Link href="/register">
          Create Account
        </Link>
      </Button>
    </>
  );
}
