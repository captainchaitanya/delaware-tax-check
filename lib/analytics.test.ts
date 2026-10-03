import { describe, expect, it } from "vitest";
import { analyticsEnabled, savingsBucket } from "./analytics";

describe("analytics helpers", () => {
  it("stays disabled without a PostHog key", () => {
    expect(analyticsEnabled({})).toBe(false);
    expect(analyticsEnabled({ NEXT_PUBLIC_POSTHOG_KEY: "" })).toBe(false);
    expect(analyticsEnabled({ NEXT_PUBLIC_POSTHOG_KEY: "phc_test" })).toBe(true);
  });

  it("buckets savings without exposing the amount", () => {
    expect(savingsBucket(0)).toBe("none");
    expect(savingsBucket(400)).toBe("under_1k");
    expect(savingsBucket(4_000)).toBe("1k_to_10k");
    expect(savingsBucket(20_000)).toBe("10k_to_50k");
    expect(savingsBucket(80_000)).toBe("50k_plus");
  });
});
