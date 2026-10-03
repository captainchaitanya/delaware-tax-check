import { describe, expect, it } from "vitest";
import {
  SAMPLE_PROFILE,
  companyProfileSchema,
  createDraftProfile,
  isValidMonthDay,
} from "./profile";

describe("companyProfileSchema", () => {
  it("accepts the fictional sample profile", () => {
    expect(companyProfileSchema.parse(SAMPLE_PROFILE).companyName).toBe(
      "Northbridge Labs, Inc.",
    );
  });

  it("rejects a missing company name", () => {
    const result = companyProfileSchema.safeParse({
      ...SAMPLE_PROFILE,
      companyName: "  ",
    });
    expect(result.success).toBe(false);
  });

  it("requires Indian details only when there is a subsidiary", () => {
    expect(
      companyProfileSchema.safeParse({
        ...SAMPLE_PROFILE,
        hasIndianSubsidiary: true,
        india: null,
      }).success,
    ).toBe(false);

    expect(
      companyProfileSchema.safeParse({
        ...createDraftProfile(),
        companyName: "Cedar Peak Technologies, Inc.",
        hasIndianSubsidiary: false,
        india: null,
        completedAt: "2026-10-03T00:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("validates month-end dates", () => {
    expect(isValidMonthDay(2, 29)).toBe(true);
    expect(isValidMonthDay(2, 30)).toBe(false);
    expect(isValidMonthDay(4, 31)).toBe(false);
    expect(isValidMonthDay(12, 31)).toBe(true);
  });
});
