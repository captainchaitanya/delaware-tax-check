import { describe, expect, it } from "vitest";
import { selectResultsPresentation } from "./resultsPresentation";

describe("selectResultsPresentation", () => {
  it("uses the owe-X-not-Y framing when APVC is lower", () => {
    const view = selectResultsPresentation({
      authorizedSharesTax: 85_165,
      apvcTax: 400,
      lowerTax: 400,
      savings: 84_765,
      winningMethod: "apvc",
    });

    expect(view.variant).toBe("overpaying");
    expect(view.headline).toBe("You likely owe $400, not $85,165.");
    expect(view.subline).toBe(
      "That is $84,765 less than the Authorized Shares notice.",
    );
    expect(view.strikeAuthorized).toBe(true);
    expect(view.strikeApvc).toBe(false);
    expect(view.useScaryRed).toBe(true);
    expect(view.showRefileStep).toBe(true);
  });

  it("uses already-lowest copy when Authorized Shares is cheaper", () => {
    const view = selectResultsPresentation({
      authorizedSharesTax: 175,
      apvcTax: 2_000,
      lowerTax: 175,
      savings: 1_825,
      winningMethod: "authorizedShares",
    });

    expect(view.variant).toBe("alreadyLowest");
    expect(view.headline).toBe(
      "Good news: your Delaware bill is already the lowest option.",
    );
    expect(view.subline).toBe(
      "Filing with the Assumed Par Value Capital Method would cost $2,000, so stick with the default ($175).",
    );
    expect(view.strikeAuthorized).toBe(false);
    expect(view.strikeApvc).toBe(false);
    expect(view.useScaryRed).toBe(false);
    expect(view.showRefileStep).toBe(false);
  });

  it("uses already-lowest copy, with no red or strikethrough, on a tie", () => {
    const view = selectResultsPresentation({
      authorizedSharesTax: 200_000,
      apvcTax: 200_000,
      lowerTax: 200_000,
      savings: 0,
      winningMethod: "tie",
    });

    expect(view.variant).toBe("alreadyLowest");
    expect(view.headline).toBe(
      "Good news: your Delaware bill is already the lowest option.",
    );
    expect(view.subline).toBe(
      "Filing with the Assumed Par Value Capital Method would also cost $200,000, so stick with the default ($200,000).",
    );
    expect(view.strikeAuthorized).toBe(false);
    expect(view.strikeApvc).toBe(false);
    expect(view.useScaryRed).toBe(false);
    expect(view.showRefileStep).toBe(false);
  });
});
