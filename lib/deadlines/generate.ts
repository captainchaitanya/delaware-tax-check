import { franchiseEstimateFromProfile } from "../franchiseEstimate";
import type { CompanyProfile } from "../profile";
import {
  addDays,
  addMonths,
  compareCivilDates,
  daysInMonth,
  parseIsoDate,
  sameMonth,
  toIsoDate,
  type CivilDate,
  type TimeZoneId,
} from "./civilDate";
import type { CustomDeadline } from "./custom";
import { nextBusinessDay } from "./holidays";
import {
  DEADLINE_RULES,
  ruleApplies,
  type DeadlineRule,
  type Jurisdiction,
  type RollConvention,
} from "./rules";

export type DeadlineStatus = "overdue" | "thisWeek" | "thisMonth" | "later";

export type GeneratedDeadline = {
  id: string;
  ruleId: string;
  title: string;
  date: CivilDate;
  isoDate: string;
  jurisdiction: Jurisdiction;
  timeZone: TimeZoneId;
  whatThisIs: string;
  ifMissed: string;
  appliesLabel: string;
  sourceUrl: string;
  verified: false;
  lastVerified: null;
  status: DeadlineStatus;
  amountDollars: number | null;
  rollConvention: RollConvention;
  effectiveDate: CivilDate | null;
  effectiveIsoDate: string | null;
  origin: "rule" | "document" | "manual";
  documentId: string | null;
};

export type GenerateOptions = {
  lookbackDays?: number;
  rules?: DeadlineRule[];
  customDeadlines?: CustomDeadline[];
};

function asCivilDate(today: CivilDate | string): CivilDate {
  return typeof today === "string" ? parseIsoDate(today) : today;
}

function fyEndOnOrBefore(
  today: CivilDate,
  month: number,
  day: number,
): CivilDate {
  const candidate = {
    year: today.year,
    month,
    day: Math.min(day, daysInMonth(today.year, month)),
  };
  if (compareCivilDates(candidate, today) <= 0) {
    return candidate;
  }
  const year = today.year - 1;
  return {
    year,
    month,
    day: Math.min(day, daysInMonth(year, month)),
  };
}

function usFyEnds(profile: CompanyProfile, today: CivilDate): CivilDate[] {
  const { month, day } = profile.usTaxYearEnd;
  const latest = fyEndOnOrBefore(today, month, day);
  return [
    { ...latest, year: latest.year - 1 },
    latest,
    { ...latest, year: latest.year + 1 },
    { ...latest, year: latest.year + 2 },
  ];
}

function indiaFyEnds(today: CivilDate): CivilDate[] {
  const latest = fyEndOnOrBefore(today, 3, 31);
  return [
    { ...latest, year: latest.year - 1 },
    latest,
    { ...latest, year: latest.year + 1 },
    { ...latest, year: latest.year + 2 },
  ];
}

function clampDay(year: number, month: number, day: number): CivilDate {
  return { year, month, day: Math.min(day, daysInMonth(year, month)) };
}

function effectiveFor(
  statutory: CivilDate,
  convention: RollConvention,
): CivilDate | null {
  if (convention !== "next_business_day") {
    return null;
  }
  const next = nextBusinessDay(statutory);
  return compareCivilDates(next, statutory) === 0 ? null : next;
}

function rawDatesForRule(
  rule: DeadlineRule,
  profile: CompanyProfile,
  today: CivilDate,
  resolved: Map<string, CivilDate[]>,
): CivilDate[] {
  const schedule = rule.schedule;
  switch (schedule.kind) {
    case "fixed": {
      return [-1, 0, 1, 2].map((offset) =>
        clampDay(today.year + offset, schedule.month, schedule.day),
      );
    }
    case "monthsAfterFyEnd": {
      const ends =
        schedule.fy === "us" ? usFyEnds(profile, today) : indiaFyEnds(today);
      return ends.map((end) =>
        addMonths(
          { year: end.year, month: end.month, day: schedule.day },
          schedule.months,
        ),
      );
    }
    case "daysAfterFyEnd": {
      const ends =
        schedule.fy === "us" ? usFyEnds(profile, today) : indiaFyEnds(today);
      return ends.map((end) => addDays(end, schedule.days));
    }
    case "monthly": {
      const dates: CivilDate[] = [];
      for (let i = -2; i <= 14; i += 1) {
        const month = addMonths({ ...today, day: 1 }, i);
        const target = schedule.followingMonth
          ? addMonths(month, 1)
          : month;
        dates.push(clampDay(target.year, target.month, schedule.day));
      }
      return dates;
    }
    case "quarterly": {
      const dates: CivilDate[] = [];
      for (const offset of [-1, 0, 1, 2]) {
        for (const slot of schedule.monthDays) {
          dates.push(clampDay(today.year + offset, slot.month, slot.day));
        }
      }
      return dates;
    }
    case "relative": {
      const bases = resolved.get(schedule.afterRuleId) ?? [];
      return bases.map((base) => addDays(base, schedule.days));
    }
    case "perDirector": {
      const count = profile.india?.directorCount ?? 1;
      const years = [-1, 0, 1, 2].map((offset) =>
        clampDay(today.year + offset, schedule.month, schedule.day),
      );
      return years.flatMap((date) => Array.from({ length: count }, () => date));
    }
    default:
      return [];
  }
}

