import type { CompanyProfile } from "../profile";
import type { TimeZoneId } from "./civilDate";

export type Jurisdiction = "US-Federal" | "US-Delaware" | "India";

export type RuleCondition =
  | { type: "always" }
  | { type: "flag"; field: keyof Pick<
      CompanyProfile,
      | "foreignOwned25"
      | "indianResidentFoundersHoldShares"
      | "paysUsContractors"
      | "hasIndianSubsidiary"
    > }
  | { type: "indiaGst" }
  | { type: "indiaFdi" }
  | { type: "franchiseTaxAtLeast"; amount: number };

export type RuleSchedule =
  | { kind: "fixed"; month: number; day: number }
  | { kind: "monthsAfterFyEnd"; fy: "us" | "india"; months: number; day: number }
  | { kind: "daysAfterFyEnd"; fy: "us" | "india"; days: number }
  | { kind: "monthly"; day: number; followingMonth: boolean }
  | { kind: "quarterly"; monthDays: Array<{ month: number; day: number }> }
  | { kind: "relative"; afterRuleId: string; days: number }
  | { kind: "perDirector"; month: number; day: number };

export type DeadlineRule = {
  id: string;
  title: string;
  jurisdiction: Jurisdiction;
  timeZone: TimeZoneId;
  appliesTo: RuleCondition;
  appliesLabel: string;
  schedule: RuleSchedule;
  whatThisIs: string;
  ifMissed: string;
  sourceUrl: string;
  verified: false;
  lastVerified: null;
  rollWeekend: "none" | "next-weekday";
};

const US: TimeZoneId = "America/New_York";
const IN: TimeZoneId = "Asia/Kolkata";

