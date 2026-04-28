import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const userId = "146f3e40-11f7-475e-ab9c-77c9953b571c";
  
  const { data: invoices, error: invError } = await supabase
    .from("invoices")
    .select("*")
    .eq("msme_id", userId);

  console.log("Invoices:", invoices?.length, "Error:", invError?.message);

  const { data: repayments, error: repError } = await supabase
    .from("repayments")
    .select("*, invoices!inner(*)")
    .eq("invoices.msme_id", userId);

  console.log("Repayments:", repayments?.length, "Error:", repError?.message);
}

test();
