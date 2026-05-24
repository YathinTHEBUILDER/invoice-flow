import { createClient } from "@/lib/server";
import { NavbarClient } from "@/components/landing/navbar-client";

export async function Navbar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;

  return <NavbarClient user={user} />;
}
