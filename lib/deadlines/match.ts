import type { ExtractionResult } from "../llm/schema";
import { parseIsoDate } from "./civilDate";
import type { GeneratedDeadline } from "./generate";

export type DocumentRuleMatch = {
  ruleId: string;
  ruleTitle: string;
  originalIsoDate: string;
  newIsoDate: string;
};

const FORM_MATCHERS: Array<{
  ruleId: string;
  test: (haystack: string, documentType: string) => boolean;
}> = [
  {
    ruleId: "in-aoc4",
    test: (haystack) => /\baoc-?4\b/.test(haystack),
  },
  {
    ruleId: "in-mgt7",
    test: (haystack) => /\bmgt-?7\b/.test(haystack),
  },
  {
    ruleId: "us-1120",
    test: (haystack, documentType) =>
      documentType === "irs_notice" || /\bform 1120\b|\b1120\b/.test(haystack),
  },
  {
    ruleId: "de-franchise-annual",
    test: (haystack, documentType) =>
      documentType === "delaware_franchise_tax_notice" ||
      /\bfranchise tax\b/.test(haystack),
  },
];

function haystackFor(extraction: ExtractionResult, title: string): string {
  return [
    title,
    extraction.summary,
    extraction.requiredAction,
    extraction.deadline?.title ?? "",
    extraction.deadline?.action ?? "",
    extraction.documentType.replace(/_/g, " "),
  ]
    .join(" ")
    .toLowerCase();
}

function daysApart(leftIso: string, rightIso: string): number {
  const left = parseIsoDate(leftIso);
  const right = parseIsoDate(rightIso);
  return Math.abs(
    Date.UTC(left.year, left.month - 1, left.day) -
      Date.UTC(right.year, right.month - 1, right.day),
  ) / 86_400_000;
}

export function ruleIdForDocument(
  extraction: ExtractionResult,
  title: string,
): string | null {
  const haystack = haystackFor(extraction, title);
  return (
    FORM_MATCHERS.find((matcher) =>
      matcher.test(haystack, extraction.documentType),
    )?.ruleId ?? null
  );
}

export function matchDocumentToBuiltInRule(
  extraction: ExtractionResult,
  title: string,
  isoDate: string,
  items: GeneratedDeadline[],
): DocumentRuleMatch | null {
  if (!isoDate) {
    return null;
  }
  const ruleId = ruleIdForDocument(extraction, title);
  if (!ruleId) {
    return null;
  }
  const candidates = items.filter(
    (item) => item.ruleId === ruleId && item.origin === "rule",
  );
  if (candidates.length === 0) {
    return null;
  }
  const nearest = [...candidates].sort(
    (left, right) =>
      daysApart(left.isoDate, isoDate) - daysApart(right.isoDate, isoDate),
  )[0];
  if (!nearest) {
    return null;
  }
  return {
    ruleId,
    ruleTitle: nearest.title,
    originalIsoDate: nearest.isoDate,
    newIsoDate: isoDate,
  };
}
