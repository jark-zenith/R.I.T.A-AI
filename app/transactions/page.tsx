import Link from "next/link";
import { redirect } from "next/navigation";
import { getVerifiedUser, createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TransactionsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getVerifiedUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : "";
  const currency = typeof params.currency === "string" ? params.currency.toUpperCase() : "";
  const kind = typeof params.kind === "string" && (params.kind === "income" || params.kind === "expense") ? params.kind : "";
  let query = supabase.from("transactions").select("id,kind,amount_minor,currency,occurred_on,description,reconciled_at").order("occurred_on", { ascending: false }).limit(500);
  if (q) query = query.ilike("description", "%" + q + "%");
  if (currency) query = query.eq("currency", currency);
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) redirect("/dashboard?error=Transactions%20could%20not%20be%20loaded");

  const currencies = Array.from(new Set((data ?? []).map(t => t.currency)));
  return (
    <main className="login-wrap">
      <section className="card" style={{ width: "min(1100px, 100%)" }}>
        <div className="section-head"><div><div className="eyebrow">Financial workspace</div><h1>Transactions</h1></div><Link className="button" href="/dashboard">Dashboard</Link></div>
        <form className="form" method="get" style={{ marginTop: 14 }}>
          <div className="row">
            <label>Search description<input name="q" defaultValue={q} placeholder="Food, salary, supplier…" /></label>
            <label>Currency<select name="currency" defaultValue={currency}><option value="">All</option>{currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <label>Type<select name="kind" defaultValue={kind}><option value="">All</option><option value="income">Income</option><option value="expense">Expense</option></select></label>
          </div>
          <button className="button" type="submit">Filter</button>
        </form>
        {(data ?? []).length === 0 ? <div className="empty" style={{ marginTop: 14 }}><div><strong>No matching transactions.</strong><p>Adjust the filters or add a transaction from the dashboard.</p></div></div> : (
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>{(data ?? []).map(tx => <div className="card" key={tx.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: 12 }}><div><strong>{tx.description || (tx.kind === "income" ? "Income" : "Expense")}</strong><div className="note">{tx.occurred_on} · {tx.currency} · {tx.reconciled_at ? "Reconciled" : "Unreconciled"}</div></div><strong>{tx.kind === "expense" ? "-" : "+"}{formatMoney(Number(tx.amount_minor), tx.currency)}</strong></div>)}</div>
        )}
      </section>
    </main>
  );
}
