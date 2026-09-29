import { formatMoney } from "@/lib/money";
import { createClient } from "@/lib/supabase/server";
import { SetupForms } from "@/components/finance-forms";
import { signOut } from "@/app/actions/finance";

type Account = { id: string; name: string; account_type: string; currency: string; opening_balance_minor: number | string };
type Category = { id: string; name: string; kind: "income" | "expense" };
type Transaction = {
  id: string;
  kind: "income" | "expense";
  amount_minor: number | string;
  currency: string;
  occurred_on: string;
  description: string | null;
};

function minor(value: number | string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error("Financial amount exceeds the supported display range.");
  return parsed;
}

export async function Dashboard({
  userEmail,
  accounts,
  categories,
  transactions,
  message,
}: {
  userEmail: string;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  message: string;
}) {
  const income = transactions.filter(tx => tx.kind === "income").reduce((sum, tx) => sum + minor(tx.amount_minor), 0);
  const expense = transactions.filter(tx => tx.kind === "expense").reduce((sum, tx) => sum + minor(tx.amount_minor), 0);
  const net = income - expense;
  const totalOpening = accounts.reduce((sum, account) => sum + minor(account.opening_balance_minor), 0);

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
        <form action={signOut} style={{ marginTop: 28 }}>
          <button className="button" type="submit" style={{ width: "100%", background: "#111d25", color: "#edf4f7", border: "1px solid #29404b" }}>Sign out</button>
        </form>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <div className="eyebrow">Revenue intelligence</div>
            <h1>Know where the money is.</h1>
            <p className="subtitle">R.I.T.A records your money exactly as you enter it, then turns that history into practical financial intelligence. KES is the default currency.</p>
          </div>
          <div className="status">Signed in · {userEmail}</div>
        </header>

        {message ? (
          <div className="card" style={{ marginBottom: 14 }} role="status">
            <strong>{message.startsWith("Supabase") ? "Configuration needed" : message.startsWith("transaction") ? "Transaction saved" : message.startsWith("account") ? "Account saved" : message.startsWith("category") ? "Category saved" : "R.I.T.A message"}</strong>
            <div className="note" style={{ marginTop: 4 }}>{message}</div>
          </div>
        ) : null}

        <section id="overview" className="grid stats">
          <Metric label="Recorded income" value={formatMoney(income)} />
          <Metric label="Recorded expenses" value={formatMoney(expense)} />
          <Metric label="Net recorded flow" value={formatMoney(net)} />
          <Metric label="Opening balances" value={formatMoney(totalOpening)} />
        </section>

        <SetupForms accounts={accounts} categories={categories} />

        <section className="card" style={{ marginTop: 14 }}>
          <div className="section-head"><h2>Recent transactions</h2><span className="note">{transactions.length} loaded</span></div>
          {transactions.length === 0 ? (
            <div className="empty"><div><strong>No transactions yet.</strong><p>Record the first real income or expense above. R.I.T.A will use only authenticated records for reports and calculations.</p></div></div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {transactions.map(tx => (
                <div key={tx.id} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: 12, borderRadius: 12 }}>
                  <div>
                    <strong>{tx.description || (tx.kind === "income" ? "Income" : "Expense")}</strong>
                    <div className="note">{tx.occurred_on} · {tx.currency}</div>
                  </div>
                  <strong>{tx.kind === "expense" ? "-" : "+"}{formatMoney(minor(tx.amount_minor), tx.currency)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="grid content" style={{ marginTop: 14 }}>
          <EmptyCard id="budgets" title="Budgets" text="Budget persistence and variance reporting are next in the MVP sequence. No fictional budget values are displayed." />
          <EmptyCard id="savings" title="Savings projection" text="Savings goals will use the deterministic projection engine against your saved target and contribution data." />
          <div className="card">
            <div className="section-head"><h2>External financial actions</h2><span className="status">Disabled</span></div>
            <div className="empty"><div><strong>R.I.T.A cannot move money in this build.</strong><p>Future actions require a separate permission, server-side authorization, idempotency protection and explicit confirmation immediately before execution.</p></div></div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="card"><div className="card-title"><span>{label}</span><span>R.I.T.A</span></div><div className="metric">{value}</div><div className="kicker">Authenticated records only</div></div>;
}

function EmptyCard({ id, title, text }: { id: string; title: string; text: string }) {
  return <div className="card" id={id}><div className="section-head"><h2>{title}</h2><span className="note">Next slice</span></div><div className="empty"><div><strong>Not populated yet</strong><p>{text}</p></div></div></div>;
}
