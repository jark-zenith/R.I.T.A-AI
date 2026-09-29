import { signIn, signUp, signInWithGoogle, requestPasswordReset } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const message = typeof params.message === "string" ? params.message : "";

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
        <div className="eyebrow">Secure access</div>
        <h1 style={{ fontSize: 32 }}>Enter R.I.T.A</h1>
        <p className="subtitle">Create a private financial workspace or sign in to your existing workspace.</p>
        {error ? <p className="error" role="alert">{error}</p> : null}
        {message ? <p className="note" role="status">{message}</p> : null}

        <form className="form">
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>
          <div className="row">
            <button className="button" type="submit" formAction={signIn}>Sign in</button>
            <button className="button" type="submit" formAction={signUp} style={{ background: "#111d25", color: "#edf4f7", border: "1px solid #29404b" }}>Create account</button>
          </div>
          <button className="button" type="submit" formAction={signInWithGoogle} style={{ background: "#182a33" }}>Continue with Google</button>
        </form>

        <div className="card" style={{ marginTop: 14, padding: 14 }}>
          <div className="section-head"><strong>Password recovery</strong><span className="note">Email link</span></div>
          <form className="form" action={requestPasswordReset}>
            <label>Account email<input name="email" type="email" autoComplete="email" required /></label>
            <button className="button" type="submit" style={{ background: "#111d25", color: "#edf4f7", border: "1px solid #29404b" }}>Send reset link</button>
          </form>
        </div>

        <p className="note" style={{ marginTop: 16 }}>Authentication is performed server-side. Provider-specific authentication failures are returned as generic application errors.</p>
      </section>
    </main>
  );
}
