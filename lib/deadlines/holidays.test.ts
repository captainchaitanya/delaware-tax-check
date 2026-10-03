import { describe, expect, it } from "vitest";
import { toIsoDate, weekday } from "./civilDate";
import {
  isUsFederalHoliday,
  nextBusinessDay,
  usFederalHolidays,
} from "./holidays";

function isos(year: number): string[] {
  return usFederalHolidays(year).map(toIsoDate).sort();
}

describe("US federal holidays", () => {
  it("computes 2026 holidays by rule, including observed Independence Day", () => {
    expect(weekday({ year: 2026, month: 7, day: 4 })).toBe(6);
    expect(isos(2026)).toEqual(
      expect.arrayContaining([
        "2026-01-01",
        "2026-01-19",
        "2026-02-16",
        "2026-05-25",
        "2026-06-19",
        "2026-07-03",
        "2026-07-04",
        "2026-09-07",
        "2026-10-12",
        "2026-11-11",
        "2026-11-26",
        "2026-12-25",
      ]),
    );
  });

  it("computes 2027 holidays by rule, including observed Juneteenth and Christmas", () => {
    expect(weekday({ year: 2027, month: 6, day: 19 })).toBe(6);
    expect(weekday({ year: 2027, month: 12, day: 25 })).toBe(6);
    expect(isos(2027)).toEqual(
      expect.arrayContaining([
        "2027-01-01",
        "2027-01-18",
        "2027-02-15",
        "2027-05-31",
        "2027-06-18",
        "2027-06-19",
        "2027-07-04",
        "2027-07-05",
        "2027-09-06",
        "2027-10-11",
        "2027-11-11",
        "2027-11-25",
        "2027-12-24",
        "2027-12-25",
      ]),
    );
  });

  it("treats New Year observed onto the prior December as a holiday", () => {
    expect(weekday({ year: 2022, month: 1, day: 1 })).toBe(6);
    expect(isUsFederalHoliday({ year: 2021, month: 12, day: 31 })).toBe(true);
    expect(nextBusinessDay({ year: 2021, month: 12, day: 31 })).toEqual({
      year: 2022,
      month: 1,
      day: 3,
    });
  });
});
