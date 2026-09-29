"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

type Kind = "income" | "expense";

export function Dashboard({ authenticatedEmail }: { authenticatedEmail: string | null }) {
  const [entries, setEntries] = useState<Array<{ kind: Kind; amountMinor: number }>>([]);
  const [kind, setKind] = useState<Kind>("income");
  const [amount, setAmount] = useState("");

  const totals = useMemo(() => {
    const income = entries.filter(e => e.kind === "income").reduce((s, e) => s + e.amountMinor, 0);
    const expense = entries.filter(e => e.kind === "expense").reduce((s, e) => s + e.amountMinor, 0);
    return { income, expense, net: income - expense };
  }, [entries]);

  function previewEntry() {
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    setEntries(current => [...current, { kind, amountMinor: Math.round(parsed * 100) }]);
    setAmount("");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div className="brand-copy"><strong>R.I.T.A AI</strong><span>Money intelligence</span></div>
        </div>
        <nav className="nav" aria-label="Primary">
          <a className="nav-item active" href="#overview">Overview</a>
          <a className="nav-item" href="#transactions">Transactions</a>
          <a className="nav-item" href="#budgets">Budgets</a>
          <a className="nav-item" href="#savings">Savings</a>
        </nav>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <div className="eyebrow">Revenue intelligence</div>
            <h1>Know where the money is.</h1>
            <p className="subtitle">R.I.T.A turns manually recorded activity into practical financial intelligence. KES is the default currency and external money movement is disabled.</p>
          </div>
          <div className="status">{authenticatedEmail ? "Signed in · " + authenticatedEmail : "MVP shell · persistence not configured"}</div>
        </header>

        <section id="overview" className="grid stats">
          <Metric label="Income" value={formatMoney(totals.income)} />
          <Metric label="Expenses" value={formatMoney(totals.expense)} />
          <Metric label="Net cash flow" value={formatMoney(totals.net)} />
          <Metric label="Transactions" value={String(entries.length)} />
        </section>

        <section className="grid content">
          <div className="card" id="transactions">
            <div className="section-head"><h2>Manual transaction capture</h2><span className="note">Preview mode</span></div>
            <div className="row">
              <label>Type<select value={kind} onChange={e => setKind(e.target.value as Kind)}><option value="income">Income</option><option value="expense">Expense</option></select></label>
              <label>Amount (KES)<input inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} /></label>
            </div>
            <button className="button" style={{ marginTop: 12 }} onClick={previewEntry}>Add preview transaction</button>
            <p className="note" style={{ marginTop: 10 }}>This first commit never pretends that a transaction was saved to the database. Persistence follows after Supabase configuration and RLS validation.</p>
          </div>

          <EmptyCard id="budgets" title="Budgets" text="Define category limits and R.I.T.A will calculate actual spend, remaining headroom, and variance from authenticated records." />
          <EmptyCard id="savings" title="Savings projection" text="Set a target, current balance, and recurring contribution. The calculation engine is deterministic and testable." />

          <div className="card">
            <div className="section-head"><h2>External financial actions</h2><span className="status">Disabled</span></div>
            <div className="empty"><div><strong>R.I.T.A cannot move money in this MVP.</strong><p>Future actions require a separate permission, server-side authorization, idempotency protection, and explicit confirmation immediately before execution.</p></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="card"><div className="card-title"><span>{label}</span><span>R.I.T.A</span></div><div className="metric">{value}</div><div className="kicker">Awaiting user-entered records</div></div>;
}

function EmptyCard({ id, title, text }: { id: string; title: string; text: string }) {
  return <div className="card" id={id}><div className="section-head"><h2>{title}</h2><span className="note">Ready</span></div><div className="empty"><div><strong>No data yet</strong><p>{text}</p></div></div></div>;
}
