import { MathDetails } from "./MathDetails";
import { formatUsd } from "@/lib/format";
import type { CompareResult, FranchiseTaxInput } from "@/lib/franchiseTax";
import { selectResultsPresentation } from "@/lib/resultsPresentation";
import { TAX_CONFIG } from "@/lib/taxConfig";

type ResultsPanelProps = {
  input: FranchiseTaxInput;
  result: CompareResult;
};

export function ResultsPanel({ input, result }: ResultsPanelProps) {
  const view = selectResultsPresentation(result);
  const filingTotal =
    result.lowerTax + TAX_CONFIG.annualReport.filingFeeDollars;

  return (
    <section
      aria-labelledby="results-heading"
      className="flex flex-col gap-6 rounded-md border border-line bg-card p-4 sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <h2
          id="results-heading"
          tabIndex={-1}
          className="font-serif text-2xl font-medium tracking-tight text-foreground"
        >
          {view.heading}
        </h2>
        {view.intro ? <p className="text-sm text-muted">{view.intro}</p> : null}
        {view.variant === "alreadyLowest" && view.subline ? (
          <p
            aria-live="polite"
            aria-atomic="true"
            className="text-sm leading-6 text-muted"
          >
            {view.subline}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MethodFigure
          label="Authorized Shares"
          amount={result.authorizedSharesTax}
          note="Delaware's default notice"
          crossedOut={view.strikeAuthorized}
          scary={view.useScaryRed && view.strikeAuthorized}
          emphasized={view.emphasizeAuthorized}
        />
        <MethodFigure
          label="Assumed Par Value"
          amount={result.apvcTax}
          note={
            view.variant === "overpaying"
              ? "Often the lower figure"
              : "If you filed with assets filled in"
          }
          crossedOut={view.strikeApvc}
          scary={false}
          emphasized={view.emphasizeApvc}
        />
      </div>

      {view.variant === "overpaying" ? (
        <>
          <p
            aria-live="polite"
            aria-atomic="true"
            className="font-serif text-xl leading-snug text-foreground sm:text-2xl"
          >
            {view.headline}
          </p>
          {view.subline ? (
            <p className="text-sm leading-6 text-muted">{view.subline}</p>
          ) : null}
        </>
      ) : null}

      <table className="w-full text-sm">
        <caption className="sr-only">Filing totals</caption>
        <tbody className="[&_th]:py-2 [&_th]:text-left [&_th]:font-normal [&_th]:text-muted [&_td]:py-2 [&_td]:text-right [&_td]:font-mono [&_td]:tabular-nums">
          <tr className="border-t border-line">
            <th scope="row">Franchise tax</th>
            <td>{formatUsd(result.lowerTax)}</td>
          </tr>
          <tr>
            <th scope="row">Annual report fee</th>
            <td>{formatUsd(TAX_CONFIG.annualReport.filingFeeDollars)}</td>
          </tr>
          <tr className="border-t border-line">
            <th scope="row" className="font-medium text-foreground">
              Typical filing total
            </th>
            <td className="font-medium text-foreground">
              {formatUsd(filingTotal)}
            </td>
          </tr>
        </tbody>
      </table>

      {result.quarterlySchedule ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium">
            Quarterly estimated payments
          </h3>
          <p className="text-xs leading-5 text-muted">
            Required when franchise tax is{" "}
            {formatUsd(TAX_CONFIG.estimatedPayments.thresholdDollars)} or
            more.
          </p>
          <table className="w-full text-sm">
            <caption className="sr-only">Estimated payment dates</caption>
            <thead>
              <tr className="text-left text-xs text-muted">
                <th scope="col" className="py-1 font-normal">
                  Due
                </th>
                <th scope="col" className="py-1 font-normal">
                  Share
                </th>
                <th scope="col" className="py-1 text-right font-normal">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="[&_td]:py-1.5 [&_td]:font-mono [&_td]:tabular-nums">
              {result.quarterlySchedule.map((row) => (
                <tr key={row.due} className="border-t border-line">
                  <td>{row.due}</td>
                  <td>{row.remainder ? "Remainder" : `${row.percent}%`}</td>
                  <td className="text-right">{formatUsd(row.amountDollars)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <MathDetails input={input} result={result} />
    </section>
  );
}

function MethodFigure({
  label,
  amount,
  note,
  crossedOut,
  scary,
  emphasized,
}: {
  label: string;
  amount: number;
  note: string;
  crossedOut: boolean;
  scary: boolean;
  emphasized: boolean;
}) {
  const formatted = formatUsd(amount);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-xs leading-4 text-muted">{label}</p>
      <p
        className={`font-mono tabular-nums tracking-tight ${
          emphasized
            ? "text-3xl text-accent sm:text-4xl"
            : scary
              ? "text-xl text-scary sm:text-2xl"
              : "text-xl text-muted sm:text-2xl"
        }`}
      >
        {crossedOut ? (
          <s className="decoration-2" aria-label={`${formatted}, higher method`}>
            {formatted}
          </s>
        ) : (
          formatted
        )}
      </p>
      <p className="text-xs text-muted">{note}</p>
    </div>
  );
}
