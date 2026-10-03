import { describe, expect, it } from "vitest";
import { SAMPLE_PROFILE } from "../profile";
import { deadlinesByMonth } from "./chart";
import { generateDeadlines } from "./generate";

describe("deadlinesByMonth", () => {
  it("returns twelve month buckets starting from today", () => {
    const today = { year: 2026, month: 10, day: 3 };
    const items = generateDeadlines(SAMPLE_PROFILE, today);
    const buckets = deadlinesByMonth(items, today);
    expect(buckets).toHaveLength(12);
    expect(buckets[0]).toMatchObject({ year: 2026, month: 10 });
    expect(buckets[11]).toMatchObject({ year: 2027, month: 9 });
    expect(buckets.every((bucket) => bucket.count >= 0)).toBe(true);
    expect(buckets.some((bucket) => bucket.count > 0)).toBe(true);
  });
});
