import { describe, expect, it } from "vitest";
import { SAMPLE_PROFILE } from "../profile";
import { weekday } from "./civilDate";
import { generateDeadlines } from "./generate";
import { DEADLINE_RULES } from "./rules";

const TODAY = { year: 2026, month: 10, day: 3 };

describe("generateDeadlines", () => {
  it("uses an injectable today and keeps the 12-month window", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(items.every((item) => item.isoDate >= "2026-10-03")).toBe(true);
    expect(items.every((item) => item.isoDate <= "2027-10-02")).toBe(true);
    expect(items.map((item) => item.isoDate)).toEqual(
      [...items].sort((a, b) => a.isoDate.localeCompare(b.isoDate)).map((item) => item.isoDate),
    );
  });

  it("omits India rules when there is no Indian subsidiary", () => {
    const items = generateDeadlines(
      {
        ...SAMPLE_PROFILE,
        hasIndianSubsidiary: false,
        india: null,
        indianResidentFoundersHoldShares: false,
      },
      TODAY,
    );
    expect(items.some((item) => item.jurisdiction === "India")).toBe(false);
    expect(items.some((item) => item.ruleId === "de-franchise-annual")).toBe(
      true,
    );
    expect(items.some((item) => item.ruleId === "us-1120")).toBe(true);
  });

  it("includes Form 5472 only when 25%+ foreign-owned", () => {
    const owned = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(owned.some((item) => item.ruleId === "us-5472")).toBe(true);
    const domestic = generateDeadlines(
      { ...SAMPLE_PROFILE, foreignOwned25: false },
      TODAY,
    );
    expect(domestic.some((item) => item.ruleId === "us-5472")).toBe(false);
  });

  it("rolls a weekend Delaware date to the next weekday", () => {
    expect(weekday({ year: 2026, month: 3, day: 1 })).toBe(0);
    const items = generateDeadlines(SAMPLE_PROFILE, { year: 2026, month: 1, day: 15 });
    const annual = items.find(
      (item) => item.ruleId === "de-franchise-annual" && item.date.year === 2026,
    );
    expect(annual?.isoDate).toBe("2026-03-02");
  });

  it("places Form 1120 on the 15th of the 4th month after US year end", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, { year: 2026, month: 1, day: 2 });
    const form = items.find(
      (item) => item.ruleId === "us-1120" && item.date.year === 2026,
    );
    expect(form?.isoDate).toBe("2026-04-15");
  });

  it("computes AGM then AOC-4 / MGT-7 as relative dates", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, { year: 2026, month: 4, day: 1 });
    const agm = items.find(
      (item) => item.ruleId === "in-agm" && item.date.year === 2026,
    );
    const aoc = items.find(
      (item) => item.ruleId === "in-aoc4" && item.date.year === 2026,
    );
    const mgt = items.find(
      (item) => item.ruleId === "in-mgt7" && item.date.year === 2026,
    );
    expect(agm?.isoDate).toBe("2026-09-30");
    expect(aoc?.isoDate).toBe("2026-10-30");
    expect(mgt?.isoDate).toBe("2026-11-30");
  });

  it("skips quarterly Delaware estimates when tax is under $5,000", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(items.some((item) => item.ruleId.startsWith("de-franchise-q"))).toBe(
      false,
    );
  });

  it("emits one DIR-3 KYC per director", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, { year: 2026, month: 8, day: 1 });
    const kyc = items.filter(
      (item) => item.ruleId === "in-dir3-kyc" && item.date.year === 2026,
    );
    expect(kyc).toHaveLength(2);
  });

  it("can include overdue items with a lookback window", () => {
    const none = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(none.some((item) => item.status === "overdue")).toBe(false);
    const withLookback = generateDeadlines(SAMPLE_PROFILE, TODAY, {
      lookbackDays: 90,
    });
    expect(withLookback.some((item) => item.status === "overdue")).toBe(true);
  });

  it("marks every generated rule as unverified", () => {
    expect(DEADLINE_RULES.every((rule) => rule.verified === false)).toBe(true);
    const items = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(items.every((item) => item.verified === false)).toBe(true);
  });
});
