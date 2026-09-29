import Link from "next/link";
import { redirect } from "next/navigation";
import { getVerifiedUser, createClient } from "@/lib/supabase/server";
import { expectedClosingBalance, periodSummary, categoryTotalsByCurrency, reconciliationDifference } from "@/lib/finance/reporting";
import { formatMoney } from "@/lib/money";
import { recordReportRun } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function todayNairobi() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getVerifiedUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const params = await searchParams;
  const day = typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayNairobi();
  const firstDay = typeof params.start === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.start) ? params.start : day.slice(0, 7) + "-01";
  const lastDay = typeof params.end === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.end) ? params.end : day;

  const [{ data: accounts }, { data: transactions }, { data: transfers }, { data: snapshots }, { data: reports }] = await Promise.all([
    supabase.from("accounts").select("id,currency,opening_balance_minor"),
    supabase.from("transactions").select("account_id,kind,amount_minor,currency,occurred_on,category_id").order("occurred_on", { ascending: true }).limit(5000),
    supabase.from("transfers").select("from_account_id,to_account_id,amount_minor,currency,fee_minor,occurred_on").order("occurred_on", { ascending: true }).limit(5000),
    supabase.from("daily_snapshots").select("snapshot_date,currency,opening_balance_minor,income_minor,expense_minor,transfer_in_minor,transfer_out_minor,adjustment_minor,reported_closing_balance_minor,note").eq("snapshot_date", day).order("currency", { ascending: true }),
    supabase.from("report_runs").select("report_type,period_start,period_end,generated_at").order("generated_at", { ascending: false }).limit(20),
  ]);

  const tx = (transactions ?? []).map(row => ({ accountId: row.account_id, categoryId: row.category_id, kind: row.kind as "income" | "expense", amountMinor: row.amount_minor, currency: row.currency, occurredOn: row.occurred_on }));
  const dailyTx = tx.filter(row => row.occurredOn === day);
  const monthlyTx = tx.filter(row => row.occurredOn >= firstDay && row.occurredOn <= lastDay);
  const snapshotByCurrency = new Map((snapshots ?? []).map(s => [s.currency, s]));
  const currencies = Array.from(new Set((accounts ?? []).map(a => a.currency).concat(dailyTx.map(t => t.currency))));
  const monthlyByCurrency = currencies.map(currency => ({
    currency,
    summary: periodSummary(monthlyTx.filter(row => row.currency === currency)),
  }));
  const categories = categoryTotalsByCurrency(dailyTx);

  function openingFor(currency: string) {
    let total = (accounts ?? []).filter(a => a.currency === currency).reduce((sum, a) => sum + Number(a.opening_balance_minor), 0);
    for (const row of tx) if (row.currency === currency && row.occurredOn < day) total += row.kind === "income" ? Number(row.amountMinor) : -Number(row.amountMinor);
    for (const row of transfers ?? []) if (row.currency === currency && row.occurred_on < day) total -= Number(row.fee_minor);
    return total;
  }

  const reportRows = currencies.map(currency => {
    const rows = dailyTx.filter(t => t.currency === currency);
    const sum = periodSummary(rows);
    const dailyTransfers = (transfers ?? []).filter(t => t.occurred_on === day && t.currency === currency);
    const transferIn = dailyTransfers.reduce((sum, t) => sum + Number(t.amount_minor), 0);
    const transferOut = dailyTransfers.reduce((sum, t) => sum + Number(t.amount_minor) + Number(t.fee_minor), 0);
    const snap = snapshotByCurrency.get(currency);
    const expected = expectedClosingBalance(openingFor(currency), sum.incomeMinor, sum.expenseMinor, transferIn, transferOut, Number(snap?.adjustment_minor ?? 0));
    const difference = reconciliationDifference(expected, snap?.reported_closing_balance_minor == null ? null : Number(snap.reported_closing_balance_minor));
    return { currency, ...sum, opening: openingFor(currency), expected, difference, reported: snap?.reported_closing_balance_minor ?? null };
  });

  return (
    <main className="login-wrap">
      <section className="card" style={{ width: "min(1100px, 100%)" }}>
        <div className="section-head"><div><div className="eyebrow">Financial reporting</div><h1>Reports</h1></div><Link className="button" href="/dashboard">Dashboard</Link></div>
        <div className="card" style={{ marginTop: 14 }}>
          <form className="form" method="get">
            <div className="row">
              <label>Daily date<input name="date" type="date" defaultValue={day} /></label>
              <label>Monthly start<input name="start" type="date" defaultValue={firstDay} /></label>
              <label>Monthly end<input name="end" type="date" defaultValue={lastDay} /></label>
            </div>
            <button className="button" type="submit">Generate view</button>
          </form>
        </div>

        <section className="grid content" style={{ marginTop: 14 }}>
          {reportRows.map(row => <div className="card" key={row.currency}><div className="section-head"><h2>{row.currency} daily report</h2><span className="status">{row.difference === null ? "No closing check" : row.difference === 0 ? "Reconciled" : "Difference found"}</span></div><div className="row"><ReportMetric title="Opening" value={formatMoney(row.opening, row.currency)} /><ReportMetric title="Income" value={formatMoney(row.incomeMinor, row.currency)} /><ReportMetric title="Expenses" value={formatMoney(row.expenseMinor, row.currency)} /><ReportMetric title="Expected closing" value={formatMoney(row.expected, row.currency)} /></div><p className="note">Amounts above are minor-unit-derived; use the stored currency for interpretation. {row.reported === null ? "No user-reported closing balance was stored." : row.difference === 0 ? "User-reported closing balance matches the calculated expectation." : "The reported closing balance differs by " + formatMoney(Math.abs(row.difference ?? 0), row.currency) + ". Review the snapshot rather than changing historical transactions."}</p></div>)}
        </section>

        <section className="card" style={{ marginTop: 14 }}>
          <div className="section-head"><h2>Monthly period</h2><span className="note">{firstDay} → {lastDay}</span></div>
          {monthlyByCurrency.length === 0 ? <p className="note">No account currency is configured yet.</p> : <div className="grid content">{monthlyByCurrency.map(row => <div className="card" key={row.currency}><div className="section-head"><h2>{row.currency}</h2></div><div className="row"><ReportMetric title="Income" value={formatMoney(row.summary.incomeMinor, row.currency)} /><ReportMetric title="Expenses" value={formatMoney(row.summary.expenseMinor, row.currency)} /><ReportMetric title="Net cash flow" value={formatMoney(row.summary.netMinor, row.currency)} /></div></div>)}</div>}
          <div style={{ marginTop: 12 }}><form action={recordReportRun}><input type="hidden" name="report_type" value="monthly" /><input type="hidden" name="period_start" value={firstDay} /><input type="hidden" name="period_end" value={lastDay} /><button className="button" type="submit">Record monthly report run</button></form></div>
        </section>

        <section className="card" style={{ marginTop: 14 }}><div className="section-head"><h2>Daily report run</h2><span className="note">Timezone: Africa/Nairobi</span></div><form action={recordReportRun}><input type="hidden" name="report_type" value="daily" /><input type="hidden" name="period_start" value={day} /><input type="hidden" name="period_end" value={day} /><button className="button" type="submit">Record daily report run</button></form></section>

        <section className="card" style={{ marginTop: 14 }}><div className="section-head"><h2>Recent report runs</h2><span className="note">{(reports ?? []).length} stored</span></div>{(reports ?? []).length === 0 ? <p className="note">No report runs recorded yet.</p> : <div style={{ display: "grid", gap: 8 }}>{(reports ?? []).map((r, i) => <div className="card" key={i} style={{ padding: 12 }}><strong>{r.report_type}</strong><div className="note">{r.period_start} → {r.period_end} · {r.generated_at}</div></div>)}</div>}</section>

        <section className="card" style={{ marginTop: 14 }}>
          <div className="section-head"><h2>Daily spending categories</h2><span className="note">Currency-scoped</span></div>
          {categories.size === 0 ? <p className="note">No expense records for this date.</p> : <div style={{ display: "grid", gap: 14 }}>{Array.from(categories.entries()).map(([currency, totals]) => {
            const max = Math.max(...Array.from(totals.values()), 1);
            return <div className="card" key={currency} style={{ padding: 14 }}><div className="section-head"><strong>{currency}</strong></div><div style={{ display: "grid", gap: 8 }}>{Array.from(totals.entries()).map(([key, value]) => <div key={key}><div className="section-head" style={{ marginBottom: 5 }}><span>{key === "uncategorized" ? "Uncategorized" : key}</span><span className="note">{formatMoney(value, currency)}</span></div><div style={{ height: 7, borderRadius: 999, background: "#08131a", overflow: "hidden" }}><div style={{ width: (value / max * 100) + "%", height: "100%", background: "var(--accent)" }} /></div></div>)}</div></div>;
          })}</div>}
        </section>
      </section>
    </main>
  );
}

function ReportMetric({ title, value }: { title: string; value: string }) {
  return <div className="card" style={{ padding: 12 }}><div className="note">{title}</div><div className="metric" style={{ fontSize: 20 }}>{value}</div></div>;
}
