/**
 * US federal holidays computed by rule (OPM / Federal Reserve K8 style).
 * Observed weekday shifts are included so next_business_day can skip them.
 * India holidays are not modeled.
 */
import {
  addDays,
  daysInMonth,
  isWeekend,
  toIsoDate,
  weekday,
  type CivilDate,
} from "./civilDate";

export const HOLIDAYS_META = {
  verified: false as const,
  lastVerified: null,
  usSourceUrl: "https://www.federalreserve.gov/aboutthefed/k8.htm",
};

/** 0 = Sunday … 6 = Saturday */
function nthWeekdayOfMonth(
  year: number,
  month: number,
  dow: number,
  n: number,
): CivilDate {
  const firstDow = weekday({ year, month, day: 1 });
  const day = 1 + ((dow - firstDow + 7) % 7) + (n - 1) * 7;
  return { year, month, day };
}

function lastWeekdayOfMonth(
  year: number,
  month: number,
  dow: number,
): CivilDate {
  const lastDay = daysInMonth(year, month);
  const lastDow = weekday({ year, month, day: lastDay });
  return { year, month, day: lastDay - ((lastDow - dow + 7) % 7) };
}

/** Calendar date plus Friday/Monday observed day when it falls on a weekend. */
function observedDates(date: CivilDate): CivilDate[] {
  const dow = weekday(date);
  if (dow === 6) {
    return [date, addDays(date, -1)];
  }
  if (dow === 0) {
    return [date, addDays(date, 1)];
  }
  return [date];
}

function uniqueDates(dates: CivilDate[]): CivilDate[] {
  const seen = new Set<string>();
  const out: CivilDate[] = [];
  for (const date of dates) {
    const iso = toIsoDate(date);
    if (seen.has(iso)) {
      continue;
    }
    seen.add(iso);
    out.push(date);
  }
  return out;
}

export function usFederalHolidays(year: number): CivilDate[] {
  return uniqueDates([
    ...observedDates({ year, month: 1, day: 1 }),
    nthWeekdayOfMonth(year, 1, 1, 3),
    nthWeekdayOfMonth(year, 2, 1, 3),
    lastWeekdayOfMonth(year, 5, 1),
    ...observedDates({ year, month: 6, day: 19 }),
    ...observedDates({ year, month: 7, day: 4 }),
    nthWeekdayOfMonth(year, 9, 1, 1),
    nthWeekdayOfMonth(year, 10, 1, 2),
    ...observedDates({ year, month: 11, day: 11 }),
    nthWeekdayOfMonth(year, 11, 4, 4),
    ...observedDates({ year, month: 12, day: 25 }),
  ]);
}

export function isUsFederalHoliday(date: CivilDate): boolean {
  const iso = toIsoDate(date);
  return [date.year - 1, date.year, date.year + 1].some((year) =>
    usFederalHolidays(year).some((holiday) => toIsoDate(holiday) === iso),
  );
}

export function nextBusinessDay(date: CivilDate): CivilDate {
  let cursor = date;
  while (isWeekend(cursor) || isUsFederalHoliday(cursor)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}
