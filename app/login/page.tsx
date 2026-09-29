import { signIn, signUp } from "./actions";

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
        <p className="subtitle">Financial records are designed to stay scoped to the authenticated user. Bank and payment connections are not enabled in this MVP.</p>
        {error ? <p className="error">{error}</p> : null}
        {message ? <p className="note">{message}</p> : null}

        <form className="form">
          <label>Email<input name="email" type="email" autoComplete="email" required /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required minLength={8} /></label>
          <button className="button" type="submit" formAction={signIn}>Sign in</button>
          <button className="button" type="submit" formAction={signUp} style={{ background: "#111d25", color: "#edf4f7", border: "1px solid #29404b" }}>
            Create account
          </button>
        </form>

        <p className="note" style={{ marginTop: 16 }}>
          Authentication is performed through a server action; credentials are not accepted by a client-side financial API.
        </p>
      </section>
    </main>
  );
}
