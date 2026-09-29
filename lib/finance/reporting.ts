export interface PeriodTransaction {
  accountId?: string;
  categoryId?: string | null;
  kind: "income" | "expense";
  amountMinor: number | string;
  currency: string;
  occurredOn: string;
}

export interface PeriodTransfer {
  fromAccountId: string;
  toAccountId: string;
  amountMinor: number | string;
  currency: string;
  feeMinor: number | string;
  occurredOn: string;
}

function safeMinor(value: number | string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error("Financial amount exceeds the supported display range.");
  return parsed;
}

export function filterPeriod<T extends { occurredOn: string }>(rows: T[], start: string, end: string) {
  return rows.filter(row => row.occurredOn >= start && row.occurredOn <= end);
}

export function periodSummary(rows: PeriodTransaction[]) {
  let incomeMinor = 0;
  let expenseMinor = 0;
  for (const row of rows) {
    const amount = safeMinor(row.amountMinor);
    if (row.kind === "income") incomeMinor += amount;
    else expenseMinor += amount;
  }
  return { incomeMinor, expenseMinor, netMinor: incomeMinor - expenseMinor };
}

export function categoryTotals(rows: PeriodTransaction[], kind: "income" | "expense" = "expense") {
  const totals = new Map<string, number>();
  for (const row of rows) {
    if (row.kind !== kind) continue;
    const key = row.categoryId ?? "uncategorized";
    const next = (totals.get(key) ?? 0) + safeMinor(row.amountMinor);
    if (!Number.isSafeInteger(next)) throw new Error("Category total exceeds the supported range.");
    totals.set(key, next);
  }
  return totals;
}

export function categoryTotalsByCurrency(rows: PeriodTransaction[], kind: "income" | "expense" = "expense") {
  const totals = new Map<string, Map<string, number>>();
  for (const row of rows) {
    if (row.kind !== kind) continue;
    const currencyTotals = totals.get(row.currency) ?? new Map<string, number>();
    const key = row.categoryId ?? "uncategorized";
    const next = (currencyTotals.get(key) ?? 0) + safeMinor(row.amountMinor);
    if (!Number.isSafeInteger(next)) throw new Error("Category total exceeds the supported range.");
    currencyTotals.set(key, next);
    totals.set(row.currency, currencyTotals);
  }
  return totals;
}

export function expectedClosingBalance(
  openingBalanceMinor: number,
  incomeMinor: number,
  expenseMinor: number,
  transferInMinor: number,
  transferOutMinor: number,
  adjustmentMinor = 0,
) {
  for (const value of [openingBalanceMinor, incomeMinor, expenseMinor, transferInMinor, transferOutMinor, adjustmentMinor]) {
    if (!Number.isSafeInteger(value)) throw new Error("Report value must be a safe integer.");
  }
  const expected = openingBalanceMinor + incomeMinor - expenseMinor + transferInMinor - transferOutMinor + adjustmentMinor;
  if (!Number.isSafeInteger(expected)) throw new Error("Expected closing balance exceeds the supported range.");
  return expected;
}

export function reconciliationDifference(expectedClosingMinor: number, reportedClosingMinor: number | null) {
  if (reportedClosingMinor === null) return null;
  if (!Number.isSafeInteger(expectedClosingMinor) || !Number.isSafeInteger(reportedClosingMinor)) {
    throw new Error("Reconciliation values must be safe integers.");
  }
  return reportedClosingMinor - expectedClosingMinor;
}
