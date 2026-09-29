"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateSettings(formData: FormData) {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const defaultCurrency = String(formData.get("default_currency") ?? "").trim().toUpperCase();
  const reportEnabled = formData.get("report_enabled") === "on";
  const reportTime = String(formData.get("report_time") ?? "19:00");
  const reportTimezone = String(formData.get("report_timezone") ?? "Africa/Nairobi").trim();

  if (!/^[A-Z]{3}$/.test(defaultCurrency)) redirect("/settings?error=Use%20a%203-letter%20currency%20code");
  if (!/^\d{2}:\d{2}$/.test(reportTime)) redirect("/settings?error=Enter%20a%20valid%20report%20time");
  if (!reportTimezone) redirect("/settings?error=Enter%20a%20timezone");

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?error=Please%20sign%20in%20again");

  const { error } = await supabase.from("profiles").update({
    display_name: displayName || null,
    default_currency: defaultCurrency,
    report_enabled: reportEnabled,
    report_time: reportTime,
    report_timezone: reportTimezone,
    updated_at: new Date().toISOString(),
  }).eq("id", auth.user.id);

  if (error) redirect("/settings?error=Settings%20could%20not%20be%20saved");
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings?saved=settings");
}
