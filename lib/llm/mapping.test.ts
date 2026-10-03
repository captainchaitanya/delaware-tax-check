import { describe, expect, it } from "vitest";
import {
  customDeadlineFromExtraction,
  DOCUMENT_TYPE_LABEL,
  shareStructureFromExtraction,
} from "./mapping";
import { SAMPLE_DOCUMENTS } from "./samples";

describe("extraction mapping", () => {
  it("maps a certificate to franchise-tax share classes", () => {
    const certificate = SAMPLE_DOCUMENTS.find((sample) => sample.id === "certificate");
    expect(certificate).toBeDefined();
    const form = shareStructureFromExtraction(certificate!.result, null);
    expect(form?.classes).toHaveLength(2);
    expect(form?.classes[0]).toMatchObject({
      name: "Common",
      authorized: "10000000",
      parValue: "0.00001",
    });
  });

  it("builds an editable custom deadline labeled from the document", () => {
    const notice = SAMPLE_DOCUMENTS.find((sample) => sample.id === "delaware-notice");
    const deadline = customDeadlineFromExtraction(notice!.result, "doc-1", {
      title: "Pay Delaware franchise tax",
      isoDate: "2027-03-01",
      action: "File and pay $450",
    });
    expect(deadline).toMatchObject({
      id: "custom:doc-1",
      isoDate: "2027-03-01",
      source: "document",
      documentId: "doc-1",
      jurisdiction: "US-Delaware",
    });
    expect(DOCUMENT_TYPE_LABEL.delaware_franchise_tax_notice).toMatch(/franchise/i);
  });

  it("maps an AOC-4 review to a document calendar deadline", () => {
    const notice = SAMPLE_DOCUMENTS.find((sample) => sample.id === "mca-notice");
    const deadline = customDeadlineFromExtraction(notice!.result, "doc-aoc4", {
      title: "Form AOC-4 Filing Deadline",
      isoDate: "2026-10-26",
      action: "File Form AOC-4 on the MCA portal.",
    });
    expect(deadline).toMatchObject({
      id: "custom:doc-aoc4",
      title: "Form AOC-4 Filing Deadline",
      isoDate: "2026-10-26",
      source: "document",
      jurisdiction: "India",
    });
  });
});
