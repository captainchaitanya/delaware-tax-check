import { describe, expect, it } from "vitest";
import {
  apvcTax,
  authorizedSharesTax,
  compare,
  type FranchiseTaxInput,
} from "./franchiseTax";

const classicCase: FranchiseTaxInput = {
  grossAssets: 100_000,
  issuedShares: 8_000_000,
  classes: [
    { name: "Common", authorized: 10_000_000, parValue: "0.00001" },
  ],
};

describe("authorizedSharesTax", () => {
  it("charges $175 for 5,000 shares or fewer", () => {
    expect(authorizedSharesTax(0)).toBe(175);
    expect(authorizedSharesTax(1)).toBe(175);
    expect(authorizedSharesTax(5_000)).toBe(175);
  });

  it("charges $250 for 5,001–10,000 shares", () => {
    expect(authorizedSharesTax(5_001)).toBe(250);
    expect(authorizedSharesTax(10_000)).toBe(250);
  });

  it("adds $85 for each additional 10,000 shares or portion thereof", () => {
    expect(authorizedSharesTax(10_001)).toBe(335);
    expect(authorizedSharesTax(20_000)).toBe(335);
    expect(authorizedSharesTax(20_001)).toBe(420);
  });

  it("matches the classic 10,000,000-share notice amount", () => {
    expect(authorizedSharesTax(10_000_000)).toBe(85_165);
  });

  it("caps very large share counts at $200,000", () => {
    expect(authorizedSharesTax(100_000_000)).toBe(200_000);
    expect(authorizedSharesTax(1_000_000_000)).toBe(200_000);
  });

  it("rejects negative and non-integer share counts", () => {
    expect(() => authorizedSharesTax(-1)).toThrow(
      /cannot be negative/i,
    );
    expect(() => authorizedSharesTax(10.5)).toThrow(/integer/i);
  });
});

describe("apvcTax", () => {
  it("computes the classic founder case", () => {
    const result = apvcTax(classicCase);

    expect(result.assumedPar).toBe("0.0125");
    expect(result.assumedParValueCapital).toBe("125000");
    expect(result.tax).toBe(400);
    expect(result.classBreakdown[0]?.usedAssumedPar).toBe(true);
    expect(result.classBreakdown[0]?.capital).toBe("125000");
  });

  it("uses stated par when it is higher than assumed par", () => {
    const result = apvcTax({
      grossAssets: 100_000,
      issuedShares: 1_000_000,
      classes: [{ name: "Common", authorized: 1_000_000, parValue: "1" }],
    });

    // assumed par = 100000 / 1000000 = 0.10; stated par $1.00 is used
    expect(result.assumedPar).toBe("0.1");
    expect(result.classBreakdown[0]?.usedAssumedPar).toBe(false);
    expect(result.classBreakdown[0]?.rateUsed).toBe("1");
    expect(result.assumedParValueCapital).toBe("1000000");
    expect(result.tax).toBe(400);
  });

  it("sums two share classes with different par values", () => {
    const result = apvcTax({
      grossAssets: 100_000,
      issuedShares: 8_000_000,
      classes: [
        { name: "Common", authorized: 10_000_000, parValue: "0.00001" },
        { name: "Preferred", authorized: 1_000_000, parValue: "1" },
      ],
    });

    // assumed par = 0.0125
    // Common: par 0.00001 < 0.0125 → 0.0125 × 10,000,000 = 125,000
    // Preferred: par 1.00 > 0.0125 → 1 × 1,000,000 = 1,000,000
    expect(result.assumedPar).toBe("0.0125");
    expect(result.classBreakdown).toHaveLength(2);
    expect(result.classBreakdown[0]).toMatchObject({
      name: "Common",
      usedAssumedPar: true,
      capital: "125000",
    });
    expect(result.classBreakdown[1]).toMatchObject({
      name: "Preferred",
      usedAssumedPar: false,
      capital: "1000000",
    });
    expect(result.assumedParValueCapital).toBe("1125000");
    expect(result.tax).toBe(800);
  });

  it("charges the $400 minimum when gross assets are zero", () => {
    const result = apvcTax({
      grossAssets: 0,
      issuedShares: 8_000_000,
      classes: [
        { name: "Common", authorized: 10_000_000, parValue: "0.00001" },
      ],
    });

    expect(result.assumedPar).toBe("0");
    expect(result.tax).toBe(400);
  });

  it("caps APVC tax at $200,000", () => {
    const result = apvcTax({
      grossAssets: 600_000_000,
      issuedShares: 1_000,
      classes: [{ name: "Common", authorized: 1_000, parValue: "0.00001" }],
    });

    // assumed par = 600,000; capital = 600,000,000 → 600 × $400 = $240,000 → cap
    expect(result.tax).toBe(200_000);
  });

  it("throws a clear error when issued shares are 0", () => {
    expect(() =>
      apvcTax({
        grossAssets: 100_000,
        issuedShares: 0,
        classes: [
          { name: "Common", authorized: 10_000_000, parValue: "0.00001" },
        ],
      }),
    ).toThrow(/issued shares must be greater than 0/i);
  });

  it("throws clear errors for negative numbers", () => {
    expect(() =>
      apvcTax({
        grossAssets: -1,
        issuedShares: 1_000,
        classes: [{ name: "Common", authorized: 1_000, parValue: "0.01" }],
      }),
    ).toThrow(/gross assets cannot be negative/i);

    expect(() =>
      apvcTax({
        grossAssets: 100,
        issuedShares: -5,
        classes: [{ name: "Common", authorized: 1_000, parValue: "0.01" }],
      }),
    ).toThrow(/issued shares/i);

    expect(() =>
      apvcTax({
        grossAssets: 100,
        issuedShares: 1_000,
        classes: [{ name: "Common", authorized: -1, parValue: "0.01" }],
      }),
    ).toThrow(/cannot be negative/i);

    expect(() =>
      apvcTax({
        grossAssets: 100,
        issuedShares: 1_000,
        classes: [{ name: "Common", authorized: 1_000, parValue: "-0.01" }],
      }),
    ).toThrow(/par value.*cannot be negative/i);
  });
});

