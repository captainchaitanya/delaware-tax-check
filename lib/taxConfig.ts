/**
 * Delaware franchise tax and annual report figures.
 * verify against corp.delaware.gov before publishing
 *
 * lastVerified: 2026-10-03
 *
 * Sources commonly cited for these figures are the Delaware Division of
 * Corporations franchise tax instructions. Recheck before any public launch.
 */

export const TAX_CONFIG = {
  lastVerified: "2026-10-03",
  sourceUrl: "https://corp.delaware.gov",
  verified: false,

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

  // verify against corp.delaware.gov before publishing
  annualReport: {
    filingFeeDollars: 50, // verify
    dueDate: "March 1", // verify
    latePenaltyDollars: 200, // verify
    monthlyInterestPercent: 1.5, // verify
  },

  // verify against corp.delaware.gov before publishing
  estimatedPayments: {
    /** Quarterly estimates required when tax owed is this amount or more */
    thresholdDollars: 5_000, // verify
    junePercent: 40, // verify — June 1
    septemberPercent: 20, // verify — September 1
    decemberPercent: 20, // verify — December 1
    // remainder is due March 1
    juneDue: "June 1",
    septemberDue: "September 1",
    decemberDue: "December 1",
    marchDue: "March 1",
  },
} as const;
