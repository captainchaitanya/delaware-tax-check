import { describe, expect, it } from "vitest";
import { CLASSIC_EXAMPLE } from "./example";
import { calculateIfReady } from "./formValidation";

describe("calculateIfReady", () => {
  it("calculates the classic example from comma-formatted form strings", () => {
    const result = calculateIfReady(CLASSIC_EXAMPLE);
    expect(result.ready).toBe(true);
    if (!result.ready) {
      return;
    }
    expect(result.result.authorizedSharesTax).toBe(85_165);
    expect(result.result.apvcTax).toBe(400);
    expect(result.result.winningMethod).toBe("apvc");
    expect(result.result.assumedPar).toBe("0.0125");
  });

  it("handles the Authorized Shares Method winning from form strings", () => {
    const result = calculateIfReady({
      issuedShares: "5,000",
      grossAssets: "5,000,000",
      classes: [
        {
          id: "common",
          name: "Common",
          authorized: "5,000",
          parValue: "0.001",
        },
      ],
    });

    expect(result.ready).toBe(true);
    if (!result.ready) {
      return;
    }
    expect(result.result.winningMethod).toBe("authorizedShares");
    expect(result.result.authorizedSharesTax).toBe(175);
    expect(result.result.apvcTax).toBe(2_000);
  });

  it("does not calculate while a field is empty or invalid", () => {
    expect(calculateIfReady({ ...CLASSIC_EXAMPLE, issuedShares: "" }).ready).toBe(
      false,
    );
    expect(
      calculateIfReady({ ...CLASSIC_EXAMPLE, issuedShares: "abc" }).ready,
    ).toBe(false);
  });
});
