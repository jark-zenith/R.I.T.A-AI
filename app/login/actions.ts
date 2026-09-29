"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function getCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  };
}

async function appOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const h = await headers();
  const forwardedProto = h.get("x-forwarded-proto") || "https";
  const host = h.get("host");
  if (!host) throw new Error("Application origin is not configured.");
  return forwardedProto + "://" + host;
}

function authError(): never {
  redirect("/login?error=Authentication%20could%20not%20be%20completed.%20Check%20your%20details%20and%20try%20again.");
}

export async function signIn(formData: FormData) {
  const { email, password } = getCredentials(formData);
  if (!email || password.length < 8) redirect("/login?error=Enter%20a%20valid%20email%20and%20password");

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) authError();
  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const { email, password } = getCredentials(formData);
  if (!email || password.length < 8) {
    redirect("/login?error=Use%20a%20valid%20email%20and%20a%20password%20of%20at%20least%208%20characters");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) authError();
  redirect("/login?message=Account%20created.%20Check%20your%20email%20if%20confirmation%20is%20enabled.");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const origin = await appOrigin();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: origin + "/auth/callback?next=/dashboard" },
  });
  if (error || !data.url) authError();
  redirect(data.url);
}

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/login?error=Enter%20your%20email%20address");

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const origin = await appOrigin();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin + "/auth/callback?next=/reset-password",
  });

  redirect("/login?message=If%20an%20account%20exists%2C%20a%20password%20reset%20email%20has%20been%20sent.");
}