export function statusFor(date: CivilDate, today: CivilDate): DeadlineStatus {
  if (compareCivilDates(date, today) < 0) {
    return "overdue";
  }
  const weekOut = addDays(today, 7);
  if (compareCivilDates(date, weekOut) <= 0) {
    return "thisWeek";
  }
  if (sameMonth(date, today)) {
    return "thisMonth";
  }
  return "later";
}

function amountFor(
  rule: DeadlineRule,
  estimate: ReturnType<typeof franchiseEstimateFromProfile>,
): number | null {
  if (!estimate || rule.jurisdiction !== "US-Delaware") {
    return null;
  }
  if (rule.id === "de-franchise-annual") {
    return estimate.filingTotal;
  }
  if (rule.id === "de-franchise-q-jun") {
    return Math.round(estimate.tax * 0.4);
  }
  if (rule.id === "de-franchise-q-sep" || rule.id === "de-franchise-q-dec") {
    return Math.round(estimate.tax * 0.2);
  }
  return null;
}

export function generateDeadlines(
  profile: CompanyProfile,
  todayInput: CivilDate | string,
  options: GenerateOptions = {},
): GeneratedDeadline[] {
  const today = asCivilDate(todayInput);
  const lookbackDays = options.lookbackDays ?? 0;
  const windowStart = addDays(today, -lookbackDays);
  const windowEnd = addDays(addMonths(today, 12), -1);
  const rules = options.rules ?? DEADLINE_RULES;
  const estimate = franchiseEstimateFromProfile(profile);
  const franchiseTax = estimate?.tax ?? null;

  const applicable = rules.filter((rule) =>
    ruleApplies(rule.appliesTo, profile, franchiseTax),
  );

  const independents = applicable.filter(
    (rule) => rule.schedule.kind !== "relative",
  );
  const dependents = applicable.filter(
    (rule) => rule.schedule.kind === "relative",
  );

  const statutoryByRule = new Map<string, CivilDate[]>();
  const items: GeneratedDeadline[] = [];

  function pushRule(rule: DeadlineRule) {
    const statutory = rawDatesForRule(rule, profile, today, statutoryByRule);
    statutoryByRule.set(rule.id, statutory);

    if (rule.schedule.kind === "perDirector") {
      const count = profile.india?.directorCount ?? 1;
      statutory.forEach((date, index) => {
        const director = (index % count) + 1;
        pushItem(rule, date, `${rule.id}:${toIsoDate(date)}:d${director}`, `${rule.title} — Director ${director}`);
      });
      return;
    }

    const seen = new Set<string>();
    for (const date of statutory) {
      const iso = toIsoDate(date);
      if (seen.has(iso)) {
        continue;
      }
      seen.add(iso);
      pushItem(rule, date, `${rule.id}:${iso}`, rule.title);
    }
  }

  function pushItem(
    rule: DeadlineRule,
    date: CivilDate,
    id: string,
    title: string,
  ) {
    if (
      compareCivilDates(date, windowStart) < 0 ||
      compareCivilDates(date, windowEnd) > 0
    ) {
      return;
    }
    const effectiveDate = effectiveFor(date, rule.rollConvention);
    items.push({
      id,
      ruleId: rule.id,
      title,
      date,
      isoDate: toIsoDate(date),
      jurisdiction: rule.jurisdiction,
      timeZone: rule.timeZone,
      whatThisIs: rule.whatThisIs,
      ifMissed: rule.ifMissed,
      appliesLabel: rule.appliesLabel,
      sourceUrl: rule.sourceUrl,
      verified: false,
      lastVerified: null,
      status: statusFor(date, today),
      amountDollars: amountFor(rule, estimate),
      rollConvention: rule.rollConvention,
      effectiveDate,
      effectiveIsoDate: effectiveDate ? toIsoDate(effectiveDate) : null,
      origin: "rule",
      documentId: null,
    });
  }

  for (const rule of independents) {
    pushRule(rule);
  }
  for (const rule of dependents) {
    pushRule(rule);
  }

  for (const custom of options.customDeadlines ?? []) {
    items.push(customToGenerated(custom, today));
  }

  return items.sort((a, b) => {
    const byDate = compareCivilDates(a.date, b.date);
    return byDate !== 0 ? byDate : a.title.localeCompare(b.title);
  });
}

export function customToGenerated(
  custom: CustomDeadline,
  today: CivilDate,
): GeneratedDeadline {
  const date = parseIsoDate(custom.isoDate);
  return {
    id: custom.id,
    ruleId: "custom",
    title: custom.title,
    date,
    isoDate: toIsoDate(date),
    jurisdiction: custom.jurisdiction,
    timeZone: custom.jurisdiction === "India" ? "Asia/Kolkata" : "America/New_York",
    whatThisIs: custom.whatThisIs,
    ifMissed: custom.ifMissed,
    appliesLabel:
      custom.source === "document" ? "From your document" : "Added by you",
    sourceUrl: "",
    verified: false,
    lastVerified: null,
    status: statusFor(date, today),
    amountDollars: null,
    rollConvention: "none",
    effectiveDate: null,
    effectiveIsoDate: null,
    origin: custom.source,
    documentId: custom.documentId,
  };
}
