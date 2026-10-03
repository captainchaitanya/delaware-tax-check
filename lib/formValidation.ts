import { compare, type CompareResult, type FranchiseTaxInput } from "./franchiseTax";
import type { CalculatorForm, FieldParse } from "./formTypes";
import { parseUserInteger } from "./parseInput";
import { Rational } from "./rational";

function fail(message: string): FieldParse<never> {
  return { ok: false, empty: false, message };
}

function empty(): FieldParse<never> {
  return { ok: false, empty: true, message: null };
}

export function parseWholeNumber(raw: string): FieldParse<number> {
  if (raw.trim() === "") {
    return empty();
  }
  try {
    return { ok: true, value: parseUserInteger(raw) };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Invalid number");
  }
}

export function parseIssuedShares(raw: string): FieldParse<number> {
  const parsed = parseWholeNumber(raw);
  if (!parsed.ok) {
    return parsed;
  }
  if (parsed.value <= 0) {
    return fail("Issued shares must be greater than 0");
  }
  return parsed;
}

export function parseNonNegativeDecimal(raw: string): FieldParse<string> {
  if (raw.trim() === "") {
    return empty();
  }
  try {
    const value = Rational.fromUserInput(raw);
    if (value.isNegative()) {
      return fail("Cannot be negative");
    }
    return { ok: true, value: value.toDecimalString() };
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Invalid number");
  }
}

export type ReadyCalculation = {
  ready: true;
  input: FranchiseTaxInput;
  result: CompareResult;
};

export type IncompleteCalculation = {
  ready: false;
};

export function calculateIfReady(
  form: CalculatorForm,
): ReadyCalculation | IncompleteCalculation {
  const issuedShares = parseIssuedShares(form.issuedShares);
  const grossAssets = parseNonNegativeDecimal(form.grossAssets);
  if (!issuedShares.ok || !grossAssets.ok) {
    return { ready: false };
  }

  const classes: FranchiseTaxInput["classes"] = [];
  for (const cls of form.classes) {
    const authorized = parseWholeNumber(cls.authorized);
    const parValue = parseNonNegativeDecimal(cls.parValue);
    if (!authorized.ok || !parValue.ok) {
      return { ready: false };
    }
    classes.push({
      name: cls.name.trim() || "Untitled class",
      authorized: authorized.value,
      parValue: parValue.value,
    });
  }

  if (classes.length === 0) {
    return { ready: false };
  }

  const input = {
    issuedShares: issuedShares.value,
    grossAssets: grossAssets.value,
    classes,
  };

  return { ready: true, input, result: compare(input) };
}
