"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function recordReportRun(formData: FormData) {
  const reportType = String(formData.get("report_type") ?? "");
  const periodStart = String(formData.get("period_start") ?? "");
  const periodEnd = String(formData.get("period_end") ?? "");

  if (
    !["daily", "monthly"].includes(reportType) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodStart) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(periodEnd) ||
    periodEnd < periodStart
  ) {
    redirect("/reports?error=Enter%20a%20valid%20report%20period");
  }

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?error=Please%20sign%20in%20again");

  const { data: profile } = await supabase
    .from("profiles")
    .select("report_timezone")
    .eq("id", auth.user.id)
    .maybeSingle();

  const timezone = profile?.report_timezone || "Africa/Nairobi";

  const { error } = await supabase.from("report_runs").upsert({
    owner_id: auth.user.id,
    report_type: reportType,
    period_start: periodStart,
    period_end: periodEnd,
    timezone,
    status: "generated",
  }, { onConflict: "owner_id,report_type,period_start,period_end" });

  if (error) redirect("/reports?error=The%20report%20run%20could%20not%20be%20recorded");
  revalidatePath("/reports");
  redirect("/reports?saved=report");
}
