import Link from "next/link";
import { redirect } from "next/navigation";
import { getVerifiedUser, createClient } from "@/lib/supabase/server";
import { updateSettings } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SettingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getVerifiedUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");
  const { data } = await supabase.from("profiles").select("display_name,default_currency,report_enabled,report_time,report_timezone").eq("id", user.id).maybeSingle();
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const saved = typeof params.saved === "string" ? params.saved : "";

  return (
    <main className="login-wrap">
      <section className="card login-card">
        <div className="section-head"><div><div className="eyebrow">Account settings</div><h1 style={{ fontSize: 32 }}>Your R.I.T.A profile</h1></div><Link className="button" href="/dashboard">Dashboard</Link></div>
        {error ? <p className="error" role="alert">{error}</p> : null}
        {saved ? <p className="note" role="status">Settings saved.</p> : null}
        <form className="form" action={updateSettings}>
          <label>Display name<input name="display_name" defaultValue={data?.display_name ?? ""} /></label>
          <label>Default currency<input name="default_currency" defaultValue={data?.default_currency ?? "KES"} maxLength={3} /></label>
          <label><span>Evening reports</span><input name="report_enabled" type="checkbox" defaultChecked={data?.report_enabled ?? false} /></label>
          <div className="row">
            <label>Report time<input name="report_time" type="time" defaultValue={data?.report_time ?? "19:00"} /></label>
            <label>Timezone<input name="report_timezone" defaultValue={data?.report_timezone ?? "Africa/Nairobi"} /></label>
          </div>
          <button className="button" type="submit">Save settings</button>
        </form>
        <div className="card" style={{ marginTop: 14, padding: 14 }}>
          <strong>Data controls</strong>
          <p className="note">Your financial export is available from Reports. Correction and deletion controls are being expanded with audit-preserving workflows.</p>
          <p className="note">Never share bank passwords, card PINs, recovery codes, or other authentication secrets with R.I.T.A.</p>
        </div>
      </section>
    </main>
  );
}
