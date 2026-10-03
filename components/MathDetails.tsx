import { formatShares, formatUsd, formatUsdExact } from "@/lib/format";
import type { CompareResult, FranchiseTaxInput } from "@/lib/franchiseTax";
import { Rational } from "@/lib/rational";
import { TAX_CONFIG } from "@/lib/taxConfig";

type MathDetailsProps = {
  input: FranchiseTaxInput;
  result: CompareResult;
};

export function MathDetails({ input, result }: MathDetailsProps) {
  const capital = Rational.from(result.assumedParValueCapital);
  const million = Rational.from(TAX_CONFIG.apvc.millionDollars);
  const belowOneMillion = capital.lt(million);
  const maxApplied =
    result.apvcTax === TAX_CONFIG.apvc.maximumTaxDollars && !belowOneMillion;
  const portions = result.apvcTax / TAX_CONFIG.apvc.taxPerMillionDollars;

  return (
    <details className="group border-t border-line pt-1">
      <summary className="cursor-pointer list-none py-3 text-sm font-medium text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
        <span className="underline decoration-line underline-offset-4 group-open:no-underline">
          Show the math
        </span>
        <span className="ml-2 text-muted group-open:hidden" aria-hidden="true">
          +
        </span>
        <span className="ml-2 hidden text-muted group-open:inline" aria-hidden="true">
          −
        </span>
      </summary>

      <div className="flex flex-col gap-5 pb-4 text-sm leading-6 text-foreground">
        <section>
          <h3 className="font-medium">Assumed par</h3>
          <p className="text-muted">
            Total gross assets ÷ issued shares (including treasury).
          </p>
          <p className="mt-1 font-mono tabular-nums">
            {formatUsdExact(String(input.grossAssets))} ÷{" "}
            {formatShares(input.issuedShares)} ={" "}
            {formatUsdExact(result.assumedPar)}
          </p>
        </section>

        {result.classBreakdown.map((cls) => (
          <section key={`${cls.name}-${cls.authorized}-${cls.parValue}`}>
            <h3 className="font-medium">{cls.name}</h3>
            {cls.usedAssumedPar ? (
              <p>
                Stated par {formatUsdExact(cls.parValue)} is below assumed par,
                so the assumed par is used.
              </p>
            ) : (
              <p>
                Stated par {formatUsdExact(cls.parValue)} is at or above assumed
                par, so the stated par is used.
              </p>
            )}
            <p className="mt-1 font-mono tabular-nums">
              {formatUsdExact(cls.rateUsed)} × {formatShares(cls.authorized)}{" "}
              authorized = {formatUsdExact(cls.capital)}
            </p>
          </section>
        ))}

        <section>
          <h3 className="font-medium">Assumed par value capital</h3>
          <p className="font-mono tabular-nums">
            {formatUsdExact(result.assumedParValueCapital)}
          </p>
          <p className="mt-2 text-muted">
            Tax is {formatUsd(TAX_CONFIG.apvc.taxPerMillionDollars)} per{" "}
            {formatUsd(TAX_CONFIG.apvc.millionDollars)} or portion thereof,
            minimum {formatUsd(TAX_CONFIG.apvc.minimumTaxDollars)}, maximum{" "}
            {formatUsd(TAX_CONFIG.apvc.maximumTaxDollars)}.
          </p>
          <p className="mt-1 font-mono tabular-nums">
            {maxApplied
              ? `Capped at ${formatUsd(TAX_CONFIG.apvc.maximumTaxDollars)}`
              : belowOneMillion
                ? `${formatUsdExact(result.assumedParValueCapital)} is under ${formatUsd(TAX_CONFIG.apvc.millionDollars)}, so the minimum applies → ${formatUsd(result.apvcTax)}`
                : `${formatUsd(TAX_CONFIG.apvc.taxPerMillionDollars)} × ${portions} = ${formatUsd(result.apvcTax)}`}
          </p>
        </section>
      </div>
    </details>
  );
}
