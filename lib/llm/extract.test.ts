import { describe, expect, it } from "vitest";
import { extractDocument } from "./extract";
import { MAX_DOCUMENT_CHARS } from "./schema";
import { SAMPLE_DOCUMENTS } from "./samples";

const mockEnv = { LLM_PROVIDER: "mock" };

describe("extractDocument", () => {
  it("returns canned results for each sample in mock mode", async () => {
    for (const sample of SAMPLE_DOCUMENTS) {
      const outcome = await extractDocument(sample.text, mockEnv);
      expect(outcome.ok).toBe(true);
      if (outcome.ok) {
        expect(outcome.demoMode).toBe(true);
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
    }
  });
});
