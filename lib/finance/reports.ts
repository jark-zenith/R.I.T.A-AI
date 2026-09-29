import { profitSummary, type TransactionKind } from "./calculations";

export interface FinanceTransaction {
  amountMinor: number | string;
  kind: TransactionKind;
}

export function summarizePersonalFlow(transactions: FinanceTransaction[]) {
  const income = transactions.filter(tx => tx.kind === "income").reduce((s, tx) => s + Number(tx.amountMinor), 0);
  const expense = transactions.filter(tx => tx.kind === "expense").reduce((s, tx) => s + Number(tx.amountMinor), 0);
  return { incomeMinor: income, expenseMinor: expense, netMinor: income - expense };
}

export interface BusinessTransaction {
  amountMinor: number | string;
  kind: "revenue" | "direct_cost" | "operating_expense";
}

export function summarizeBusinessProfit(transactions: BusinessTransaction[]) {
  const revenue = transactions.filter(tx => tx.kind === "revenue").reduce((s, tx) => s + Number(tx.amountMinor), 0);
  const directCosts = transactions.filter(tx => tx.kind === "direct_cost").reduce((s, tx) => s + Number(tx.amountMinor), 0);
  const operatingExpenses = transactions.filter(tx => tx.kind === "operating_expense").reduce((s, tx) => s + Number(tx.amountMinor), 0);
  return profitSummary(revenue, directCosts, operatingExpenses);
}
