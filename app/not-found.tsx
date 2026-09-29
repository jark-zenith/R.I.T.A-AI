import Link from "next/link";

export default function NotFound() {
  return (
    <main className="login-wrap">
      <section className="card login-card">
        <div className="eyebrow">R.I.T.A</div>
        <h1 style={{ fontSize: 32 }}>Page not found.</h1>
        <p className="subtitle">That route does not exist or is no longer available.</p>
        <Link className="button" href="/dashboard">Back to dashboard</Link>
      </section>
    </main>
  );
}
