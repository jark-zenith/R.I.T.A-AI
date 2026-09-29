export type TransactionKind = "income" | "expense";

export interface TransactionLike {
  amountMinor: number;
  kind: TransactionKind;
}

export function netCashFlow(transactions: TransactionLike[]): number {
  return transactions.reduce(
    (total, tx) => total + (tx.kind === "income" ? tx.amountMinor : -tx.amountMinor),
    0,
  );
}

export function savingsProjection(currentMinor: number, monthlyContributionMinor: number, months: number): number {
  if (!Number.isInteger(months) || months < 0) throw new Error("Months must be a non-negative integer.");
  if (!Number.isSafeInteger(currentMinor) || !Number.isSafeInteger(monthlyContributionMinor)) {
    throw new Error("Savings values must be safe integers.");
  }
  const projected = currentMinor + monthlyContributionMinor * months;
  if (!Number.isSafeInteger(projected)) throw new Error("Savings projection exceeds safe integer range.");
  return projected;
}

export function profitSummary(revenueMinor: number, directCostsMinor: number, operatingExpensesMinor: number) {
  const grossProfitMinor = revenueMinor - directCostsMinor;
  const netProfitMinor = grossProfitMinor - operatingExpensesMinor;
  const margin = revenueMinor === 0 ? 0 : (netProfitMinor / revenueMinor) * 100;
  return { grossProfitMinor, netProfitMinor, margin };
}
