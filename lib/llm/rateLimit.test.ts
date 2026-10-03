import { describe, expect, it } from "vitest";
import { QUOTA_EXHAUSTED_MESSAGE } from "./errors";
import {
  allowRequest,
  canLiveExtract,
  DAILY_LIVE_CAP,
  dailyLiveCap,
  recordLiveExtraction,
  resetDailyCap,
  resetRateLimit,
} from "./rateLimit";

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

  it("caps successful live extractions at 15 per UTC day", () => {
    resetDailyCap();
    const noon = Date.UTC(2026, 9, 3, 12, 0, 0);
    for (let i = 0; i < DAILY_LIVE_CAP; i += 1) {
      expect(canLiveExtract(DAILY_LIVE_CAP, noon + i)).toBe(true);
      recordLiveExtraction(DAILY_LIVE_CAP, noon + i);
    }
    expect(canLiveExtract(DAILY_LIVE_CAP, noon + 100)).toBe(false);
    expect(canLiveExtract(DAILY_LIVE_CAP, noon + 86_400_000)).toBe(true);
    expect(QUOTA_EXHAUSTED_MESSAGE).toMatch(/sample document/i);
  });

  it("reads AI_DAILY_CAP when set", () => {
    expect(dailyLiveCap({})).toBe(15);
    expect(dailyLiveCap({ AI_DAILY_CAP: "8" })).toBe(8);
    expect(dailyLiveCap({ AI_DAILY_CAP: "nope" })).toBe(15);
  });
});
