"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (password.length < 8 || password !== confirmation) {
    redirect("/reset-password?error=Passwords%20must%20match%20and%20contain%20at%20least%208%20characters");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login?error=Your%20reset%20link%20is%20invalid%20or%20expired");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/reset-password?error=The%20password%20could%20not%20be%20updated.%20Request%20a%20new%20reset%20link.");
  redirect("/dashboard?saved=password");
}
