import { describe, expect, it } from "vitest";
import { monthsToSavingsGoal, netCashFlow, profitSummary, savingsProjection } from "../lib/finance/calculations";
import { budgetVariance, savingsGoalStatus } from "../lib/finance/reports";
import { assertSafeMinorAmount, sumMinor } from "../lib/money";

describe("money", () => {
  it("sums minor units exactly", () => expect(sumMinor([150, 275, 75])).toBe(500));
  it("rejects unsafe integer amounts", () => expect(() => assertSafeMinorAmount(Number.MAX_SAFE_INTEGER + 1)).toThrow());
});

describe("finance calculations", () => {
  it("calculates net cash flow", () => {
    expect(netCashFlow([
      { kind: "income", amountMinor: 100000 },
      { kind: "expense", amountMinor: 25000 },
    ])).toBe(75000);
  });

  it("projects deterministic savings", () => expect(savingsProjection(10000, 5000, 6)).toBe(40000));

  it("calculates months to savings goal", () => {
    expect(monthsToSavingsGoal(10000, 40000, 5000)).toBe(6);
    expect(monthsToSavingsGoal(40000, 40000, 0)).toBe(0);
    expect(monthsToSavingsGoal(10000, 40000, 0)).toBeNull();
  });

  it("calculates budget variance", () => {
    expect(budgetVariance(50000, 35000)).toEqual({ budgetMinor: 50000, spentMinor: 35000, varianceMinor: 15000 });
  });

  it("calculates savings goal status", () => {
    expect(savingsGoalStatus(10000, 40000, 5000)).toEqual({
      currentMinor: 10000,
      targetMinor: 40000,
      gapMinor: 30000,
      monthsToGoal: 6,
    });
  });

  it("calculates business profit and margin", () => {
    expect(profitSummary(100000, 20000, 30000)).toEqual({
      grossProfitMinor: 80000,
      netProfitMinor: 50000,
      margin: 50,
    });
  });
});
