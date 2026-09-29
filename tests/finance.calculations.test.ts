import { describe, expect, it } from "vitest";
import { monthsToSavingsGoal, netCashFlow, profitSummary, savingsProjection } from "../lib/finance/calculations";
import { budgetVariance, savingsGoalStatus } from "../lib/finance/reports";
import { calculateAccountBalances, groupBalancesByCurrency } from "../lib/finance/balances";
import { expectedClosingBalance, reconciliationDifference } from "../lib/finance/reporting";

describe("R.I.T.A financial calculations", () => {
  it("calculates exact minor-unit net cash flow", () => {
    expect(netCashFlow([
      { kind: "income", amountMinor: 12550 },
      { kind: "expense", amountMinor: 2550 },
    ])).toBe(10000);
  });

  it("rejects unsafe or negative authoritative amounts", () => {
    expect(() => netCashFlow([{ kind: "income", amountMinor: -1 }])).toThrow();
    expect(() => netCashFlow([{ kind: "income", amountMinor: Number.MAX_SAFE_INTEGER + 1 }])).toThrow();
  });

  it("projects savings", () => {
    expect(savingsProjection(10000, 2500, 6)).toBe(25000);
    expect(monthsToSavingsGoal(10000, 40000, 5000)).toBe(6);
    expect(monthsToSavingsGoal(40000, 40000, 0)).toBe(0);
    expect(monthsToSavingsGoal(10000, 40000, 0)).toBeNull();
  });

  it("calculates business profit and margin", () => {
    expect(profitSummary(100000, 30000, 20000)).toEqual({
      grossProfitMinor: 70000,
      netProfitMinor: 50000,
      margin: 50,
    });
  });

  it("calculates budget and savings status", () => {
    expect(budgetVariance(50000, 35000)).toEqual({
      budgetMinor: 50000,
      spentMinor: 35000,
      varianceMinor: 15000,
    });
    expect(savingsGoalStatus(10000, 40000, 5000)).toEqual({
      currentMinor: 10000,
      targetMinor: 40000,
      gapMinor: 30000,
      monthsToGoal: 6,
    });
  });

  it("calculates account balances with transfers without double-counting", () => {
    const accounts = [
      { id: "cash", currency: "KES", openingBalanceMinor: 100000 },
      { id: "bank", currency: "KES", openingBalanceMinor: 50000 },
      { id: "usd", currency: "USD", openingBalanceMinor: 20000 },
    ];

    const balances = calculateAccountBalances(
      accounts,
      [
        { accountId: "cash", currency: "KES", kind: "income", amountMinor: 10000 },
        { accountId: "cash", currency: "KES", kind: "expense", amountMinor: 3000 },
      ],
      [{
        fromAccountId: "cash", toAccountId: "bank", currency: "KES",
        amountMinor: 20000, feeMinor: 100,
      }],
    );

    expect(balances.get("cash")).toBe(86900);
    expect(balances.get("bank")).toBe(70000);
    expect(balances.get("usd")).toBe(20000);
    expect(groupBalancesByCurrency(accounts, balances)).toEqual(new Map([["KES", 156900], ["USD", 20000]]));
  });

  it("calculates daily reconciliation difference explicitly", () => {
    const expected = expectedClosingBalance(100000, 20000, 5000, 10000, 10000, 0);
    expect(expected).toBe(115000);
    expect(reconciliationDifference(expected, 115000)).toBe(0);
    expect(reconciliationDifference(expected, 114000)).toBe(-1000);
    expect(reconciliationDifference(expected, null)).toBeNull();
  });
});
