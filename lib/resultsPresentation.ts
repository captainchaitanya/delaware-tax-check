import { formatUsd } from "./format";
import type { WinningMethod } from "./franchiseTax";

export type ResultsSource = {
  authorizedSharesTax: number;
  apvcTax: number;
  lowerTax: number;
  savings: number;
  winningMethod: WinningMethod;
};

export type ResultsPresentation = {
  variant: "overpaying" | "alreadyLowest";
  heading: string;
  intro: string | null;
  headline: string;
  subline: string | null;
  strikeAuthorized: boolean;
  strikeApvc: boolean;
  useScaryRed: boolean;
  emphasizeAuthorized: boolean;
  emphasizeApvc: boolean;
  showRefileStep: boolean;
};

export function selectResultsPresentation(
  result: ResultsSource,
): ResultsPresentation {
  if (result.winningMethod === "apvc") {
    return {
      variant: "overpaying",
      heading: "What you likely owe",
      intro:
        "Delaware charges the lower of the two methods when you file with assets and issued shares filled in.",
      headline: `You likely owe ${formatUsd(result.lowerTax)}, not ${formatUsd(result.authorizedSharesTax)}.`,
      subline: `That is ${formatUsd(result.savings)} less than the Authorized Shares notice.`,
      strikeAuthorized: true,
      strikeApvc: false,
      useScaryRed: true,
      emphasizeAuthorized: false,
      emphasizeApvc: true,
      showRefileStep: true,
    };
  }

  const tie = result.winningMethod === "tie";
  const apvcCost = formatUsd(result.apvcTax);
  const defaultCost = formatUsd(result.authorizedSharesTax);

  return {
    variant: "alreadyLowest",
    heading: "Good news: your Delaware bill is already the lowest option.",
    intro: null,
    headline: "Good news: your Delaware bill is already the lowest option.",
    subline: tie
      ? `Filing with the Assumed Par Value Capital Method would also cost ${apvcCost}, so stick with the default (${defaultCost}).`
      : `Filing with the Assumed Par Value Capital Method would cost ${apvcCost}, so stick with the default (${defaultCost}).`,
    strikeAuthorized: false,
    strikeApvc: false,
    useScaryRed: false,
    emphasizeAuthorized: true,
    emphasizeApvc: false,
    showRefileStep: false,
  };
}
