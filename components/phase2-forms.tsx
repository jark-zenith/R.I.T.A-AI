import {
  createBudget,
  createBusiness,
  createBusinessTransaction,
  createSavingsGoal,
  reconcileTransaction,
} from "@/app/actions/finance";

type Account = { id: string; name: string; currency: string };
type Category = { id: string; name: string; kind: "income" | "expense" };
type Business = { id: string; name: string };

export function Phase2Forms({
  accounts,
  categories,
  businesses,
  unreconciledTransactions,
}: {
  accounts: Account[];
  categories: Category[];
  businesses: Business[];
  unreconciledTransactions: Array<{ id: string; description: string | null; occurred_on: string; amount_minor: number | string }>;
}) {
  const expenseCategories = categories.filter(c => c.kind === "expense");

  return (
    <>
      <section className="grid content" style={{ marginTop: 14 }}>
        <div className="card" id="budgets">
          <div className="section-head"><h2>Create budget</h2><span className="note">Database-backed</span></div>
          {expenseCategories.length === 0 ? <div className="empty"><div><strong>Add an expense category first.</strong><p>Budgets are tied to owned categories.</p></div></div> : (
            <form className="form" action={createBudget}>
              <label>Category<select name="category_id" required>{expenseCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <div className="row">
                <label>Amount (KES)<input name="amount" inputMode="decimal" required /></label>
                <label>Start<input name="period_start" type="date" required /></label>
              </div>
              <label>End<input name="period_end" type="date" required /></label>
              <button className="button" type="submit">Save budget</button>
            </form>
          )}
        </div>

        <div className="card" id="savings">
          <div className="section-head"><h2>Create savings goal</h2><span className="note">Database-backed</span></div>
          <form className="form" action={createSavingsGoal}>
            <label>Name<input name="name" placeholder="Emergency fund" required /></label>
            <div className="row">
              <label>Target (KES)<input name="target" inputMode="decimal" required /></label>
              <label>Current (KES)<input name="current" inputMode="decimal" defaultValue="0" /></label>
            </div>
            <div className="row">
              <label>Monthly (KES)<input name="monthly" inputMode="decimal" defaultValue="0" /></label>
              <label>Target date<input name="target_date" type="date" /></label>
            </div>
            <button className="button" type="submit">Save goal</button>
          </form>
        </div>
      </section>

      <section className="grid content" style={{ marginTop: 14 }}>
        <div className="card">
          <div className="section-head"><h2>Reconciliation</h2><span className="note">Manual review</span></div>
          {unreconciledTransactions.length === 0 ? <div className="empty"><div><strong>Nothing to reconcile.</strong><p>New transactions will appear here until marked reconciled.</p></div></div> : (
            <div style={{ display: "grid", gap: 8 }}>
              {unreconciledTransactions.slice(0, 20).map(tx => (
                <form action={reconcileTransaction} key={tx.id} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: 12, borderRadius: 12 }}>
                  <div><strong>{tx.description || "Transaction"}</strong><div className="note">{tx.occurred_on}</div></div>
                  <button className="button" name="transaction_id" value={tx.id} type="submit">Reconcile</button>
                </form>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-head"><h2>Business profile</h2><span className="note">P&amp;L</span></div>
          <form className="form" action={createBusiness}>
            <label>Business name<input name="name" placeholder="JARK AITech Labs" required /></label>
            <button className="button" type="submit">Add business</button>
          </form>
          {businesses.length > 0 ? <p className="note" style={{ marginTop: 12 }}>{businesses.length} business profile{businesses.length === 1 ? "" : "s"} available.</p> : null}
        </div>

        <div className="card">
          <div className="section-head"><h2>Business transaction</h2><span className="note">P&amp;L input</span></div>
          {businesses.length === 0 ? <div className="empty"><div><strong>Create a business first.</strong><p>Business revenue and costs are kept separate from personal transactions.</p></div></div> : (
            <form className="form" action={createBusinessTransaction}>
              <label>Business<select name="business_id" required>{businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
              <div className="row">
                <label>Type<select name="kind" defaultValue="revenue"><option value="revenue">Revenue</option><option value="direct_cost">Direct cost</option><option value="operating_expense">Operating expense</option></select></label>
                <label>Amount (KES)<input name="amount" inputMode="decimal" required /></label>
              </div>
              <label>Date<input type="date" name="occurred_on" required /></label>
              <label>Description<input name="description" placeholder="Optional note" /></label>
              <button className="button" type="submit">Save business transaction</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
