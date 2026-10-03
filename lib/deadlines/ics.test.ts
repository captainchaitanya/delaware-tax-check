import { describe, expect, it } from "vitest";
import { SAMPLE_PROFILE } from "../profile";
import { generateDeadlines } from "./generate";
import { deadlinesToIcs } from "./ics";

describe("deadlinesToIcs", () => {
  it("builds an all-day calendar file from the filtered set", () => {
    const items = generateDeadlines(SAMPLE_PROFILE, "2026-10-03").slice(0, 2);
    const ics = deadlinesToIcs(items);
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics).toContain("DTSTART;VALUE=DATE:");
    expect(ics).toContain(items[0]?.title ?? "missing");
    expect(ics).toContain("END:VCALENDAR");
  });
});
