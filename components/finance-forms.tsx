import { createAccount, createCategory, createTransaction } from "@/app/actions/finance";

type Account = { id: string; name: string; account_type: string; currency: string };
type Category = { id: string; name: string; kind: "income" | "expense" };

export function SetupForms({ accounts, categories }: { accounts: Account[]; categories: Category[] }) {
  return (
    <div className="grid content">
      <div className="card">
        <div className="section-head"><h2>Add account</h2><span className="note">Persistent</span></div>
        <form className="form" action={createAccount}>
          <label>Name<input name="name" placeholder="e.g. M-PESA or Cash" required /></label>
          <div className="row">
            <label>Type<select name="account_type" defaultValue="cash">
              <option value="cash">Cash</option><option value="bank">Bank</option><option value="mobile_money">Mobile money</option><option value="other">Other</option>
            </select></label>
            <label>Opening balance (KES)<input name="opening_balance" inputMode="decimal" defaultValue="0" /></label>
          </div>
          <button className="button" type="submit">Save account</button>
        </form>
      </div>

      <div className="card">
        <div className="section-head"><h2>Add category</h2><span className="note">Persistent</span></div>
        <form className="form" action={createCategory}>
          <label>Name<input name="name" placeholder="e.g. Food, Sales, Transport" required /></label>
          <label>Type<select name="kind" defaultValue="expense">
            <option value="expense">Expense</option><option value="income">Income</option>
          </select></label>
          <button className="button" type="submit">Save category</button>
        </form>
      </div>

      <div className="card" id="transactions">
        <div className="section-head"><h2>Record transaction</h2><span className="note">Database-backed</span></div>
        {accounts.length === 0 ? (
          <div className="empty"><div><strong>Create an account first.</strong><p>R.I.T.A will not save a transaction without an owned account.</p></div></div>
        ) : (
          <form className="form" action={createTransaction}>
            <div className="row">
              <label>Type<select name="kind" defaultValue="expense">
                <option value="expense">Expense</option><option value="income">Income</option>
              </select></label>
              <label>Amount (KES)<input name="amount" inputMode="decimal" placeholder="0.00" required /></label>
            </div>
            <div className="row">
              <label>Account<select name="account_id" defaultValue={accounts[0].id} required>
                {accounts.map(account => <option key={account.id} value={account.id}>{account.name} · {account.currency}</option>)}
              </select></label>
              <label>Category<select name="category_id" defaultValue="">
                <option value="">Uncategorized</option>
                {categories.map(category => <option key={category.id} value={category.id}>{category.name} · {category.kind}</option>)}
              </select></label>
            </div>
            <div className="row">
              <label>Date<input type="date" name="occurred_on" defaultValue={new Date().toISOString().slice(0, 10)} required /></label>
              <label>Description<input name="description" placeholder="Optional note" /></label>
            </div>
            <button className="button" type="submit">Save transaction</button>
          </form>
        )}
      </div>
    </div>
  );
}
