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

  it("coerces numeric strings and YYYY-MM-DD prefixes without accepting garbage", () => {
    const parsed = extractionResultSchema.safeParse({
      relevant: true,
      documentType: "other",
      issuer: "Agent",
      summary: "A notice",
      fields: [
        {
          key: "tax",
          label: "Tax",
          value: 400,
          quote: "tax 400",
          confidence: "high",
        },
      ],
      shareClasses: [
        {
          name: "Common",
          authorized: 1000,
          parValue: 0.00001,
          quote: "1000 shares",
          confidence: "medium",
        },
      ],
      deadline: {
        title: "Due",
        isoDate: "2027-03-01T15:04:05Z",
        action: "File",
        quote: "due 2027-03-01",
        confidence: "high",
      },
      requiredAction: "File",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.fields[0]?.value).toBe("400");
      expect(parsed.data.shareClasses[0]?.authorized).toBe("1000");
      expect(parsed.data.deadline?.isoDate).toBe("2027-03-01");
    }

    const garbage = extractionResultSchema.safeParse({
      relevant: true,
      documentType: "other",
      issuer: "Agent",
      summary: "A notice",
      fields: [],
      shareClasses: [],
      deadline: {
        title: "Due",
        isoDate: "March 1, 2027",
        action: "File",
        quote: "March",
        confidence: "high",
      },
      requiredAction: "File",
    });
    expect(garbage.success).toBe(false);
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
