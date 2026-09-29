import { getVerifiedUser } from "@/lib/supabase/server";
import { Dashboard } from "@/components/dashboard";

export default async function HomePage() {
  const user = await getVerifiedUser();
  return <Dashboard authenticatedEmail={user?.email ?? null} />;
}
