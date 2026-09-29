import { formatMoney } from "@/lib/money";
import { SetupForms } from "@/components/finance-forms";
import { Phase2Forms } from "@/components/phase2-forms";
import { signOut } from "@/app/actions/finance";
import { summarizeBusinessProfit, summarizePersonalFlow, budgetVariance, savingsGoalStatus } from "@/lib/finance/reports";

type Account = { id: string; name: string; account_type: string; currency: string; opening_balance_minor: number | string };
type Category = { id: string; name: string; kind: "income" | "expense" };
type Transaction = { id: string; kind: "income" | "expense"; amount_minor: number | string; currency: string; occurred_on: string; description: string | null; reconciled_at: string | null; category_id: string | null };
type Budget = { id: string; category_id: string; period_start: string; period_end: string; amount_minor: number | string; currency: string };
type SavingsGoal = { id: string; name: string; target_minor: number | string; current_minor: number | string; monthly_contribution_minor: number | string; target_date: string | null; currency: string };
type Business = { id: string; name: string; currency: string };
type BusinessTransaction = { id: string; business_id: string; kind: "revenue" | "direct_cost" | "operating_expense"; amount_minor: number | string; currency: string; occurred_on: string; description: string | null };

function minor(value: number | string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error("Financial amount exceeds the supported display range.");
  return parsed;
}

function labelForMessage(message: string) {
  const labels: Record<string, string> = {
    transaction: "Transaction saved", account: "Account saved", category: "Category saved",
    budget: "Budget saved", savings: "Savings goal saved", reconciled: "Transaction reconciled",
    business: "Business saved", business_transaction: "Business transaction saved",
  };
  return labels[message] ?? "R.I.T.A message";
}

