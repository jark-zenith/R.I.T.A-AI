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
  ] = await Promise.all([
    supabase.from("accounts").select("id,name,account_type,currency,opening_balance_minor").order("created_at", { ascending: true }),
    supabase.from("categories").select("id,name,kind").order("name", { ascending: true }),
    supabase.from("transactions").select("id,kind,amount_minor,currency,occurred_on,description").order("occurred_on", { ascending: false }).limit(100),
  ]);

  if (accountsError || categoriesError || transactionsError) {
    redirect("/login?error=R.I.T.A%20could%20not%20load%20financial%20records.%20Check%20the%20database%20migration%20and%20RLS%20configuration.");
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
      message={error || saved}
    />
  );
}