describe("compare", () => {
  it("selects the Authorized Shares Method when it is lower", () => {
    const result = compare({
      grossAssets: 5_000_000,
      issuedShares: 5_000,
      classes: [{ name: "Common", authorized: 5_000, parValue: "0.001" }],
    });

    // assumed par = $1,000; capital = $5,000,000 → APVC $2,000
    expect(result.authorizedSharesTax).toBe(175);
    expect(result.apvcTax).toBe(2_000);
    expect(result.lowerTax).toBe(175);
    expect(result.savings).toBe(1_825);
    expect(result.winningMethod).toBe("authorizedShares");
    expect(result.quarterlySchedule).toBeNull();
  });

  it("returns both methods, the lower amount, and savings for the classic case", () => {
    const result = compare(classicCase);

    expect(result.authorizedSharesTax).toBe(85_165);
    expect(result.apvcTax).toBe(400);
    expect(result.lowerTax).toBe(400);
    expect(result.savings).toBe(84_765);
    expect(result.winningMethod).toBe("apvc");
    expect(result.assumedPar).toBe("0.0125");
    expect(result.assumedParValueCapital).toBe("125000");
    expect(result.quarterlySchedule).toBeNull();
  });

  it("builds a quarterly schedule when the amount owed is $5,000 or more", () => {
    const result = compare({
      grossAssets: 20_000_000,
      issuedShares: 1_000,
      classes: [{ name: "Common", authorized: 1_000, parValue: "0.01" }],
    });

    // capital = $20,000,000 → APVC $8,000; authorized shares is $175
    expect(result.winningMethod).toBe("authorizedShares");
    expect(result.lowerTax).toBe(175);
    expect(result.quarterlySchedule).toBeNull();

    const highBoth = compare({
      grossAssets: 20_000_000,
      issuedShares: 10_000_000,
      classes: [{ name: "Common", authorized: 10_000_000, parValue: "0.01" }],
    });

    // assumed par = $2; capital = $20,000,000 → APVC $8,000. Authorized $85,165.
    expect(highBoth.lowerTax).toBe(8_000);
    expect(highBoth.winningMethod).toBe("apvc");
    expect(highBoth.quarterlySchedule).toEqual([
      { due: "June 1", percent: 40, amountDollars: 3_200, remainder: false },
      {
        due: "September 1",
        percent: 20,
        amountDollars: 1_600,
        remainder: false,
      },
      {
        due: "December 1",
        percent: 20,
        amountDollars: 1_600,
        remainder: false,
      },
      { due: "March 1", percent: null, amountDollars: 1_600, remainder: true },
    ]);
  });

  it("reports a tie when both methods produce the same tax", () => {
    const result = compare({
      grossAssets: 0,
      issuedShares: 100,
      classes: [{ name: "Common", authorized: 100, parValue: "1" }],
    });

    // Authorized: $175; APVC: $400 minimum — not a tie.
    expect(result.winningMethod).toBe("authorizedShares");
    expect(result.lowerTax).toBe(175);

    const bothCapped = compare({
      grossAssets: 600_000_000,
      issuedShares: 1_000,
      classes: [
        { name: "Common", authorized: 100_000_000, parValue: "0.00001" },
      ],
    });
    expect(bothCapped.authorizedSharesTax).toBe(200_000);
    expect(bothCapped.apvcTax).toBe(200_000);
    expect(bothCapped.winningMethod).toBe("tie");
    expect(bothCapped.savings).toBe(0);
  });
});
