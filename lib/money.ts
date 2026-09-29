export const DEFAULT_CURRENCY = "KES" as const;

export function assertSafeMinorAmount(amountMinor: number): number {
  if (!Number.isSafeInteger(amountMinor)) throw new Error("Amount must be a safe integer in minor units.");
  return amountMinor;
}

export function formatMoney(amountMinor: number, currency = DEFAULT_CURRENCY): string {
  assertSafeMinorAmount(amountMinor);
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function sumMinor(values: number[]): number {
  const total = values.reduce((sum, value) => {
    const next = sum + assertSafeMinorAmount(value);
    if (!Number.isSafeInteger(next)) throw new Error("Monetary total exceeds safe integer range.");
    return next;
  }, 0);
  return total;
}
