"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function asText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function asMinorAmount(value: FormDataEntryValue | null, options: { positive?: boolean } = {}) {
  const raw = asText(value);
  if (!/^-?\\d+(\\.\\d{1,2})?$/.test(raw)) throw new Error("Enter an amount with up to 2 decimal places.");
  const negative = raw.startsWith("-");
  const normalized = negative ? raw.slice(1) : raw;
  const [whole, fraction = ""] = normalized.split(".");
  const minor = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  if (!Number.isSafeInteger(minor)) throw new Error("Amount is outside the supported range.");
  if (options.positive !== false && (negative || minor <= 0)) throw new Error("Enter a valid amount greater than zero.");
  return negative ? -minor : minor;
}

function asPositiveMinorAmount(value: FormDataEntryValue | null) {
  return asMinorAmount(value, { positive: true });
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
    const openingBalanceMinor = asMinorAmount(formData.get("opening_balance") || "0", { positive: false });

    if (!name) throw new Error("Account name is required.");
    if (!["cash", "bank", "mobile_money", "other"].includes(accountType)) throw new Error("Invalid account type.");
    if (!Number.isFinite(openingBalance)) throw new Error("Invalid opening balance.");


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


export async function createBudget(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const categoryId = asText(formData.get("category_id"));
    const periodStart = asText(formData.get("period_start"));
    const periodEnd = asText(formData.get("period_end"));
    const amountMinor = asPositiveMinorAmount(formData.get("amount"));

    if (!categoryId) throw new Error("Select an expense category.");
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(periodStart) || !/^\\d{4}-\\d{2}-\\d{2}$/.test(periodEnd) || periodEnd < periodStart) {
      throw new Error("Enter a valid budget period.");
    }

    const { error } = await supabase.from("budgets").insert({
      owner_id: user.id,
      category_id: categoryId,
      period_start: periodStart,
      period_end: periodEnd,
      amount_minor: amountMinor,
      currency: "KES",
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to save budget."));
  }
  revalidatePath("/");
  redirect("/?saved=budget");
}

export async function createSavingsGoal(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const name = asText(formData.get("name"));
    const targetMinor = asPositiveMinorAmount(formData.get("target"));
    const currentMinor = asMinorAmount(formData.get("current") || "0", { positive: false });
    const monthlyContributionMinor = asMinorAmount(formData.get("monthly") || "0", { positive: false });
    const targetDate = asText(formData.get("target_date"));

    if (!name) throw new Error("Savings goal name is required.");
    if (currentMinor < 0 || monthlyContributionMinor < 0) throw new Error("Savings values must be non-negative.");

    const { error } = await supabase.from("savings_goals").insert({
      owner_id: user.id,
      name,
      target_minor: targetMinor,
      current_minor: currentMinor,
      monthly_contribution_minor: monthlyContributionMinor,
      target_date: targetDate || null,
      currency: "KES",
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to save savings goal."));
  }
  revalidatePath("/");
  redirect("/?saved=savings");
}

export async function reconcileTransaction(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const transactionId = asText(formData.get("transaction_id"));
    if (!transactionId) throw new Error("Transaction is required.");

    const { error } = await supabase
      .from("transactions")
      .update({ reconciled_at: new Date().toISOString() })
      .eq("id", transactionId)
      .eq("owner_id", user.id)
      .is("reconciled_at", null);

    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to reconcile transaction."));
  }
  revalidatePath("/");
  redirect("/?saved=reconciled");
}

export async function createBusiness(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const name = asText(formData.get("name"));
    if (!name) throw new Error("Business name is required.");

    const { error } = await supabase.from("businesses").insert({
      owner_id: user.id,
      name,
      currency: "KES",
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to create business."));
  }
  revalidatePath("/");
  redirect("/?saved=business");
}

export async function createBusinessTransaction(formData: FormData) {
  try {
    const { supabase, user } = await requireUser();
    const businessId = asText(formData.get("business_id"));
    const kind = asText(formData.get("kind"));
    const amountMinor = asPositiveMinorAmount(formData.get("amount"));
    const occurredOn = asText(formData.get("occurred_on"));
    const description = asText(formData.get("description"));

    if (!businessId) throw new Error("Select a business.");
    if (!["revenue", "direct_cost", "operating_expense"].includes(kind)) throw new Error("Invalid business transaction type.");
    if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(occurredOn)) throw new Error("Enter a valid date.");

    const { error } = await supabase.from("business_transactions").insert({
      owner_id: user.id,
      business_id: businessId,
      kind,
      amount_minor: amountMinor,
      currency: "KES",
      occurred_on: occurredOn,
      description: description || null,
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    redirect("/?error=" + encodeURIComponent(error instanceof Error ? error.message : "Unable to save business transaction."));
  }
  revalidatePath("/");
  redirect("/?saved=business_transaction");
}
