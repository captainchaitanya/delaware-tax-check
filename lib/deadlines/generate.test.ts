import { describe, expect, it } from "vitest";
import { SAMPLE_PROFILE } from "../profile";
import { civilDateInTimeZone, weekday } from "./civilDate";
import { generateDeadlines } from "./generate";
import { DEADLINE_RULES, type DeadlineRule } from "./rules";

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

  it("includes Form 5472 only when 25%+ foreign-owned with related-party transactions", () => {
    const owned = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(owned.some((item) => item.ruleId === "us-5472")).toBe(true);
    const domestic = generateDeadlines(
      { ...SAMPLE_PROFILE, foreignOwned25: false },
      TODAY,
    );
    expect(domestic.some((item) => item.ruleId === "us-5472")).toBe(false);
    const noTx = generateDeadlines(
      { ...SAMPLE_PROFILE, reportableRelatedPartyTransactions: false },
      TODAY,
    );
    expect(noTx.some((item) => item.ruleId === "us-5472")).toBe(false);
  });

  it("keeps the statutory Delaware March 1 date on a Sunday", () => {
    expect(weekday({ year: 2026, month: 3, day: 1 })).toBe(0);
    const items = generateDeadlines(SAMPLE_PROFILE, {
      year: 2026,
      month: 1,
      day: 15,
    });
    const annual = items.find(
      (item) => item.ruleId === "de-franchise-annual" && item.date.year === 2026,
    );
    expect(annual?.isoDate).toBe("2026-03-01");
    expect(annual?.effectiveDate).toBeNull();
    expect(annual?.rollConvention).toBe("unknown");
  });

  it("does not shift statutory deadlines for IST or US Pacific instants near midnight", () => {
    const justBeforeIstMidnight = new Date("2026-02-28T18:29:00.000Z");
    const justAfterIstMidnight = new Date("2026-02-28T18:30:00.000Z");
    const justBeforePstMidnight = new Date("2026-03-01T07:59:00.000Z");
    const justAfterPstMidnight = new Date("2026-03-01T08:00:00.000Z");

    expect(civilDateInTimeZone(justBeforeIstMidnight, "Asia/Kolkata")).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(civilDateInTimeZone(justAfterIstMidnight, "Asia/Kolkata")).toEqual({
      year: 2026,
      month: 3,
      day: 1,
    });
    expect(
      civilDateInTimeZone(justBeforePstMidnight, "America/Los_Angeles"),
    ).toEqual({ year: 2026, month: 2, day: 28 });
    expect(
      civilDateInTimeZone(justAfterPstMidnight, "America/Los_Angeles"),
    ).toEqual({ year: 2026, month: 3, day: 1 });

    const todays = [
      civilDateInTimeZone(justBeforeIstMidnight, "Asia/Kolkata"),
      civilDateInTimeZone(justAfterIstMidnight, "Asia/Kolkata"),
      civilDateInTimeZone(justBeforePstMidnight, "America/Los_Angeles"),
      civilDateInTimeZone(justAfterPstMidnight, "America/Los_Angeles"),
    ];

    for (const today of todays) {
      const annual = generateDeadlines(SAMPLE_PROFILE, today).find(
        (item) =>
          item.ruleId === "de-franchise-annual" && item.date.year === 2026,
      );
      expect(annual?.isoDate).toBe("2026-03-01");
    }
  });

  it("classifies the Delaware March 1 deadline from a late-February today", () => {
    const thisWeek = generateDeadlines(SAMPLE_PROFILE, {
      year: 2026,
      month: 2,
      day: 26,
    }).find(
      (item) => item.ruleId === "de-franchise-annual" && item.date.year === 2026,
    );
    expect(thisWeek?.isoDate).toBe("2026-03-01");
    expect(thisWeek?.status).toBe("thisWeek");

    const later = generateDeadlines(SAMPLE_PROFILE, {
      year: 2026,
      month: 2,
      day: 10,
    }).find(
      (item) => item.ruleId === "de-franchise-annual" && item.date.year === 2026,
    );
    expect(later?.isoDate).toBe("2026-03-01");
    expect(later?.status).toBe("later");
  });

  it("keeps a Saturday date when rollConvention is none", () => {
    expect(weekday({ year: 2026, month: 1, day: 31 })).toBe(6);
    const items = generateDeadlines(SAMPLE_PROFILE, {
      year: 2026,
      month: 1,
      day: 15,
    });
    const tds = items.find(
      (item) => item.ruleId === "in-tds" && item.isoDate === "2026-01-31",
    );
    expect(tds?.isoDate).toBe("2026-01-31");
    expect(tds?.effectiveDate).toBeNull();
    expect(tds?.rollConvention).toBe("none");
  });

  it("records a next business day without changing the statutory IRS date", () => {
    expect(weekday({ year: 2026, month: 1, day: 31 })).toBe(6);
    const items = generateDeadlines(
      { ...SAMPLE_PROFILE, paysUsContractors: true },
      {
        year: 2026,
        month: 1,
        day: 15,
      },
    );
    const nec = items.find(
      (item) => item.ruleId === "us-1099-nec" && item.date.year === 2026,
    );
    expect(nec?.isoDate).toBe("2026-01-31");
    expect(nec?.effectiveIsoDate).toBe("2026-02-02");
    expect(nec?.status).toBe("thisMonth");
  });

  it("assigns the initial per-rule roll conventions", () => {
    const convention = Object.fromEntries(
      DEADLINE_RULES.map((rule) => [rule.id, rule.rollConvention]),
    );
    expect(convention["us-1120"]).toBe("next_business_day");
    expect(convention["us-5472"]).toBe("next_business_day");
    expect(convention["us-1099-nec"]).toBe("next_business_day");
    expect(convention["de-franchise-annual"]).toBe("unknown");
    expect(convention["de-franchise-q-jun"]).toBe("unknown");
    expect(
      DEADLINE_RULES.filter((rule) => rule.jurisdiction === "India").every(
        (rule) => rule.rollConvention === "none",
      ),
    ).toBe(true);
    expect(DEADLINE_RULES.find((rule) => rule.id === "de-franchise-annual")?.status).toBe(
      "verified",
    );
    expect(DEADLINE_RULES.find((rule) => rule.id === "in-fla")?.status).toBe(
      "reviewed",
    );
    expect(DEADLINE_RULES.find((rule) => rule.id === "in-agm")?.status).toBe(
      "unverified",
    );
  });

  it("does not use an effective date for sorting or chips", () => {
    const saturdayRule: DeadlineRule = {
      id: "test-saturday-none",
      title: "Saturday none",
      jurisdiction: "India",
      timeZone: "Asia/Kolkata",
      appliesTo: { type: "always" },
      appliesLabel: "Test",
      schedule: { kind: "fixed", month: 1, day: 31 },
      whatThisIs: "Test",
      ifMissed: "Test",
      sources: ["https://example.com"],
      status: "unverified",
      lastChecked: null,
      notes: "",
      rollConvention: "none",
    };
    const items = generateDeadlines(
      SAMPLE_PROFILE,
      { year: 2026, month: 1, day: 15 },
      { rules: [saturdayRule] },
    );
    expect(items[0]?.isoDate).toBe("2026-01-31");
    expect(weekday(items[0]!.date)).toBe(6);
    expect(items[0]?.effectiveDate).toBeNull();
  });

  it("places Form 1120 on April 15 after a December 31 year end", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, { year: 2026, month: 1, day: 2 });
    const form = items.find(
      (item) => item.ruleId === "us-1120" && item.date.year === 2026,
    );
    expect(form?.isoDate).toBe("2026-04-15");
    const related = items.find(
      (item) => item.ruleId === "us-5472" && item.date.year === 2026,
    );
    expect(related?.isoDate).toBe("2026-04-15");
  });

  it("places Form 1120 on September 15 after a June 30 year end", () => {
    const profile = {
      ...SAMPLE_PROFILE,
      usTaxYearEnd: { month: 6, day: 30 },
    };
    const items = generateDeadlines(profile, { year: 2026, month: 1, day: 2 });
    const form = items.find(
      (item) => item.ruleId === "us-1120" && item.isoDate.startsWith("2026"),
    );
    expect(form?.isoDate).toBe("2026-09-15");
    const related = items.find(
      (item) => item.ruleId === "us-5472" && item.isoDate.startsWith("2026"),
    );
    expect(related?.isoDate).toBe("2026-09-15");
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
    expect(mgt?.isoDate).toBe("2026-11-29");
  });

  it("skips quarterly Delaware estimates when tax is under $5,000", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(items.some((item) => item.ruleId.startsWith("de-franchise-q"))).toBe(
      false,
    );
  });

  it("emits one DIR-3 KYC per director on 30 June after the third FY", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, {
      year: 2028,
      month: 1,
      day: 15,
    });
    const kyc = items.filter(
      (item) => item.ruleId === "in-dir3-kyc" && item.isoDate === "2028-06-30",
    );
    expect(kyc.map((item) => item.title)).toEqual([
      "DIR-3 KYC — Director 1",
      "DIR-3 KYC — Director 2",
    ]);

    const laterAllotment = generateDeadlines(
      {
        ...SAMPLE_PROFILE,
        india: {
          ...SAMPLE_PROFILE.india!,
          directorDinFyEnds: [2026, 2026],
        },
      },
      { year: 2029, month: 1, day: 15 },
    );
    expect(
      laterAllotment.filter(
        (item) => item.ruleId === "in-dir3-kyc" && item.isoDate === "2029-06-30",
      ),
    ).toHaveLength(2);

    const fy2627 = generateDeadlines(
      {
        ...SAMPLE_PROFILE,
        india: {
          ...SAMPLE_PROFILE.india!,
          directorDinFyEnds: [2027],
          directorCount: 1,
        },
      },
      { year: 2030, month: 1, day: 15 },
    );
    expect(
      fy2627.find((item) => item.ruleId === "in-dir3-kyc")?.isoDate,
    ).toBe("2030-06-30");
  });

  it("moves the company ITR to 30 November when Form 3CEB applies", () => {
    const withTp = generateDeadlines(SAMPLE_PROFILE, {
      year: 2026,
      month: 9,
      day: 1,
    });
    expect(
      withTp.find((item) => item.ruleId === "in-itr" && item.date.year === 2026)
        ?.isoDate,
    ).toBe("2026-11-30");
    expect(
      withTp.some(
        (item) => item.ruleId === "in-3ceb" && item.isoDate === "2026-10-31",
      ),
    ).toBe(true);

    const noTp = generateDeadlines(
      {
        ...SAMPLE_PROFILE,
        india: { ...SAMPLE_PROFILE.india!, transactsWithUsParent: false },
      },
      { year: 2026, month: 9, day: 1 },
    );
    expect(
      noTp.find((item) => item.ruleId === "in-itr" && item.date.year === 2026)
        ?.isoDate,
    ).toBe("2026-10-31");
    expect(noTp.some((item) => item.ruleId === "in-3ceb")).toBe(false);
  });

  it("places the ODI APR on 31 December", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(
      items.find((item) => item.ruleId === "in-odi-apr" && item.date.year === 2026)
        ?.isoDate,
    ).toBe("2026-12-31");
  });

  it("can include overdue items with a lookback window", () => {
    const none = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(none.some((item) => item.status === "overdue")).toBe(false);
    const withLookback = generateDeadlines(SAMPLE_PROFILE, TODAY, {
      lookbackDays: 90,
    });
    expect(withLookback.some((item) => item.status === "overdue")).toBe(true);
  });

  it("keeps a document deadline on its statutory Saturday with no roll", () => {
    expect(weekday({ year: 2026, month: 1, day: 31 })).toBe(6);
    const items = generateDeadlines(SAMPLE_PROFILE, {
      year: 2026,
      month: 1,
      day: 15,
    }, {
      customDeadlines: [
        {
          id: "custom:doc-saturday",
          title: "Reply to MCA notice",
          isoDate: "2026-01-31",
          jurisdiction: "India",
          whatThisIs: "From the pasted notice.",
          ifMissed: "Check the notice.",
          source: "document",
          documentId: "doc-1",
        },
      ],
    });
    const custom = items.find((item) => item.id === "custom:doc-saturday");
    expect(custom?.isoDate).toBe("2026-01-31");
    expect(custom?.rollConvention).toBe("none");
    expect(custom?.effectiveDate).toBeNull();
    expect(custom?.origin).toBe("document");
    expect(custom?.appliesLabel).toBe("From your document");
  });

  it("copies verification status from each rule", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, TODAY);
    expect(
      items.find((item) => item.ruleId === "us-1120")?.verificationStatus,
    ).toBe("verified");
    expect(
      items.find((item) => item.ruleId === "in-odi-apr")?.verificationStatus,
    ).toBe("reviewed");
    expect(
      items.find((item) => item.ruleId === "in-gstr1")?.verificationStatus,
    ).toBe("unverified");
  });
});
