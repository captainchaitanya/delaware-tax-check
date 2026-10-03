import { formatUsd } from "@/lib/format";
import { TAX_CONFIG } from "@/lib/taxConfig";

type NextStepsProps = {
  showRefileStep: boolean;
};

export function NextSteps({ showRefileStep }: NextStepsProps) {
  return (
    <section
      aria-labelledby="next-steps-heading"
      className="flex flex-col gap-4"
    >
      <h2
        id="next-steps-heading"
        className="font-serif text-2xl font-medium tracking-tight"
      >
        What to do next
      </h2>
      <ol className="flex list-decimal flex-col gap-3 pl-5 text-sm leading-6 text-foreground">
        {showRefileStep ? (
          <li>
            File the Delaware annual report through the Division of
            Corporations. Enter total gross assets and issued shares
            (including treasury). Those two fields are what lets Delaware
            recalculate under the Assumed Par Value Capital Method.
          </li>
        ) : (
          <li>
            File the Delaware annual report through the Division of
            Corporations. The default Authorized Shares Method is already
            the lower figure, so you do not need to switch methods.
          </li>
        )}
        <li>
          The annual report is due {TAX_CONFIG.annualReport.dueDate}. Filing
          late adds a {formatUsd(TAX_CONFIG.annualReport.latePenaltyDollars)}{" "}
          penalty plus {TAX_CONFIG.annualReport.monthlyInterestPercent}%
          interest per month.
        </li>
        {showRefileStep ? (
          <>
            <li>
              If franchise tax is{" "}
              {formatUsd(TAX_CONFIG.estimatedPayments.thresholdDollars)} or
              more, Delaware also expects quarterly estimates (40% June 1,
              20% September 1, 20% December 1, remainder the following March
              1).
            </li>
            <li>
              Talk to a CPA or Delaware counsel if you have several share
              classes, a recent priced round, or the notice still does not
              match after you file. This page does not file anything for you.
            </li>
          </>
        ) : null}
      </ol>
    </section>
  );
}
