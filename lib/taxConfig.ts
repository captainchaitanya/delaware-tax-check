/**
 * Delaware franchise tax and annual report figures.
 * status: verified  lastChecked: 2026-10-03
 * Sources: corp.delaware.gov/paytaxes/ and corp.delaware.gov/frtaxcalc/
 */

export const TAX_CONFIG = {
  lastChecked: "2026-10-03",
  status: "verified" as const,
  sources: [
    "https://corp.delaware.gov/paytaxes/",
    "https://corp.delaware.gov/frtaxcalc/",
  ],
  notes:
    "Large Corporate Filers may have a $250,000 maximum. This checker still uses the $200,000 cap and does not compute the Large Corporate Filer amount.",

  authorizedShares: {
    /** 5,000 shares or fewer */
    tier1MaxShares: 5_000,
    tier1TaxDollars: 175,
    /** 5,001–10,000 shares */
    tier2MaxShares: 10_000,
    tier2TaxDollars: 250,
    /** Each additional 10,000 shares or portion thereof */
    additionalBlockSize: 10_000,
    additionalBlockTaxDollars: 85,
    maximumTaxDollars: 200_000,
  },

  apvc: {
    /** $400 per $1,000,000 of assumed par value capital, or portion thereof */
    taxPerMillionDollars: 400,
    millionDollars: 1_000_000,
    minimumTaxDollars: 400,
    maximumTaxDollars: 200_000,
  },

  /** Note only — not used in the calculation. */
  largeCorporateFilerMaximumTaxDollars: 250_000,

  annualReport: {
    filingFeeDollars: 50,
    dueDate: "March 1",
    latePenaltyDollars: 200,
    monthlyInterestPercent: 1.5,
    nonExemptNote: "Annual report fee is $50 for a non-exempt corporation.",
  },

  estimatedPayments: {
    /** Quarterly estimates required when tax owed is this amount or more */
    thresholdDollars: 5_000,
    junePercent: 40,
    septemberPercent: 20,
    decemberPercent: 20,
    juneDue: "June 1",
    septemberDue: "September 1",
    decemberDue: "December 1",
    marchDue: "March 1",
  },
} as const;