export async function Dashboard({
  userEmail, accounts, categories, transactions, budgets, savingsGoals, businesses, businessTransactions, message,
}: {
  userEmail: string; accounts: Account[]; categories: Category[]; transactions: Transaction[];
  budgets: Budget[]; savingsGoals: SavingsGoal[]; businesses: Business[]; businessTransactions: BusinessTransaction[];
  message: string;
}) {
  const personal = summarizePersonalFlow(transactions.map(tx => ({ kind: tx.kind, amountMinor: tx.amount_minor })));
  const totalOpening = accounts.reduce((sum, account) => sum + minor(account.opening_balance_minor), 0);
  const reconciledCount = transactions.filter(tx => tx.reconciled_at).length;
  const unreconciled = transactions.filter(tx => !tx.reconciled_at);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark">R</div><div className="brand-copy"><strong>R.I.T.A AI</strong><span>Money intelligence</span></div></div>
        <nav className="nav" aria-label="Primary">
          <a className="nav-item active" href="#overview">Overview</a><a className="nav-item" href="#transactions">Transactions</a>
          <a className="nav-item" href="#budgets">Budgets</a><a className="nav-item" href="#savings">Savings</a>
          <a className="nav-item" href="#business">Business</a><a className="nav-item" href="#reports">Reports</a>
        </nav>
        <form action={signOut} style={{ marginTop: 28 }}><button className="button" type="submit" style={{ width: "100%", background: "#111d25", color: "#edf4f7", border: "1px solid #29404b" }}>Sign out</button></form>
      </aside>

      <main className="main">
        <header className="header">
          <div><div className="eyebrow">Revenue intelligence</div><h1>Know where the money is.</h1><p className="subtitle">R.I.T.A records what you enter, calculates from those records, and keeps external money movement disabled.</p></div>
          <div className="status">Signed in · {userEmail}</div>
        </header>

        {message ? <div className="card" style={{ marginBottom: 14 }} role="status"><strong>{labelForMessage(message)}</strong><div className="note" style={{ marginTop: 4 }}>{message}</div></div> : null}

        <section id="overview" className="grid stats">
          <Metric label="Recorded income" value={formatMoney(personal.incomeMinor)} />
          <Metric label="Recorded expenses" value={formatMoney(personal.expenseMinor)} />
          <Metric label="Net recorded flow" value={formatMoney(personal.netMinor)} />
          <Metric label="Opening balances" value={formatMoney(totalOpening)} />
        </section>

        <SetupForms accounts={accounts} categories={categories} />

        <section className="card" style={{ marginTop: 14 }} id="reports">
          <div className="section-head"><h2>Financial report snapshot</h2><span className="note">Authenticated data</span></div>
          <div className="row">
            <ReportMetric title="Transactions" value={String(transactions.length)} /><ReportMetric title="Reconciled" value={String(reconciledCount)} />
          </div>
          <div style={{ marginTop: 12 }}><a className="button" href="/api/reports/transactions">Export CSV</a><span className="note" style={{ marginLeft: 10 }}>Latest 1,000 transactions</span></div>
          <div className="row" style={{ marginTop: 10 }}>
            <ReportMetric title="Unreconciled" value={String(unreconciled.length)} /><ReportMetric title="Budgets" value={String(budgets.length)} />
          </div>
        </section>

        <section className="card" style={{ marginTop: 14 }} id="transactions">
          <div className="section-head"><h2>Recent transactions</h2><span className="note">{transactions.length} loaded</span></div>
          {transactions.length === 0 ? <div className="empty"><div><strong>No transactions yet.</strong><p>Record the first income or expense above. Only authenticated, RLS-protected records are used in reporting.</p></div></div> : (
            <div style={{ display: "grid", gap: 8 }}>{transactions.map(tx => (
              <div key={tx.id} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", padding: 12, borderRadius: 12 }}>
                <div><strong>{tx.description || (tx.kind === "income" ? "Income" : "Expense")}</strong><div className="note">{tx.occurred_on} · {tx.currency} · {tx.reconciled_at ? "Reconciled" : "Unreconciled"}</div></div>
                <strong>{tx.kind === "expense" ? "-" : "+"}{formatMoney(minor(tx.amount_minor), tx.currency)}</strong>
              </div>
            ))}</div>
          )}
        </section>

        <Phase2Forms accounts={accounts} categories={categories} businesses={businesses} unreconciledTransactions={unreconciled.map(tx => ({ id: tx.id, description: tx.description, occurred_on: tx.occurred_on, amount_minor: tx.amount_minor }))} />

        <section className="card" style={{ marginTop: 14 }} id="budgets">
          <div className="section-head"><h2>Budget monitoring</h2><span className="note">{budgets.length} saved</span></div>
          {budgets.length === 0 ? <div className="empty"><div><strong>No budgets yet.</strong><p>Create a budget above to measure actual spend and variance.</p></div></div> : (
            <div style={{ display: "grid", gap: 8 }}>{budgets.map(budget => {
              const spent = transactions
                .filter(tx => tx.category_id === budget.category_id && tx.kind === "expense" && tx.occurred_on >= budget.period_start && tx.occurred_on <= budget.period_end)
                .reduce((sum, tx) => sum + minor(tx.amount_minor), 0);
              const status = budgetVariance(budget.amount_minor, spent);
              const category = categories.find(c => c.id === budget.category_id)?.name ?? "Category";
              return <div className="card" key={budget.id} style={{ padding: 14 }}><div className="section-head"><h2>{category}</h2><span className="status">{status.varianceMinor >= 0 ? "Within budget" : "Over budget"}</span></div><div className="note">{formatMoney(status.spentMinor, budget.currency)} spent of {formatMoney(status.budgetMinor, budget.currency)} · variance {formatMoney(Math.abs(status.varianceMinor), budget.currency)}</div></div>;
            })}</div>
          )}
        </section>

        <section className="card" style={{ marginTop: 14 }} id="business">
          <div className="section-head"><h2>Business profit &amp; loss</h2><span className="note">{businesses.length} profile{businesses.length === 1 ? "" : "s"}</span></div>
          {businesses.length === 0 ? <div className="empty"><div><strong>No business profile yet.</strong><p>Add a business above to separate revenue and business costs from personal finance.</p></div></div> : (
            <div className="grid content">{businesses.map(business => {
              const summary = summarizeBusinessProfit(businessTransactions.filter(tx => tx.business_id === business.id).map(tx => ({ kind: tx.kind, amountMinor: tx.amount_minor })));
              return <div className="card" key={business.id}><div className="section-head"><h2>{business.name}</h2><span className="status">{business.currency}</span></div><div className="row"><ReportMetric title="Gross profit" value={formatMoney(summary.grossProfitMinor, business.currency)} /><ReportMetric title="Net profit" value={formatMoney(summary.netProfitMinor, business.currency)} /></div><div className="kicker" style={{ marginTop: 10 }}>Net margin {summary.margin.toFixed(1)}% · calculated from recorded business transactions.</div></div>;
            })}</div>
          )}
        </section>

        <section className="card" style={{ marginTop: 14 }} id="savings">
          <div className="section-head"><h2>Savings goals</h2><span className="note">{savingsGoals.length} active</span></div>
          {savingsGoals.length === 0 ? <div className="empty"><div><strong>No savings goals yet.</strong><p>Create a goal above to see deterministic progress and time-to-goal calculations.</p></div></div> : (
            <div style={{ display: "grid", gap: 8 }}>{savingsGoals.map(goal => {
              const status = savingsGoalStatus(goal.current_minor, goal.target_minor, goal.monthly_contribution_minor);
              const progress = status.targetMinor > 0 ? Math.min(100, Math.max(0, status.currentMinor / status.targetMinor * 100)) : 0;
              return <div className="card" key={goal.id} style={{ padding: 14 }}><div className="section-head"><h2>{goal.name}</h2><span className="status">{goal.currency}</span></div><div className="note">Progress {progress.toFixed(1)}% · gap {formatMoney(status.gapMinor, goal.currency)} · {status.monthsToGoal === null ? "set a monthly contribution to project timing" : status.monthsToGoal === 0 ? "goal reached" : status.monthsToGoal + " month(s) at current contribution"}</div><div style={{ height: 8, background: "#08131a", borderRadius: 999, marginTop: 10, overflow: "hidden" }}><div style={{ width: progress + "%", height: "100%", background: "var(--accent)" }} /></div></div>;
            })}</div>
          )}
        </section>

        <section className="card" style={{ marginTop: 14 }}>
          <div className="section-head"><h2>External financial actions</h2><span className="status">Disabled</span></div>
          <div className="empty"><div><strong>R.I.T.A cannot move money.</strong><p>External actions require a separate permission, server-side authorization, idempotency controls, and explicit user confirmation. No execution scope exists.</p></div></div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="card"><div className="card-title"><span>{label}</span><span>R.I.T.A</span></div><div className="metric">{value}</div><div className="kicker">Authenticated records only</div></div>;
}
function ReportMetric({ title, value }: { title: string; value: string }) {
  return <div className="card" style={{ padding: 14 }}><div className="note">{title}</div><div className="metric" style={{ fontSize: 22 }}>{value}</div></div>;
}