export const DEADLINE_RULES: DeadlineRule[] = [
  {
    id: "de-franchise-annual",
    title: "Delaware annual franchise tax and report",
    jurisdiction: "US-Delaware",
    timeZone: US,
    appliesTo: { type: "always" },
    appliesLabel: "All Delaware corporations",
    schedule: { kind: "fixed", month: 3, day: 1 },
    whatThisIs:
      "Annual franchise tax and annual report filed with the Delaware Division of Corporations.",
    ifMissed:
      "Late penalty plus monthly interest, and the company can fall out of good standing.",
    sourceUrl: "https://corp.delaware.gov",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "de-franchise-q-jun",
    title: "Delaware franchise tax estimate — June",
    jurisdiction: "US-Delaware",
    timeZone: US,
    appliesTo: { type: "franchiseTaxAtLeast", amount: 5_000 },
    appliesLabel: "When annual franchise tax is $5,000 or more",
    schedule: { kind: "fixed", month: 6, day: 1 },
    whatThisIs: "First quarterly estimated franchise tax payment (40%).",
    ifMissed: "Interest can accrue on the unpaid estimate.",
    sourceUrl: "https://corp.delaware.gov",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "de-franchise-q-sep",
    title: "Delaware franchise tax estimate — September",
    jurisdiction: "US-Delaware",
    timeZone: US,
    appliesTo: { type: "franchiseTaxAtLeast", amount: 5_000 },
    appliesLabel: "When annual franchise tax is $5,000 or more",
    schedule: { kind: "fixed", month: 9, day: 1 },
    whatThisIs: "Second quarterly estimated franchise tax payment (20%).",
    ifMissed: "Interest can accrue on the unpaid estimate.",
    sourceUrl: "https://corp.delaware.gov",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "de-franchise-q-dec",
    title: "Delaware franchise tax estimate — December",
    jurisdiction: "US-Delaware",
    timeZone: US,
    appliesTo: { type: "franchiseTaxAtLeast", amount: 5_000 },
    appliesLabel: "When annual franchise tax is $5,000 or more",
    schedule: { kind: "fixed", month: 12, day: 1 },
    whatThisIs: "Third quarterly estimated franchise tax payment (20%).",
    ifMissed: "Interest can accrue on the unpaid estimate.",
    sourceUrl: "https://corp.delaware.gov",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "us-1120",
    title: "Federal corporate income tax return (Form 1120)",
    jurisdiction: "US-Federal",
    timeZone: US,
    appliesTo: { type: "always" },
    appliesLabel: "US C-corporations",
    schedule: { kind: "monthsAfterFyEnd", fy: "us", months: 4, day: 15 },
    whatThisIs:
      "Annual Form 1120, due on the 15th day of the 4th month after the US tax year ends. An extension may be available.",
    ifMissed: "IRS late-filing and late-payment penalties can apply.",
    sourceUrl: "https://www.irs.gov/forms-pubs/about-form-1120",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "us-5472",
    title: "Form 5472 (25%+ foreign-owned reporting)",
    jurisdiction: "US-Federal",
    timeZone: US,
    appliesTo: { type: "flag", field: "foreignOwned25" },
    appliesLabel: "US companies that are 25% or more foreign-owned",
    schedule: { kind: "monthsAfterFyEnd", fy: "us", months: 4, day: 15 },
    whatThisIs:
      "Information return filed with the Form 1120 when the company is 25% or more foreign-owned.",
    ifMissed: "The IRS can assess a substantial penalty per form.",
    sourceUrl: "https://www.irs.gov/forms-pubs/about-form-5472",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "us-1099-nec",
    title: "Form 1099-NEC to contractors",
    jurisdiction: "US-Federal",
    timeZone: US,
    appliesTo: { type: "flag", field: "paysUsContractors" },
    appliesLabel: "Companies that pay US contractors",
    schedule: { kind: "fixed", month: 1, day: 31 },
    whatThisIs:
      "Copy of 1099-NEC furnished to contractors and filed with the IRS.",
    ifMissed: "Per-form IRS penalties can apply for late or missing 1099s.",
    sourceUrl: "https://www.irs.gov/forms-pubs/about-form-1099-nec",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-agm",
    title: "Annual general meeting",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Indian subsidiary",
    schedule: { kind: "daysAfterFyEnd", fy: "india", days: 183 },
    whatThisIs:
      "AGM of the Indian company, generally within six months of the financial year end.",
    ifMissed: "MCA can levy additional fees and penalties on the company and officers.",
    sourceUrl: "https://www.mca.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-aoc4",
    title: "AOC-4 financial statements",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Indian subsidiary",
    schedule: { kind: "relative", afterRuleId: "in-agm", days: 30 },
    whatThisIs: "Filing of financial statements with the Registrar, usually within 30 days of the AGM.",
    ifMissed: "Additional MCA fees and possible officer penalties.",
    sourceUrl: "https://www.mca.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-mgt7",
    title: "MGT-7 annual return",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Indian subsidiary",
    schedule: { kind: "relative", afterRuleId: "in-agm", days: 60 },
    whatThisIs: "Annual return with the Registrar, usually within 60 days of the AGM.",
    ifMissed: "Additional MCA fees and possible officer penalties.",
    sourceUrl: "https://www.mca.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-itr",
    title: "Indian company income tax return",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Indian subsidiary",
    schedule: { kind: "fixed", month: 10, day: 31 },
    whatThisIs:
      "Company income-tax return for the Indian subsidiary. October 31 is a commonly cited due date for companies — confirm for the current year.",
    ifMissed: "Interest, late fees, and possible prosecution exposure.",
    sourceUrl: "https://www.incometax.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-dir3-kyc",
    title: "DIR-3 KYC",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Each director of the Indian subsidiary",
    schedule: { kind: "perDirector", month: 9, day: 30 },
    whatThisIs: "Annual KYC for each director DIN, commonly due 30 September.",
    ifMissed: "DIN can be deactivated and a fee charged to reactivate.",
    sourceUrl: "https://www.mca.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-fla",
    title: "FLA return to RBI",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "indiaFdi" },
    appliesLabel: "Indian company that receives foreign investment",
    schedule: { kind: "fixed", month: 7, day: 15 },
    whatThisIs:
      "Annual Foreign Liabilities and Assets return to the Reserve Bank of India.",
    ifMissed: "RBI can treat this as a contravention of FEMA reporting.",
    sourceUrl: "https://www.rbi.org.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-tds",
    title: "TDS quarterly return",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Indian subsidiary",
    schedule: {
      kind: "quarterly",
      monthDays: [
        { month: 7, day: 31 },
        { month: 10, day: 31 },
        { month: 1, day: 31 },
        { month: 5, day: 31 },
      ],
    },
    whatThisIs: "Quarterly statement of tax deducted at source.",
    ifMissed: "Late fees under the Income-tax Act can apply.",
    sourceUrl: "https://www.incometax.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
  {
    id: "in-gstr1",
    title: "GSTR-1",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "indiaGst" },
    appliesLabel: "GST-registered Indian subsidiary",
    schedule: { kind: "monthly", day: 11, followingMonth: true },
    whatThisIs: "Monthly outward supplies return. The 11th is a commonly cited due date.",
    ifMissed: "Late fees and interest on GST filings.",
    sourceUrl: "https://www.gst.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "none",
  },
  {
    id: "in-gstr3b",
    title: "GSTR-3B",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "indiaGst" },
    appliesLabel: "GST-registered Indian subsidiary",
    schedule: { kind: "monthly", day: 20, followingMonth: true },
    whatThisIs: "Monthly GST summary return and payment. The 20th is a commonly cited due date.",
    ifMissed: "Late fees and interest on GST filings.",
    sourceUrl: "https://www.gst.gov.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "none",
  },
  {
    id: "in-odi-apr",
    title: "ODI annual performance report",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "indianResidentFoundersHoldShares" },
    appliesLabel: "Indian-resident founders who hold shares in the US company",
    schedule: { kind: "fixed", month: 6, day: 30 },
    whatThisIs:
      "Annual Performance Report for overseas direct investment by an Indian resident.",
    ifMissed: "Possible FEMA reporting contravention.",
    sourceUrl: "https://www.rbi.org.in",
    verified: false,
    lastVerified: null,
    rollWeekend: "next-weekday",
  },
];

export function ruleApplies(
  condition: RuleCondition,
  profile: CompanyProfile,
  franchiseTax: number | null,
): boolean {
  switch (condition.type) {
    case "always":
      return true;
    case "flag":
      return Boolean(profile[condition.field]);
    case "indiaGst":
      return Boolean(profile.india?.gstRegistered);
    case "indiaFdi":
      return Boolean(profile.india?.receivesForeignInvestment);
    case "franchiseTaxAtLeast":
      return franchiseTax !== null && franchiseTax >= condition.amount;
    default:
      return false;
  }
}
