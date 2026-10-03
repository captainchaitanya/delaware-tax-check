import { parseNonNegativeDecimal } from "./formValidation";

export type ExtraCostEstimates = {
  indiaFilings: string;
  other: string;
};

export const DEFAULT_EXTRA_COSTS: ExtraCostEstimates = {
  indiaFilings: "",
  other: "",
};

export function dollarsFromEstimate(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return null;
  }
  const parsed = parseNonNegativeDecimal(trimmed);
  if (!parsed.ok) {
    return null;
  }
  return Number(parsed.value);
}

export function annualCostTotal(
  delawareFilingTotal: number | null,
  extras: ExtraCostEstimates,
): number | null {
  const india = dollarsFromEstimate(extras.indiaFilings) ?? 0;
  const other = dollarsFromEstimate(extras.other) ?? 0;
  if (delawareFilingTotal === null && india === 0 && other === 0) {
    return null;
  }
  return (delawareFilingTotal ?? 0) + india + other;
}
