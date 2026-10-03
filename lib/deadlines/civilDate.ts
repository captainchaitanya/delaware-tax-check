export type CivilDate = {
  year: number;
  month: number;
  day: number;
};

export type TimeZoneId = "America/New_York" | "Asia/Kolkata";

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  const lengths = [
    31,
    isLeapYear(year) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return lengths[month - 1] ?? 0;
}

export function isValidCivilDate(date: CivilDate): boolean {
  return (
    date.month >= 1 &&
    date.month <= 12 &&
    date.day >= 1 &&
    date.day <= daysInMonth(date.year, date.month)
  );
}

export function toIsoDate(date: CivilDate): string {
  return `${String(date.year).padStart(4, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function parseIsoDate(iso: string): CivilDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    throw new Error(`Invalid date: ${iso}`);
  }
  const date = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
  };
  if (!isValidCivilDate(date)) {
    throw new Error(`Invalid date: ${iso}`);
  }
  return date;
}

export function compareCivilDates(a: CivilDate, b: CivilDate): number {
  return toIsoDate(a).localeCompare(toIsoDate(b));
}

export function addDays(date: CivilDate, days: number): CivilDate {
  let year = date.year;
  let month = date.month;
  let day = date.day + days;
  while (day > daysInMonth(year, month)) {
    day -= daysInMonth(year, month);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  while (day < 1) {
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    day += daysInMonth(year, month);
  }
  return { year, month, day };
}

export function addMonths(date: CivilDate, months: number): CivilDate {
  const index = date.month - 1 + months;
  const year = date.year + Math.floor(index / 12);
  const month = ((index % 12) + 12) % 12 + 1;
  const day = Math.min(date.day, daysInMonth(year, month));
  return { year, month, day };
}

/** 0 = Sunday … 6 = Saturday. Sakamoto's method — no timezone involved. */
export function weekday(date: CivilDate): number {
  const offsets = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  let year = date.year;
  if (date.month < 3) {
    year -= 1;
  }
  return (
    (year +
      Math.floor(year / 4) -
      Math.floor(year / 100) +
      Math.floor(year / 400) +
      offsets[date.month - 1]! +
      date.day) %
    7
  );
}

export function isWeekend(date: CivilDate): boolean {
  const day = weekday(date);
  return day === 0 || day === 6;
}

export function civilDateInTimeZone(
  instant: Date,
  timeZone: TimeZoneId | "America/Los_Angeles",
): CivilDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(instant);
  const read = (type: string) =>
    Number(parts.find((part) => part.type === type)?.value);
  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

export function sameMonth(a: CivilDate, b: CivilDate): boolean {
  return a.year === b.year && a.month === b.month;
}

export function formatCivilDate(date: CivilDate): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(date.year, date.month - 1, date.day)));
}

export function quarterOf(date: CivilDate): { year: number; quarter: number } {
  return { year: date.year, quarter: Math.ceil(date.month / 3) };
}

export function sameQuarter(a: CivilDate, b: CivilDate): boolean {
  const left = quarterOf(a);
  const right = quarterOf(b);
  return left.year === right.year && left.quarter === right.quarter;
}
