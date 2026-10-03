import { describe, expect, it } from "vitest";
import { SAMPLE_PROFILE } from "../profile";
import { generateDeadlines } from "./generate";
import { overdueCount, quarterCompletion, upcomingDeadlines } from "./stats";

describe("deadline stats", () => {
  const today = { year: 2026, month: 10, day: 3 };
  const items = generateDeadlines(SAMPLE_PROFILE, today, { lookbackDays: 90 });

  it("returns the next upcoming items, not overdue ones", () => {
    const next = upcomingDeadlines(items, 5);
    expect(next.length).toBeLessThanOrEqual(5);
    expect(next.every((item) => item.status !== "overdue")).toBe(true);
  });

  it("counts only unfinished overdue items", () => {
    const overdue = items.filter((item) => item.status === "overdue");
    expect(overdueCount(items, {})).toBe(overdue.length);
    if (overdue[0]) {
      expect(
        overdueCount(items, { [overdue[0].id]: { done: true, notes: "" } }),
      ).toBe(overdue.length - 1);
    }
  });

  it("computes this-quarter completion", () => {
    const stats = quarterCompletion(items, today, {});
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.done).toBe(0);
  });
});
