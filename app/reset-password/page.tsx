import { updatePassword } from "./actions";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ResetPasswordPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";

  return (
    <main className="login-wrap">
      <section className="card login-card">
        <div className="eyebrow">Account recovery</div>
        <h1 style={{ fontSize: 32 }}>Choose a new password</h1>
        {error ? <p className="error" role="alert">{error}</p> : null}
        <form className="form" action={updatePassword}>
          <label>New password<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={8} required /></label>
          <button className="button" type="submit">Update password</button>
        </form>
      </section>
    </main>
  );
}
