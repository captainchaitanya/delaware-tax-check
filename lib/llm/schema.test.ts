import { describe, expect, it } from "vitest";
import { SAMPLE_DOCUMENTS } from "./samples";
import {
  clipExtraction,
  clipQuote,
  extractionResultSchema,
} from "./schema";

describe("extraction schema", () => {
  it("accepts every canned sample result", () => {
    for (const sample of SAMPLE_DOCUMENTS) {
      const parsed = extractionResultSchema.safeParse(sample.result);
      expect(parsed.success).toBe(true);
    }
  });

  it("rejects a result missing required fields", () => {
    const parsed = extractionResultSchema.safeParse({
      relevant: true,
      documentType: "other",
    });
    expect(parsed.success).toBe(false);
  });

  it("clips source quotes to 15 words", () => {
    expect(clipQuote("one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen")).toBe(
      "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen",
    );
    const clipped = clipExtraction({
      ...SAMPLE_DOCUMENTS[0]!.result,
      fields: [
        {
          key: "long",
          label: "Long",
          value: "x",
          quote: "a b c d e f g h i j k l m n o p q",
          confidence: "low",
        },
      ],
    });
    expect(clipped.fields[0]?.quote.split(" ")).toHaveLength(15);
  });
});
