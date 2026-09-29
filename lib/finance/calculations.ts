export type TransactionKind = "income" | "expense";

export interface TransactionLike {
  amountMinor: number;
  kind: TransactionKind;
}

function assertSafe(value: number): number {
  if (!Number.isSafeInteger(value)) throw new Error("Financial calculation exceeded the safe integer range.");
  return value;
}

export function netCashFlow(transactions: TransactionLike[]): number {
  let total = 0;
  for (const tx of transactions) {
    if (!Number.isSafeInteger(tx.amountMinor) || tx.amountMinor < 0) {
      throw new Error("Transaction amount must be a non-negative safe integer.");
    }
    total = assertSafe(total + (tx.kind === "income" ? tx.amountMinor : -tx.amountMinor));
  }
  return total;
}

export function savingsProjection(currentMinor: number, monthlyContributionMinor: number, months: number): number {
  if (!Number.isInteger(months) || months < 0) throw new Error("Months must be a non-negative integer.");
  if (!Number.isSafeInteger(currentMinor) || !Number.isSafeInteger(monthlyContributionMinor)) {
    throw new Error("Savings values must be safe integers.");
  }
  return assertSafe(currentMinor + monthlyContributionMinor * months);
}

export function monthsToSavingsGoal(currentMinor: number, targetMinor: number, monthlyContributionMinor: number): number | null {
  if (![currentMinor, targetMinor, monthlyContributionMinor].every(Number.isSafeInteger)) {
    throw new Error("Savings values must be safe integers.");
  }
  if (currentMinor >= targetMinor) return 0;
  if (monthlyContributionMinor <= 0) return null;
  return Math.ceil((targetMinor - currentMinor) / monthlyContributionMinor);
}

export function profitSummary(revenueMinor: number, directCostsMinor: number, operatingExpensesMinor: number) {
  assertSafe(revenueMinor);
  assertSafe(directCostsMinor);
  assertSafe(operatingExpensesMinor);

  const grossProfitMinor = assertSafe(revenueMinor - directCostsMinor);
  const netProfitMinor = assertSafe(grossProfitMinor - operatingExpensesMinor);
  const margin = revenueMinor === 0 ? 0 : (netProfitMinor / revenueMinor) * 100;

  return { grossProfitMinor, netProfitMinor, margin };
}
