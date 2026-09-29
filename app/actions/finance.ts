"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function asText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function asPositiveMinorAmount(value: FormDataEntryValue | null) {
  const amount = Number(asText(value));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount greater than zero.");
  const minor = Math.round(amount * 100);
  if (!Number.isSafeInteger(minor) || minor <= 0) throw new Error("Amount is outside the supported range.");
  return minor;
}

async function requireUser() {
  const supabase = await createClient();
  if (!supabase) redirect("/login?error=Supabase%20is%20not%20configured");

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login?error=Please%20sign%20in%20again");

  return { supabase, user: data.user };
}

export async function createAccount(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const name = asText(formData.get("name"));
    const accountType = asText(formData.get("account_type"));
    const openingBalance = Number(asText(formData.get("opening_balance") || "0"));

    if (!name) throw new Error("Account name is required.");
    if (!["cash", "bank", "mobile_money", "other"].includes(accountType)) throw new Error("Invalid account type.");
    if (!Number.isFinite(openingBalance)) throw new Error("Invalid opening balance.");

    const openingBalanceMinor = Math.round(openingBalance * 100);
    if (!Number.isSafeInteger(openingBalanceMinor)) throw new Error("Opening balance is outside the supported range.");

    const { error } = await supabase.from("accounts").insert({
      owner_id: user.id,
      name,
      account_type: accountType,
      currency: "KES",
      opening_balance_minor: openingBalanceMinor,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to create account."));
  }

  revalidatePath("/");
  redirect("/?saved=account");
}

export async function createCategory(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const name = asText(formData.get("name"));
    const kind = asText(formData.get("kind"));

    if (!name) throw new Error("Category name is required.");
    if (kind !== "income" && kind !== "expense") throw new Error("Invalid category type.");

    const { error } = await supabase.from("categories").insert({ owner_id: user.id, name, kind });
    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to create category."));
  }

  revalidatePath("/");
  redirect("/?saved=category");
}

export async function createTransaction(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const accountId = asText(formData.get("account_id"));
    const categoryId = asText(formData.get("category_id"));
    const kind = asText(formData.get("kind"));
    const occurredOn = asText(formData.get("occurred_on"));
    const description = asText(formData.get("description"));

    if (!accountId) throw new Error("Select an account.");
    if (kind !== "income" && kind !== "expense") throw new Error("Invalid transaction type.");
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(occurredOn)) throw new Error("Enter a valid transaction date.");

    const amountMinor = asPositiveMinorAmount(formData.get("amount"));

    const { error } = await supabase.from("transactions").insert({
      owner_id: user.id,
      account_id: accountId,
      category_id: categoryId || null,
      kind,
      amount_minor: amountMinor,
      currency: "KES",
      occurred_on: occurredOn,
      description: description || null,
    });

    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to save transaction."));
  }

  revalidatePath("/");
  redirect("/?saved=transaction");
}

export async function signOut() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  await supabase.auth.signOut();
  redirect("/login");
}
