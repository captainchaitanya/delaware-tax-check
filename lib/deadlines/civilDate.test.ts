import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  civilDateInTimeZone,
  daysInMonth,
  isLeapYear,
  weekday,
} from "./civilDate";

describe("civil dates", () => {
  it("handles leap years and month-end offsets", () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2023)).toBe(false);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(addMonths({ year: 2026, month: 1, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 2,
      day: 28,
    });
    expect(addMonths({ year: 2024, month: 1, day: 31 }, 1)).toEqual({
      year: 2024,
      month: 2,
      day: 29,
    });
    expect(addDays({ year: 2026, month: 3, day: 31 }, 1)).toEqual({
      year: 2026,
      month: 4,
      day: 1,
    });
  });

  it("computes weekdays without a timezone", () => {
    // 1 March 2026 is a Sunday
    expect(weekday({ year: 2026, month: 3, day: 1 })).toBe(0);
    // 3 October 2026 is a Saturday
    expect(weekday({ year: 2026, month: 10, day: 3 })).toBe(6);
  });

  it("resolves an instant into different jurisdiction calendar dates", () => {
    const instant = new Date("2026-10-03T22:00:00.000Z");
    expect(civilDateInTimeZone(instant, "America/New_York")).toEqual({
      year: 2026,
      month: 10,
      day: 3,
    });
    expect(civilDateInTimeZone(instant, "Asia/Kolkata")).toEqual({
      year: 2026,
      month: 10,
      day: 4,
    });
  });
});
