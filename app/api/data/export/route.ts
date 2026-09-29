import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, accounts, categories, transactions, transfers, budgets, savingsGoals, snapshots, businesses, businessTransactions, reportRuns, revisions] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
    supabase.from("accounts").select("*"),
    supabase.from("categories").select("*"),
    supabase.from("transactions").select("*").limit(10000),
    supabase.from("transfers").select("*").limit(10000),
    supabase.from("budgets").select("*").limit(1000),
    supabase.from("savings_goals").select("*").limit(1000),
    supabase.from("daily_snapshots").select("*").limit(5000),
    supabase.from("businesses").select("*").limit(1000),
    supabase.from("business_transactions").select("*").limit(10000),
    supabase.from("report_runs").select("*").limit(1000),
    supabase.from("transaction_revisions").select("*").limit(10000),
  ]);

  const collections = [profile, accounts, categories, transactions, transfers, budgets, savingsGoals, snapshots, businesses, businessTransactions, reportRuns, revisions];
  const failed = collections.find(result => result.error);
  if (failed?.error) {
    return NextResponse.json({ error: "Export could not be generated" }, { status: 500 });
  }

  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    userId: auth.user.id,
    profile: profile.data,
    accounts: accounts.data,
    categories: categories.data,
    transactions: transactions.data,
    transfers: transfers.data,
    budgets: budgets.data,
    savingsGoals: savingsGoals.data,
    dailySnapshots: snapshots.data,
    businesses: businesses.data,
    businessTransactions: businessTransactions.data,
    reportRuns: reportRuns.data,
    transactionRevisions: revisions.data,
  }, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": 'attachment; filename="rita-data-export.json"',
    },
  });
}
