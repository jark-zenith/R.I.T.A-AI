import Link from "next/link";
import { redirect } from "next/navigation";
import { getVerifiedUser, createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/money";
import { updateTransaction, deleteTransaction } from "@/app/actions/finance";
import { ConfirmButton } from "@/components/confirm-button";

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
  const errorMessage = typeof params.error === "string" ? params.error : "";
  const saved = typeof params.saved === "string" ? params.saved : "";

  let query = supabase.from("transactions").select("id,account_id,category_id,kind,amount_minor,currency,occurred_on,description,reconciled_at").order("occurred_on", { ascending: false }).limit(500);
  if (q) query = query.ilike("description", "%" + q + "%");
  if (currency) query = query.eq("currency", currency);
  if (kind) query = query.eq("kind", kind);
  const [{ data, error }, { data: accounts }, { data: categories }] = await Promise.all([
    query,
    supabase.from("accounts").select("id,name,currency").order("name"),
    supabase.from("categories").select("id,name,kind").order("name"),
  ]);
  if (error) redirect("/dashboard?error=Transactions%20could%20not%20be%20loaded");

  return (
    <main className="login-wrap">
      <section className="card" style={{ width: "min(1100px, 100%)" }}>
        <div className="section-head"><div><div className="eyebrow">Financial workspace</div><h1>Transactions</h1></div><Link className="button" href="/dashboard">Dashboard</Link></div>
        {errorMessage ? <p className="error" role="alert">{errorMessage}</p> : null}
        {saved ? <p className="note" role="status">Transaction change saved.</p> : null}

        <form className="form" method="get" style={{ marginTop: 14 }}>
          <div className="row">
            <label>Search description<input name="q" defaultValue={q} placeholder="Food, salary, supplier…" /></label>
            <label>Currency<select name="currency" defaultValue={currency}><option value="">All</option>{Array.from(new Set((data ?? []).map(t => t.currency))).map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <label>Type<select name="kind" defaultValue={kind}><option value="">All</option><option value="income">Income</option><option value="expense">Expense</option></select></label>
          </div>
          <button className="button" type="submit">Filter</button>
        </form>

        {(data ?? []).length === 0 ? <div className="empty" style={{ marginTop: 14 }}><div><strong>No matching transactions.</strong><p>Adjust the filters or add a transaction from the dashboard.</p></div></div> : (
          <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
            {(data ?? []).map(tx => (
              <details className="card" key={tx.id} style={{ padding: 12 }}>
                <summary style={{ cursor: "pointer" }}>
                  <span style={{ display: "inline-flex", width: "calc(100% - 10px)", justifyContent: "space-between", gap: 12 }}>
                    <span><strong>{tx.description || (tx.kind === "income" ? "Income" : "Expense")}</strong><span className="note" style={{ display: "block" }}>{tx.occurred_on} · {tx.currency} · {tx.reconciled_at ? "Reconciled" : "Unreconciled"}</span></span>
                    <strong>{tx.kind === "expense" ? "-" : "+"}{formatMoney(Number(tx.amount_minor), tx.currency)}</strong>
                  </span>
                </summary>
                <form className="form" action={updateTransaction} style={{ marginTop: 12 }}>
                  <input type="hidden" name="transaction_id" value={tx.id} />
                  <div className="row">
                    <label>Type<select name="kind" defaultValue={tx.kind}><option value="expense">Expense</option><option value="income">Income</option></select></label>
                    <label>Amount<input name="amount" inputMode="decimal" defaultValue={(Number(tx.amount_minor) / 100).toFixed(2)} required /></label>
                  </div>
                  <div className="row">
                    <label>Account<select name="account_id" defaultValue={tx.account_id}>{(accounts ?? []).map(a => <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}</select></label>
                    <label>Category<select name="category_id" defaultValue={tx.category_id ?? ""}><option value="">Uncategorized</option>{(categories ?? []).map(c => <option key={c.id} value={c.id}>{c.name} · {c.kind}</option>)}</select></label>
                  </div>
                  <div className="row">
                    <label>Date<input name="occurred_on" type="date" defaultValue={tx.occurred_on} required /></label>
                    <label>Description<input name="description" defaultValue={tx.description ?? ""} /></label>
                  </div>
                  <button className="button" type="submit">Save correction</button>
                </form>
                <form action={deleteTransaction} style={{ marginTop: 8 }}>
                  <input type="hidden" name="transaction_id" value={tx.id} />
                  <ConfirmButton className="button" type="submit" style={{ background: "#3a1b1b", color: "#ffdede", border: "1px solid #643838" }}>Delete transaction</ConfirmButton>
                  <span className="note" style={{ marginLeft: 10 }}>A revision record is retained for audit history.</span>
                </form>
              </details>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
