import { monthsToSavingsGoal, profitSummary, type TransactionKind } from "./calculations";

export interface FinanceTransaction {
  amountMinor: number | string;
  kind: TransactionKind;
}

function safeMinor(value: number | string): number {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error("Invalid monetary value in report input.");
  return parsed;
}

export function summarizePersonalFlow(transactions: FinanceTransaction[]) {
  const income = transactions.filter(tx => tx.kind === "income").reduce((s, tx) => s + safeMinor(tx.amountMinor), 0);
  const expense = transactions.filter(tx => tx.kind === "expense").reduce((s, tx) => s + safeMinor(tx.amountMinor), 0);
  return { incomeMinor: income, expenseMinor: expense, netMinor: income - expense };
}

export function budgetVariance(budgetMinor: number | string, spentMinor: number | string) {
  const budget = safeMinor(budgetMinor);
  const spent = safeMinor(spentMinor);
  return { budgetMinor: budget, spentMinor: spent, varianceMinor: budget - spent };
}

export interface BusinessTransaction {
  amountMinor: number | string;
  kind: "revenue" | "direct_cost" | "operating_expense";
}

export function summarizeBusinessProfit(transactions: BusinessTransaction[]) {
  const revenue = transactions.filter(tx => tx.kind === "revenue").reduce((s, tx) => s + safeMinor(tx.amountMinor), 0);
  const directCosts = transactions.filter(tx => tx.kind === "direct_cost").reduce((s, tx) => s + safeMinor(tx.amountMinor), 0);
  const operatingExpenses = transactions.filter(tx => tx.kind === "operating_expense").reduce((s, tx) => s + safeMinor(tx.amountMinor), 0);
  return profitSummary(revenue, directCosts, operatingExpenses);
}

export function savingsGoalStatus(currentMinor: number | string, targetMinor: number | string, monthlyContributionMinor: number | string) {
  const current = safeMinor(currentMinor);
  const target = safeMinor(targetMinor);
  const monthly = safeMinor(monthlyContributionMinor);
  return {
    currentMinor: current,
    targetMinor: target,
    gapMinor: Math.max(0, target - current),
    monthsToGoal: monthsToSavingsGoal(current, target, monthly),
  };
}
