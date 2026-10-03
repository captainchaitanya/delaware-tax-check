import { describe, expect, it } from "vitest";
import {
  SAMPLE_PROFILE,
  companyProfileSchema,
  createDraftProfile,
  firstDir3DueYear,
  isValidMonthDay,
} from "./profile";

describe("companyProfileSchema", () => {
  it("accepts a profile saved before firstName existed", () => {
    const { firstName: _firstName, ...legacy } = SAMPLE_PROFILE;
    expect(companyProfileSchema.parse(legacy).firstName).toBeUndefined();
  });

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

  it("fills new verification fields on older saved profiles", () => {
    const {
      firstName: _firstName,
      reportableRelatedPartyTransactions: _related,
      ...legacy
    } = SAMPLE_PROFILE;
    const withoutNew = {
      ...legacy,
      india: {
        financialYear: "apr-mar" as const,
        gstRegistered: true,
        receivesForeignInvestment: true,
        directorCount: 2,
      },
    };
    const parsed = companyProfileSchema.parse(withoutNew);
    expect(parsed.reportableRelatedPartyTransactions).toBe(true);
    expect(parsed.india?.transactsWithUsParent).toBe(true);
    expect(parsed.india?.directorDinFyEnds).toEqual([]);
  });

  it("anchors DIR-3 to the year after the third FY", () => {
    expect(firstDir3DueYear(2025)).toBe(2028);
    expect(firstDir3DueYear(2026)).toBe(2029);
    expect(firstDir3DueYear(2027)).toBe(2030);
  });

  it("validates month-end dates", () => {
    expect(isValidMonthDay(2, 29)).toBe(true);
    expect(isValidMonthDay(2, 30)).toBe(false);
    expect(isValidMonthDay(4, 31)).toBe(false);
    expect(isValidMonthDay(12, 31)).toBe(true);
  });
});
