import { describe, expect, it } from "vitest";
import { greetingFor } from "./greeting";

describe("greetingFor", () => {
  it("uses the time of day and company name", () => {
    expect(greetingFor("Northbridge Labs, Inc.", new Date("2026-10-03T09:00:00"))).toBe(
      "Good morning, Northbridge Labs, Inc.",
    );
    expect(greetingFor("Northbridge Labs, Inc.", new Date("2026-10-03T15:00:00"))).toBe(
      "Good afternoon, Northbridge Labs, Inc.",
    );
    expect(greetingFor("Northbridge Labs, Inc.", new Date("2026-10-03T20:00:00"))).toBe(
      "Good evening, Northbridge Labs, Inc.",
    );
  });
});
