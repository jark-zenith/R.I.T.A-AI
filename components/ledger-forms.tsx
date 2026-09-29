import { randomUUID } from "crypto";
import { createTransfer, saveDailySnapshot } from "@/app/actions/finance";

type Account = { id: string; name: string; currency: string };

export function LedgerForms({ accounts }: { accounts: Account[] }) {
  const currencies = Array.from(new Set(accounts.map(a => a.currency)));
  return (
    <section className="grid content" style={{ marginTop: 14 }}>
      <div className="card">
        <div className="section-head"><h2>Record transfer</h2><span className="note">No income double-counting</span></div>
        {accounts.length < 2 ? <div className="empty"><div><strong>Add two accounts first.</strong><p>Transfers stay separate from income and expense totals.</p></div></div> : (
          <form className="form" action={createTransfer}>
            <input type="hidden" name="submission_id" value={randomUUID()} />
            <div className="row">
              <label>From<select name="from_account_id" required>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}</select></label>
              <label>To<select name="to_account_id" required>{accounts.map(a => <option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}</select></label>
            </div>
            <div className="row">
              <label>Amount<input name="amount" inputMode="decimal" placeholder="0.00" required /></label>
              <label>Fee<input name="fee" inputMode="decimal" defaultValue="0" /></label>
            </div>
            <div className="row">
              <label>Date<input name="occurred_on" type="date" required /></label>
              <label>Description<input name="description" placeholder="Optional note" /></label>
            </div>
            <button className="button" type="submit">Save transfer</button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="section-head"><h2>Daily financial entry</h2><span className="note">User-submitted snapshot</span></div>
        {currencies.length === 0 ? <div className="empty"><div><strong>Add an account first.</strong><p>The snapshot is recorded against an explicit currency.</p></div></div> : (
          <form className="form" action={saveDailySnapshot}>
            <label>Date<input name="snapshot_date" type="date" required /></label>
            <label>Currency<select name="currency" required>{currencies.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <div className="row">
              <label>Opening balance<input name="opening_balance" inputMode="decimal" required /></label>
              <label>Income<input name="income" inputMode="decimal" defaultValue="0" /></label>
            </div>
            <div className="row">
              <label>Expenses<input name="expense" inputMode="decimal" defaultValue="0" /></label>
              <label>Transfer in<input name="transfer_in" inputMode="decimal" defaultValue="0" /></label>
            </div>
            <div className="row">
              <label>Transfer out<input name="transfer_out" inputMode="decimal" defaultValue="0" /></label>
              <label>Adjustment<input name="adjustment" inputMode="decimal" defaultValue="0" /></label>
            </div>
            <div className="row">
              <label>Reported closing<input name="reported_closing" inputMode="decimal" /></label>
              <label>Note<input name="note" placeholder="Optional context" /></label>
            </div>
            <button className="button" type="submit">Save daily entry</button>
          </form>
        )}
      </div>
    </section>
  );
}
