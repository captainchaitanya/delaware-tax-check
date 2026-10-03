import { ExtractError } from "../errors";
import { matchSampleDocument } from "../samples";
import type { ExtractionResult } from "../schema";

const KEYWORD_HINTS = [
  "franchise tax",
  "certificate of incorporation",
  "internal revenue",
  "form 1120",
  "registrar of companies",
  "aoc-4",
  "mca",
  "gst",
  "gstr",
  "delaware",
  "authorized shares",
  "par value",
];

export function looksLikeDocument(text: string): boolean {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.length < 8) {
    return false;
  }
  return KEYWORD_HINTS.some((hint) => lower.includes(hint));
}

export async function extractWithMock(text: string): Promise<ExtractionResult> {
  const sample = matchSampleDocument(text);
  if (sample) {
    return structuredClone(sample.result);
  }
  if (!looksLikeDocument(text)) {
    throw new ExtractError(
      "irrelevant",
      "That does not look like a notice or certificate. Paste the text of a filing letter.",
    );
  }
  return {
    relevant: true,
    documentType: "other",
    issuer: "Unknown issuer",
    summary: "A document was read, but this demo build does not have a canned match for it.",
    fields: [
      {
        key: "excerpt",
        label: "First line",
        value: text.trim().split(/\n/)[0]?.slice(0, 80) || "—",
        quote: text.trim().split(/\s+/).slice(0, 8).join(" "),
        confidence: "low",
      },
    ],
    shareClasses: [],
    deadline: null,
    requiredAction: "Check the fields, then save only if they are useful.",
  };
}
