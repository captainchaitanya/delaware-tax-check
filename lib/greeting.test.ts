import { describe, expect, it } from "vitest";
import { greetingFor } from "./greeting";

describe("greetingFor", () => {
  it("uses the first name when present", () => {
    expect(
      greetingFor(
        "Northbridge Labs, Inc.",
        new Date("2026-10-03T20:00:00"),
        "Anika",
      ),
    ).toBe("Good evening, Anika");
  });

  it("falls back to the company desk when first name is missing", () => {
    expect(
      greetingFor("Northbridge Labs, Inc.", new Date("2026-10-03T09:00:00")),
    ).toBe("Good morning. Here's Northbridge Labs, Inc.'s desk.");
    expect(
      greetingFor("Northbridge Labs, Inc.", new Date("2026-10-03T15:00:00"), "  "),
    ).toBe("Good afternoon. Here's Northbridge Labs, Inc.'s desk.");
  });
});
