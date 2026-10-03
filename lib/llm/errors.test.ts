import { describe, expect, it } from "vitest";
import {
  CONFIG_MESSAGE,
  INVALID_FORMAT_MESSAGE,
  QUOTA_EXHAUSTED_MESSAGE,
  providerErrorToExtractError,
  sanitizeErrorMessage,
} from "./errors";

describe("provider error mapping", () => {
  it("maps 429 to the quota message", () => {
    const mapped = providerErrorToExtractError(
      Object.assign(new Error("RESOURCE_EXHAUSTED"), { status: 429 }),
    );
    expect(mapped.code).toBe("quota");
    expect(mapped.message).toBe(QUOTA_EXHAUSTED_MESSAGE);
  });

  it("maps a missing model or bad key to the config message", () => {
    const missingModel = providerErrorToExtractError(
      Object.assign(
        new Error("This model models/gemini-2.5-flash is no longer available"),
        { status: 404 },
      ),
    );
    expect(missingModel.code).toBe("config");
    expect(missingModel.message).toBe(CONFIG_MESSAGE);

    const badKey = providerErrorToExtractError(
      Object.assign(new Error("API key not valid"), { status: 400 }),
    );
    expect(badKey.code).toBe("config");
    expect(badKey.message).toBe(CONFIG_MESSAGE);
  });

  it("redacts key-like values from debug strings", () => {
    expect(
      sanitizeErrorMessage("header AIzaSyDummyKeyValue1234567890 failed"),
    ).toContain("[redacted]");
    expect(INVALID_FORMAT_MESSAGE).toMatch(/expected format/i);
  });
});
