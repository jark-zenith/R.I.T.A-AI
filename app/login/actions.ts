"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  };
}

export async function signIn(formData: FormData) {
  const { email, password } = getCredentials(formData);
  if (!email || !password) redirect("/login?error=Enter%20email%20and%20password");

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/");
}

export async function signUp(formData: FormData) {
  const { email, password } = getCredentials(formData);
  if (!email || password.length < 8) {
    redirect("/login?error=Use%20a%20valid%20email%20and%20a%20password%20of%20at%20least%208%20characters");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) redirect("/login?error=" + encodeURIComponent(error.message));
  redirect("/login?message=Account%20created.%20Check%20your%20email%20if%20confirmation%20is%20enabled.");
}
