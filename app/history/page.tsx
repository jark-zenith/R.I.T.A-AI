import Link from "next/link";
import { redirect } from "next/navigation";
import { getVerifiedUser, createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";

export default async function HistoryPage() {
  const user = await getVerifiedUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const [{ data: snapshots, error: snapshotsError }, { data: revisions, error: revisionsError }] = await Promise.all([
    supabase.from("daily_snapshots").select("snapshot_date,currency,opening_balance_minor,income_minor,expense_minor,transfer_in_minor,transfer_out_minor,adjustment_minor,reported_closing_balance_minor,note").order("snapshot_date", { ascending: false }).limit(100),
    supabase.from("transaction_revisions").select("transaction_id,operation,changed_at").order("changed_at", { ascending: false }).limit(50),
  ]);
  if (snapshotsError || revisionsError) redirect("/dashboard?error=Financial%20history%20could%20not%20be%20loaded");

  return (
    <main className="login-wrap">
      <section className="card" style={{ width: "min(1100px, 100%)" }}>
        <div className="section-head"><div><div className="eyebrow">Persistent memory</div><h1>Financial history</h1></div><Link className="button" href="/dashboard">Dashboard</Link></div>
        <section className="card" style={{ marginTop: 14 }}><div className="section-head"><h2>Daily entries</h2><span className="note">{(snapshots ?? []).length} stored</span></div>{(snapshots ?? []).length === 0 ? <p className="note">No daily snapshots yet.</p> : <div style={{ display: "grid", gap: 8 }}>{(snapshots ?? []).map((s, i) => <div className="card" key={i} style={{ padding: 12 }}><div className="section-head"><strong>{s.snapshot_date}</strong><span className="status">{s.currency}</span></div><div className="note">Opening {formatMoney(Number(s.opening_balance_minor), s.currency)} · Income {formatMoney(Number(s.income_minor), s.currency)} · Expenses {formatMoney(Number(s.expense_minor), s.currency)} · Reported closing {s.reported_closing_balance_minor == null ? "not supplied" : formatMoney(Number(s.reported_closing_balance_minor), s.currency)}</div>{s.note ? <p className="note">{s.note}</p> : null}</div>)}</div>}</section>
        <section className="card" style={{ marginTop: 14 }}><div className="section-head"><h2>Correction history</h2><span className="note">{(revisions ?? []).length} events</span></div>{(revisions ?? []).length === 0 ? <p className="note">No transaction corrections have been recorded.</p> : <div style={{ display: "grid", gap: 8 }}>{(revisions ?? []).map((r, i) => <div className="card" key={i} style={{ padding: 12 }}><strong>{r.operation}</strong><div className="note">Transaction {r.transaction_id} · {r.changed_at}</div></div>)}</div>}</section>
      </section>
    </main>
  );
}
