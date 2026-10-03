import { Rational } from "./rational";
import { TAX_CONFIG } from "./taxConfig";

export type ShareClassInput = {
  name: string;
  authorized: number;
  parValue: number | string;
};

export type FranchiseTaxInput = {
  grossAssets: number | string;
  issuedShares: number;
  classes: ShareClassInput[];
};

export type WinningMethod = "authorizedShares" | "apvc" | "tie";

export type ClassBreakdown = {
  name: string;
  authorized: number;
  parValue: string;
  rateUsed: string;
  usedAssumedPar: boolean;
  capital: string;
};

export type ApvcResult = {
  tax: number;
  assumedPar: string;
  assumedParValueCapital: string;
  classBreakdown: ClassBreakdown[];
};

export type QuarterlyPayment = {
  due: string;
  percent: number | null;
  amountDollars: number;
  remainder: boolean;
};

export type CompareResult = {
  authorizedSharesTax: number;
  apvcTax: number;
  lowerTax: number;
  savings: number;
  winningMethod: WinningMethod;
  assumedPar: string;
  assumedParValueCapital: string;
  quarterlySchedule: QuarterlyPayment[] | null;
};

export function authorizedSharesTax(totalAuthorizedShares: number): number {
  assertSafeInteger(totalAuthorizedShares, "Total authorized shares");
  if (totalAuthorizedShares < 0) {
    throw new Error("Total authorized shares cannot be negative");
  }

  const c = TAX_CONFIG.authorizedShares;

  if (totalAuthorizedShares <= c.tier1MaxShares) {
    return c.tier1TaxDollars;
  }
  if (totalAuthorizedShares <= c.tier2MaxShares) {
    return c.tier2TaxDollars;
  }

  const additional =
    BigInt(totalAuthorizedShares) - BigInt(c.tier2MaxShares);
  const block = BigInt(c.additionalBlockSize);
  const blocks = (additional + block - 1n) / block;
  const tax =
    BigInt(c.tier2TaxDollars) + blocks * BigInt(c.additionalBlockTaxDollars);
  const capped =
    tax > BigInt(c.maximumTaxDollars) ? BigInt(c.maximumTaxDollars) : tax;
  return Number(capped);
}

export function apvcTax(input: FranchiseTaxInput): ApvcResult {
  const issuedShares = requirePositiveIssuedShares(input.issuedShares);
  const grossAssets = parseNonNegativeDecimal(
    input.grossAssets,
    "Gross assets",
  );

  if (!Array.isArray(input.classes) || input.classes.length === 0) {
    throw new Error("At least one share class is required");
  }

  const assumedPar = grossAssets.div(new Rational(BigInt(issuedShares)));

  let capital = Rational.zero();
  const classBreakdown: ClassBreakdown[] = [];

  for (const cls of input.classes) {
    const label = cls.name?.trim() ? cls.name.trim() : "share class";
    assertSafeInteger(cls.authorized, `Authorized shares for ${label}`);
    if (cls.authorized < 0) {
      throw new Error(`Authorized shares for ${label} cannot be negative`);
    }
    const parValue = parseNonNegativeDecimal(
      cls.parValue,
      `Par value for ${label}`,
    );

    const authorized = new Rational(BigInt(cls.authorized));
    const usedAssumedPar = parValue.lt(assumedPar);
    const rateUsed = usedAssumedPar ? assumedPar : parValue;
    const classCapital = rateUsed.mul(authorized);
    capital = capital.add(classCapital);

    classBreakdown.push({
      name: cls.name,
      authorized: cls.authorized,
      parValue: parValue.toDecimalString(),
      rateUsed: rateUsed.toDecimalString(),
      usedAssumedPar,
      capital: classCapital.toDecimalString(),
    });
  }

  const millions = capital.div(
    new Rational(BigInt(TAX_CONFIG.apvc.millionDollars)),
  );
  let portions = millions.ceil();
  if (portions < 0n) {
    throw new Error("Assumed par value capital cannot be negative");
  }

  let tax =
    portions * BigInt(TAX_CONFIG.apvc.taxPerMillionDollars);
  if (tax < BigInt(TAX_CONFIG.apvc.minimumTaxDollars)) {
    tax = BigInt(TAX_CONFIG.apvc.minimumTaxDollars);
  }
  if (tax > BigInt(TAX_CONFIG.apvc.maximumTaxDollars)) {
    tax = BigInt(TAX_CONFIG.apvc.maximumTaxDollars);
  }

  return {
    tax: Number(tax),
    assumedPar: assumedPar.toDecimalString(),
    assumedParValueCapital: capital.toDecimalString(),
    classBreakdown,
  };
}

