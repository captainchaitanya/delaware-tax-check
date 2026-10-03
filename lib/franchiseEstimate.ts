import { calculateIfReady } from "./formValidation";
import type { CompanyProfile } from "./profile";
import { TAX_CONFIG } from "./taxConfig";

export type FranchiseEstimate = {
  tax: number;
  annualReportFee: number;
  filingTotal: number;
  winningMethod: "authorizedShares" | "apvc" | "tie";
};

export function franchiseEstimateFromProfile(
  profile: CompanyProfile | null,
): FranchiseEstimate | null {
  if (!profile?.shareStructure) {
    return null;
  }
  const calculation = calculateIfReady(profile.shareStructure);
  if (!calculation.ready) {
    return null;
  }
  return {
    tax: calculation.result.lowerTax,
    annualReportFee: TAX_CONFIG.annualReport.filingFeeDollars,
    filingTotal:
      calculation.result.lowerTax + TAX_CONFIG.annualReport.filingFeeDollars,
    winningMethod: calculation.result.winningMethod,
  };
}
