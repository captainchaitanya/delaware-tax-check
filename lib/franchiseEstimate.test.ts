import { describe, expect, it } from "vitest";
import { franchiseEstimateFromProfile } from "./franchiseEstimate";
import { SAMPLE_PROFILE } from "./profile";

describe("franchiseEstimateFromProfile", () => {
  it("returns the classic-case filing total when share data is complete", () => {
    const estimate = franchiseEstimateFromProfile(SAMPLE_PROFILE);
    expect(estimate).toEqual({
      tax: 400,
      annualReportFee: 50,
      filingTotal: 450,
      winningMethod: "apvc",
    });
  });

  it("returns null when share data is missing", () => {
    expect(
      franchiseEstimateFromProfile({ ...SAMPLE_PROFILE, shareStructure: null }),
    ).toBeNull();
    expect(franchiseEstimateFromProfile(null)).toBeNull();
  });
});
