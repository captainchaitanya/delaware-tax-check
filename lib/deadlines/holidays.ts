/**
 * Candidate holiday lists. Every date is unverified.
 * verify against federalreserve.gov / india.gov.in before publishing
 */
import {
  addDays,
  isWeekend,
  toIsoDate,
  type CivilDate,
  type TimeZoneId,
} from "./civilDate";

export const HOLIDAYS_META = {
  verified: false as const,
  lastVerified: null,
  usSourceUrl: "https://www.federalreserve.gov/aboutthefed/k8.htm",
  indiaSourceUrl: "https://www.india.gov.in/calendar",
};

const US_HOLIDAYS = new Set([
  "2026-01-01",
  "2026-01-19",
  "2026-02-16",
  "2026-05-25",
  "2026-06-19",
  "2026-07-03",
  "2026-09-07",
  "2026-10-12",
  "2026-11-11",
  "2026-11-26",
  "2026-12-25",
  "2027-01-01",
  "2027-01-18",
  "2027-02-15",
  "2027-05-31",
  "2027-06-18",
  "2027-07-05",
  "2027-09-06",
  "2027-10-11",
  "2027-11-11",
  "2027-11-25",
  "2027-12-24",
]);

const INDIA_HOLIDAYS = new Set([
  "2026-01-26",
  "2026-03-04",
  "2026-08-15",
  "2026-10-02",
  "2026-11-08",
  "2026-12-25",
  "2027-01-26",
  "2027-08-15",
  "2027-10-02",
  "2027-12-25",
]);

export function isHoliday(date: CivilDate, timeZone: TimeZoneId): boolean {
  const iso = toIsoDate(date);
  return timeZone === "Asia/Kolkata"
    ? INDIA_HOLIDAYS.has(iso)
    : US_HOLIDAYS.has(iso);
}

export function nextBusinessDay(
  date: CivilDate,
  timeZone: TimeZoneId,
): CivilDate {
  let cursor = date;
  while (isWeekend(cursor) || isHoliday(cursor, timeZone)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}
