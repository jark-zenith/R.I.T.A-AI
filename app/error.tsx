"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {}, []);
  return (
    <main className="login-wrap">
      <section className="card login-card">
        <div className="eyebrow">R.I.T.A recovery</div>
        <h1 style={{ fontSize: 32 }}>Something went wrong.</h1>
        <p className="subtitle">The application could not complete that request. No internal error details are shown here.</p>
        <div className="row">
          <button className="button" type="button" onClick={() => reset()}>Try again</button>
          <Link className="button" href="/dashboard">Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
