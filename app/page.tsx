import { redirect } from "next/navigation";
import { getVerifiedUser, createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getVerifiedUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const [
    { data: accounts, error: accountsError },
    { data: categories, error: categoriesError },
    { data: transactions, error: transactionsError },
    { data: budgets, error: budgetsError },
    { data: savingsGoals, error: savingsError },
    { data: businesses, error: businessesError },
    { data: businessTransactions, error: businessTransactionsError },
  ] = await Promise.all([
    supabase.from("accounts").select("id,name,account_type,currency,opening_balance_minor").order("created_at", { ascending: true }),
    supabase.from("categories").select("id,name,kind").order("name", { ascending: true }),
    supabase.from("transactions").select("id,kind,amount_minor,currency,occurred_on,description,reconciled_at").order("occurred_on", { ascending: false }).limit(100),
    supabase.from("budgets").select("id,category_id,period_start,period_end,amount_minor,currency").order("period_start", { ascending: false }).limit(20),
    supabase.from("savings_goals").select("id,name,target_minor,current_minor,monthly_contribution_minor,target_date,currency").order("created_at", { ascending: false }).limit(20),
    supabase.from("businesses").select("id,name,currency").order("created_at", { ascending: true }),
    supabase.from("business_transactions").select("id,business_id,kind,amount_minor,currency,occurred_on,description").order("occurred_on", { ascending: false }).limit(100),
  ]);

  if (accountsError || categoriesError || transactionsError || budgetsError || savingsError || businessesError || businessTransactionsError) {
    redirect("/login?error=R.I.T.A%20could%20not%20load%20financial%20records.%20Check%20the%20database%20migrations%20and%20RLS%20configuration.");
  }

  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const saved = typeof params.saved === "string" ? params.saved : "";

  return (
    <Dashboard
      userEmail={user.email ?? ""}
      accounts={accounts ?? []}
      categories={categories ?? []}
      transactions={transactions ?? []}
      budgets={budgets ?? []}
      savingsGoals={savingsGoals ?? []}
      businesses={businesses ?? []}
      businessTransactions={businessTransactions ?? []}
      message={error || saved}
    />
  );
}
