import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="login-wrap">
      <section className="card login-card">
        <div className="brand">
          <div className="brand-mark">R</div>
          <div className="brand-copy">
            <strong>R.I.T.A AI</strong>
            <span>Revenue Intelligence &amp; Transaction Assistant</span>
          </div>
        </div>
        <div className="eyebrow">Personal &amp; small-business finance</div>
        <h1 style={{ fontSize: 38 }}>Your money, recorded clearly.</h1>
        <p className="subtitle">
          R.I.T.A stores the financial information you provide, calculates from structured records,
          and keeps each user&apos;s workspace private.
        </p>
        <div className="grid content" style={{ marginTop: 18 }}>
          <div className="card"><strong>Private workspace</strong><p className="note">Each account is isolated with server-side authorization and database row-level security.</p></div>
          <div className="card"><strong>Deterministic reports</strong><p className="note">Income, expenses, budgets, savings, reconciliation, and business P&amp;L come from stored records.</p></div>
          <div className="card"><strong>No fabricated balances</strong><p className="note">R.I.T.A never pretends to observe an account unless an authorized integration supplies the data.</p></div>
        </div>
        <div className="row" style={{ marginTop: 18 }}>
          <Link className="button" href="/login">Sign in / Create account</Link>
          <Link className="button" href="/privacy" style={{ background: "#111d25", color: "#edf4f7", border: "1px solid #29404b" }}>Privacy</Link><Link className="button" href="/terms" style={{ background: "#111d25", color: "#edf4f7", border: "1px solid #29404b" }}>Terms</Link>
        </div>
        <p className="note" style={{ marginTop: 16 }}>KES is the initial default currency. Other currencies are supported only when explicitly recorded.</p>
      </section>
    </main>
  );
}
