import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

const configured = [
  "RITA_TEST_SUPABASE_URL",
  "RITA_TEST_SUPABASE_PUBLISHABLE_KEY",
  "RITA_TEST_USER_A_EMAIL",
  "RITA_TEST_USER_A_PASSWORD",
  "RITA_TEST_USER_B_EMAIL",
  "RITA_TEST_USER_B_PASSWORD",
].every(key => Boolean(process.env[key]));

describe.skipIf(!configured)("R.I.T.A two-user RLS isolation", () => {
  it("prevents user B from reading or attaching data to user A", async () => {
    const clientA = createClient(process.env.RITA_TEST_SUPABASE_URL!, process.env.RITA_TEST_SUPABASE_PUBLISHABLE_KEY!);
    const clientB = createClient(process.env.RITA_TEST_SUPABASE_URL!, process.env.RITA_TEST_SUPABASE_PUBLISHABLE_KEY!);

    const signInA = await clientA.auth.signInWithPassword({
      email: process.env.RITA_TEST_USER_A_EMAIL!,
      password: process.env.RITA_TEST_USER_A_PASSWORD!,
    });
    const signInB = await clientB.auth.signInWithPassword({
      email: process.env.RITA_TEST_USER_B_EMAIL!,
      password: process.env.RITA_TEST_USER_B_PASSWORD!,
    });

    expect(signInA.error).toBeNull();
    expect(signInB.error).toBeNull();

    const { data: accountA, error: accountError } = await clientA
      .from("accounts")
      .insert({ name: "RLS test account", account_type: "cash", currency: "KES", opening_balance_minor: 1000 })
      .select("id")
      .single();

    expect(accountError).toBeNull();
    expect(accountA?.id).toBeTruthy();

    const readOtherUser = await clientB.from("accounts").select("id").eq("id", accountA!.id);
    expect(readOtherUser.error).toBeNull();
    expect(readOtherUser.data).toEqual([]);

    const writeOtherUser = await clientB.from("transactions").insert({
      account_id: accountA!.id,
      kind: "income",
      amount_minor: 500,
      currency: "KES",
      occurred_on: "2026-01-01",
      description: "must be blocked",
    });
    expect(writeOtherUser.error).not.toBeNull();

    await clientA.from("accounts").delete().eq("id", accountA!.id);
    await clientA.auth.signOut();
    await clientB.auth.signOut();
  });
});
