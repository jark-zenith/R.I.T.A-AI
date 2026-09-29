import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getVerifiedUser } from "@/lib/supabase/server";
import { savingsGoalStatus } from "@/lib/finance/reports";
import { formatMoney } from "@/lib/money";

export default async function SavingsPage() {
  const user = await getVerifiedUser();
  if (!user) redirect("/login");
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { data, error } = await supabase
    .from("savings_goals")
    .select("id,name,target_minor,current_minor,monthly_contribution_minor,target_date,currency,archived_at")
    .is("archived_at", null)
    .order("created_at", { ascending: false });

  if (error) redirect("/dashboard?error=Savings%20goals%20could%20not%20be%20loaded");

  return (
    <main className="login-wrap">
      <section className="card" style={{ width: "min(1000px, 100%)" }}>
        <div className="section-head">
          <div><div className="eyebrow">Financial goals</div><h1>Savings Goals</h1></div>
          <Link className="button" href="/dashboard">Dashboard</Link>
        </div>
        {(data ?? []).length === 0 ? (
          <div className="empty" style={{ marginTop: 14 }}>
            <div><strong>No active savings goals.</strong><p>Create one from the dashboard. R.I.T.A will store the goal and show progress from the values you provide.</p></div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {(data ?? []).map(goal => {
              const status = savingsGoalStatus(goal.current_minor, goal.target_minor, goal.monthly_contribution_minor);
              const progress = status.targetMinor > 0 ? Math.min(100, Math.max(0, status.currentMinor / status.targetMinor * 100)) : 0;
              return (
                <div className="card" key={goal.id} style={{ padding: 16 }}>
                  <div className="section-head"><h2>{goal.name}</h2><span className="status">{goal.currency}</span></div>
                  <div className="metric" style={{ fontSize: 28 }}>{formatMoney(status.currentMinor, goal.currency)}</div>
                  <div className="note">Target {formatMoney(status.targetMinor, goal.currency)} · Gap {formatMoney(status.gapMinor, goal.currency)} · {status.monthsToGoal === null ? "No projection until monthly contribution is set." : status.monthsToGoal === 0 ? "Goal reached." : status.monthsToGoal + " month(s) at the current contribution."}</div>
                  <div style={{ height: 9, borderRadius: 999, background: "#08131a", overflow: "hidden", marginTop: 10 }}><div style={{ width: progress + "%", height: "100%", background: "var(--accent)" }} /></div>
                  <div className="note" style={{ marginTop: 7 }}>Progress {progress.toFixed(1)}%{goal.target_date ? " · Target date " + goal.target_date : ""}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