export function compare(input: FranchiseTaxInput): CompareResult {
  const totalAuthorized = input.classes.reduce((sum, cls) => {
    const label = cls.name?.trim() ? cls.name.trim() : "share class";
    assertSafeInteger(cls.authorized, `Authorized shares for ${label}`);
    return sum + cls.authorized;
  }, 0);

  const authorized = authorizedSharesTax(totalAuthorized);
  const apvc = apvcTax(input);
  const lowerTax = Math.min(authorized, apvc.tax);
  const savings = Math.abs(authorized - apvc.tax);

  let winningMethod: WinningMethod;
  if (authorized < apvc.tax) {
    winningMethod = "authorizedShares";
  } else if (apvc.tax < authorized) {
    winningMethod = "apvc";
  } else {
    winningMethod = "tie";
  }

  return {
    authorizedSharesTax: authorized,
    apvcTax: apvc.tax,
    lowerTax,
    savings,
    winningMethod,
    assumedPar: apvc.assumedPar,
    assumedParValueCapital: apvc.assumedParValueCapital,
    quarterlySchedule: buildQuarterlySchedule(lowerTax),
  };
}

function buildQuarterlySchedule(taxDollars: number): QuarterlyPayment[] | null {
  const cfg = TAX_CONFIG.estimatedPayments;
  if (taxDollars < cfg.thresholdDollars) {
    return null;
  }

  // Allocate in cents so 40/20/20 split cannot drift; remainder goes to March 1.
  const taxCents = BigInt(taxDollars) * 100n;
  const juneCents = (taxCents * BigInt(cfg.junePercent)) / 100n;
  const septCents = (taxCents * BigInt(cfg.septemberPercent)) / 100n;
  const decCents = (taxCents * BigInt(cfg.decemberPercent)) / 100n;
  const marchCents = taxCents - juneCents - septCents - decCents;

  return [
    payment(cfg.juneDue, cfg.junePercent, juneCents, false),
    payment(cfg.septemberDue, cfg.septemberPercent, septCents, false),
    payment(cfg.decemberDue, cfg.decemberPercent, decCents, false),
    payment(cfg.marchDue, null, marchCents, true),
  ];
}

function payment(
  due: string,
  percent: number | null,
  amountCents: bigint,
  remainder: boolean,
): QuarterlyPayment {
  return {
    due,
    percent,
    amountDollars: Number(amountCents) / 100,
    remainder,
  };
}

function requirePositiveIssuedShares(issuedShares: number): number {
  assertSafeInteger(issuedShares, "Issued shares");
  if (issuedShares <= 0) {
    throw new Error("Issued shares must be greater than 0");
  }
  return issuedShares;
}

function parseNonNegativeDecimal(
  value: number | string,
  label: string,
): Rational {
  let parsed: Rational;
  try {
    parsed = Rational.from(value);
  } catch {
    throw new Error(`${label} must be a valid number`);
  }
  if (parsed.isNegative()) {
    throw new Error(`${label} cannot be negative`);
  }
  return parsed;
}

function assertSafeInteger(value: unknown, label: string): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be an integer`);
  }
  if (!Number.isInteger(value)) {
    throw new Error(`${label} must be an integer`);
  }
  if (!Number.isSafeInteger(value)) {
    throw new Error(`${label} is too large to calculate safely`);
  }
}
