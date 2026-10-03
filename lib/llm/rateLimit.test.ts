import { describe, expect, it } from "vitest";
import { allowRequest, resetRateLimit } from "./rateLimit";

describe("rate limit", () => {
  it("allows five requests then blocks the sixth in the same minute", () => {
    resetRateLimit();
    const start = 1_000_000;
    for (let i = 0; i < 5; i += 1) {
      expect(allowRequest("1.1.1.1", 5, start + i)).toBe(true);
    }
    expect(allowRequest("1.1.1.1", 5, start + 10)).toBe(false);
    expect(allowRequest("2.2.2.2", 5, start + 10)).toBe(true);
    expect(allowRequest("1.1.1.1", 5, start + 60_001)).toBe(true);
  });
});
