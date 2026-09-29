export interface BalanceAccount {
  id: string;
  currency: string;
  openingBalanceMinor: number | string;
}

export interface BalanceTransaction {
  accountId: string;
  currency: string;
  kind: "income" | "expense";
  amountMinor: number | string;
}

export interface BalanceTransfer {
  fromAccountId: string;
  toAccountId: string;
  currency: string;
  amountMinor: number | string;
  feeMinor: number | string;
}

function safeMinor(value: number | string) {
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error("Financial amount exceeds the supported display range.");
  return parsed;
}

export function calculateAccountBalances(
  accounts: BalanceAccount[],
  transactions: BalanceTransaction[],
  transfers: BalanceTransfer[],
) {
  const result = new Map<string, number>();

  for (const account of accounts) result.set(account.id, safeMinor(account.openingBalanceMinor));

  for (const tx of transactions) {
    if (!result.has(tx.accountId)) continue;
    const current = result.get(tx.accountId)!;
    const amount = safeMinor(tx.amountMinor);
    result.set(tx.accountId, current + (tx.kind === "income" ? amount : -amount));
  }

  for (const transfer of transfers) {
    const amount = safeMinor(transfer.amountMinor);
    const fee = safeMinor(transfer.feeMinor);
    if (result.has(transfer.fromAccountId)) {
      result.set(transfer.fromAccountId, result.get(transfer.fromAccountId)! - amount - fee);
    }
    if (result.has(transfer.toAccountId)) {
      result.set(transfer.toAccountId, result.get(transfer.toAccountId)! + amount);
    }
  }

  for (const [id, value] of result) {
    if (!Number.isSafeInteger(value)) throw new Error("Account balance exceeds the supported range.");
    result.set(id, value);
  }

  return result;
}

export function groupBalancesByCurrency(accounts: Array<BalanceAccount & { id: string }>, balances: Map<string, number>) {
  const grouped = new Map<string, number>();
  for (const account of accounts) {
    const current = grouped.get(account.currency) ?? 0;
    const next = current + (balances.get(account.id) ?? 0);
    if (!Number.isSafeInteger(next)) throw new Error("Currency total exceeds the supported range.");
    grouped.set(account.currency, next);
  }
  return grouped;
}
