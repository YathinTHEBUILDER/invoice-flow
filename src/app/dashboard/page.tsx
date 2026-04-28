import { redirect } from "next/navigation";
import { createClient } from "@/lib/server";

export default async function DashboardIndex() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role;

  if (role === "admin") {
    redirect("/dashboard/admin");
  } else if (role === "investor") {
    redirect("/dashboard/investor");
  } else if (role === "msme") {
    redirect("/dashboard/msme");
  }

  // Fallback if role is completely broken
  redirect("/unauthorized");
}
