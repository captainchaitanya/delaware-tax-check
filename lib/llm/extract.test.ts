import { describe, expect, it, vi } from "vitest";
import {
  BUSY_MESSAGE,
  CONFIG_MESSAGE,
  INVALID_FORMAT_MESSAGE,
  QUOTA_EXHAUSTED_MESSAGE,
} from "./errors";
import { extractDocument } from "./extract";
import { MAX_DOCUMENT_CHARS } from "./schema";
import { SAMPLE_DOCUMENTS } from "./samples";
import type { ExtractionResult } from "./schema";

const mockEnv = { LLM_PROVIDER: "mock" };
const liveEnv = { LLM_PROVIDER: "gemini", GEMINI_API_KEY: "test-key" };
const PASTED_NOTICE = `Registered-agent reminder: this Delaware franchise tax
notice is about authorized shares and the annual report. Please review
the enclosed statement and file before the date shown on your account.`;

const VALID_RESULT: ExtractionResult = {
  relevant: true,
  documentType: "delaware_franchise_tax_notice",
  issuer: "Delaware Division of Corporations",
  summary: "A franchise tax reminder for the annual report.",
  fields: [
    {
      key: "company",
      label: "Company",
      value: "Cedar Peak",
      quote: "Cedar Peak",
      confidence: "high",
    },
  ],
  shareClasses: [],
  deadline: null,
  requiredAction: "Review and file if needed.",
};

const noSleep = async () => undefined;

describe("extractDocument", () => {
  it("returns canned results for each sample in mock mode", async () => {
    for (const sample of SAMPLE_DOCUMENTS) {
      const outcome = await extractDocument(sample.text, mockEnv);
      expect(outcome.ok).toBe(true);
      if (outcome.ok) {
        expect(outcome.demoMode).toBe(true);
        expect(outcome.sampleResult).toBe(true);
        expect(outcome.provider).toBe("mock");
        expect(outcome.result.documentType).toBe(sample.result.documentType);
        expect(outcome.result.deadline?.isoDate).toBe(
          sample.result.deadline?.isoDate,
        );
      }
    }
  });

  it("rejects empty, oversized, and irrelevant text", async () => {
    const empty = await extractDocument("   ", mockEnv);
    expect(empty.ok).toBe(false);
    if (!empty.ok) {
      expect(empty.code).toBe("empty");
    }

    const huge = await extractDocument("x".repeat(MAX_DOCUMENT_CHARS + 1), mockEnv);
    expect(huge.ok).toBe(false);
    if (!huge.ok) {
      expect(huge.code).toBe("too_long");
    }

    const junk = await extractDocument(
      "hello there this is just a shopping list for apples",
      mockEnv,
    );
    expect(junk.ok).toBe(false);
    if (!junk.ok) {
      expect(junk.code).toBe("irrelevant");
    }
  });

  it("falls back to mock when gemini is selected without a key", async () => {
    const outcome = await extractDocument(SAMPLE_DOCUMENTS[0]!.text, {
      LLM_PROVIDER: "gemini",
    });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.provider).toBe("mock");
      expect(outcome.demoMode).toBe(true);
      expect(outcome.sampleResult).toBe(true);
    }
  });

  it("never calls the live provider for a built-in sample document", async () => {
    const callProvider = vi.fn(async () => {
      throw new Error("live provider should not run for samples");
    });
    for (const sample of SAMPLE_DOCUMENTS) {
      const outcome = await extractDocument(sample.text, liveEnv, {
        callProvider,
      });
      expect(outcome.ok).toBe(true);
      if (outcome.ok) {
        expect(outcome.sampleResult).toBe(true);
        expect(outcome.provider).toBe("mock");
        expect(outcome.result.documentType).toBe(sample.result.documentType);
      }
    }
    expect(callProvider).not.toHaveBeenCalled();
  });

  it("maps a 429 quota error to the friendly message", async () => {
    const outcome = await extractDocument(PASTED_NOTICE, liveEnv, {
      callProvider: async () => {
        throw Object.assign(new Error("RESOURCE_EXHAUSTED quota exceeded"), {
          status: 429,
        });
      },
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.code).toBe("quota");
      expect(outcome.error).toBe(QUOTA_EXHAUSTED_MESSAGE);
    }
  });

  it("maps a missing model to the config message", async () => {
    const outcome = await extractDocument(PASTED_NOTICE, liveEnv, {
      callProvider: async () => {
        throw Object.assign(
          new Error("This model models/gemini-2.5-flash is no longer available"),
          { status: 404 },
        );
      },
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.code).toBe("config");
      expect(outcome.error).toBe(CONFIG_MESSAGE);
    }
  });

  it("maps a validation failure to the format message", async () => {
    const outcome = await extractDocument(PASTED_NOTICE, liveEnv, {
      callProvider: async () => ({ relevant: true, documentType: "other" }),
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.code).toBe("invalid");
      expect(outcome.error).toBe(INVALID_FORMAT_MESSAGE);
    }
  });

  it("retries a 503 once and then succeeds", async () => {
    const callProvider = vi.fn(async () => {
      if (callProvider.mock.calls.length === 1) {
        throw Object.assign(new Error("UNAVAILABLE"), { status: 503 });
      }
      return VALID_RESULT;
    });
    const outcome = await extractDocument(PASTED_NOTICE, liveEnv, {
      callProvider,
      sleep: noSleep,
    });
    expect(outcome.ok).toBe(true);
    expect(callProvider).toHaveBeenCalledTimes(2);
  });

  it("tries the fallback model after three 503s", async () => {
    const callProvider = vi.fn(async (_id, _text, options) => {
      if (options?.model === "gemini-2.0-flash") {
        return VALID_RESULT;
      }
      throw Object.assign(new Error("UNAVAILABLE"), { status: 503 });
    });
    const outcome = await extractDocument(
      PASTED_NOTICE,
      { ...liveEnv, GEMINI_FALLBACK_MODEL: "gemini-2.0-flash" },
      { callProvider, sleep: noSleep },
    );
    expect(outcome.ok).toBe(true);
    expect(callProvider).toHaveBeenCalledTimes(4);
    expect(callProvider.mock.calls[3]?.[2]).toEqual({
      model: "gemini-2.0-flash",
    });
  });

  it("returns the busy message when retries and fallback fail", async () => {
    const callProvider = vi.fn(async () => {
      throw Object.assign(new Error("UNAVAILABLE"), { status: 503 });
    });
    const outcome = await extractDocument(
      PASTED_NOTICE,
      { ...liveEnv, GEMINI_FALLBACK_MODEL: "gemini-2.0-flash" },
      { callProvider, sleep: noSleep },
    );
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.code).toBe("busy");
      expect(outcome.error).toBe(BUSY_MESSAGE);
    }
    expect(callProvider).toHaveBeenCalledTimes(4);
  });

  it("does not retry a 404", async () => {
    const callProvider = vi.fn(async () => {
      throw Object.assign(
        new Error("This model models/gemini-2.5-flash is no longer available"),
        { status: 404 },
      );
    });
    const outcome = await extractDocument(PASTED_NOTICE, liveEnv, {
      callProvider,
      sleep: noSleep,
    });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.code).toBe("config");
      expect(outcome.error).toBe(CONFIG_MESSAGE);
    }
    expect(callProvider).toHaveBeenCalledTimes(1);
  });
});
