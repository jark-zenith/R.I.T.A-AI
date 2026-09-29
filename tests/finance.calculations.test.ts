import { describe, expect, it } from "vitest";
import { netCashFlow, profitSummary, savingsProjection } from "@/lib/finance/calculations";
import { assertSafeMinorAmount, sumMinor } from "@/lib/money";

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

  it("calculates business profit and margin", () => {
    expect(profitSummary(100000, 20000, 30000)).toEqual({
      grossProfitMinor: 80000,
      netProfitMinor: 50000,
      margin: 50,
    });
  });
});
