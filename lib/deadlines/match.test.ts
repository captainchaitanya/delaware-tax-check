import { describe, expect, it } from "vitest";
import { SAMPLE_DOCUMENTS } from "../llm/samples";
import { SAMPLE_PROFILE } from "../profile";
import { generateDeadlines } from "./generate";
import { matchDocumentToBuiltInRule } from "./match";

const TODAY = { year: 2026, month: 10, day: 3 };

describe("document-to-rule matching", () => {
  it("matches an AOC-4 notice to the built-in AOC-4 occurrence", () => {
    const notice = SAMPLE_DOCUMENTS.find((sample) => sample.id === "mca-notice");
    const items = generateDeadlines(SAMPLE_PROFILE, TODAY, { lookbackDays: 180 });
    const match = matchDocumentToBuiltInRule(
      notice!.result,
      "Form AOC-4 Filing Deadline",
      "2026-10-26",
      items,
    );
    expect(match).toMatchObject({
      ruleId: "in-aoc4",
      originalIsoDate: "2026-10-30",
      newIsoDate: "2026-10-26",
    });
  });

  it("applies an override and can revert to the standard date", () => {
    const override = {
      id: "override:in-aoc4:2026-10-30",
      ruleId: "in-aoc4",
      originalIsoDate: "2026-10-30",
      isoDate: "2026-10-26",
      documentId: "doc-aoc4",
    };
    const applied = generateDeadlines(SAMPLE_PROFILE, TODAY, {
      lookbackDays: 180,
      overrides: [override],
    });
    const updated = applied.find(
      (item) => item.ruleId === "in-aoc4" && item.standardIsoDate === "2026-10-30",
    );
    expect(updated).toMatchObject({
      isoDate: "2026-10-26",
      appliesLabel: "From your document",
      origin: "document",
      rollConvention: "none",
      standardIsoDate: "2026-10-30",
    });
    expect(
      applied.filter(
        (item) => item.ruleId === "in-aoc4" && item.date.year === 2026,
      ),
    ).toHaveLength(1);

    const reverted = generateDeadlines(SAMPLE_PROFILE, TODAY, {
      lookbackDays: 180,
      overrides: [],
    });
    expect(
      reverted.find((item) => item.ruleId === "in-aoc4" && item.date.year === 2026)
        ?.isoDate,
    ).toBe("2026-10-30");
  });

  it("matches MGT-7, Form 1120, and Delaware franchise tax notices", () => {
    const mgtItems = generateDeadlines(SAMPLE_PROFILE, TODAY, {
      lookbackDays: 180,
    });
    expect(
      matchDocumentToBuiltInRule(
        {
          relevant: true,
          documentType: "mca_roc_notice",
          issuer: "MCA",
          summary: "MGT-7 annual return reminder",
          fields: [],
          shareClasses: [],
          deadline: {
            title: "MGT-7",
            isoDate: "2026-11-20",
            action: "File MGT-7",
            quote: "MGT-7",
            confidence: "high",
          },
          requiredAction: "File MGT-7",
        },
        "MGT-7 annual return",
        "2026-11-20",
        mgtItems,
      ),
    ).toMatchObject({
      ruleId: "in-mgt7",
      originalIsoDate: "2026-11-29",
      newIsoDate: "2026-11-20",
    });

    const items = generateDeadlines(SAMPLE_PROFILE, { year: 2026, month: 1, day: 2 });
    const irs = SAMPLE_DOCUMENTS.find((sample) => sample.id === "irs-letter");
    expect(
      matchDocumentToBuiltInRule(
        irs!.result,
        "Federal corporate income tax return (Form 1120)",
        "2026-04-10",
        items,
      ),
    ).toMatchObject({
      ruleId: "us-1120",
      originalIsoDate: "2026-04-15",
      newIsoDate: "2026-04-10",
    });

    const franchise = SAMPLE_DOCUMENTS.find(
      (sample) => sample.id === "delaware-notice",
    );
    expect(
      matchDocumentToBuiltInRule(
        franchise!.result,
        "Delaware annual franchise tax and report",
        "2026-03-05",
        items,
      ),
    ).toMatchObject({
      ruleId: "de-franchise-annual",
      originalIsoDate: "2026-03-01",
      newIsoDate: "2026-03-05",
    });
  });
});
