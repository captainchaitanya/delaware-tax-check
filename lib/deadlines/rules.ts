import type { CompanyProfile } from "../profile";
import type { VerificationStatus } from "../verification";
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
  | { type: "indiaTransactsWithParent" }
  | { type: "us5472" }
  | { type: "franchiseTaxAtLeast"; amount: number };

export type RuleSchedule =
  | { kind: "fixed"; month: number; day: number }
  | {
      kind: "monthsAfterFyEnd";
      fy: "us" | "india";
      months: number;
      day: number;
      june30Months?: number;
    }
  | { kind: "daysAfterFyEnd"; fy: "us" | "india"; days: number }
  | { kind: "monthly"; day: number; followingMonth: boolean }
  | { kind: "quarterly"; monthDays: Array<{ month: number; day: number }> }
  | { kind: "relative"; afterRuleId: string; days: number }
  | { kind: "dir3Kyc" }
  | { kind: "indiaCompanyItr" };

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
  sources: string[];
  status: VerificationStatus;
  lastChecked: string | null;
  notes: string;
  rollConvention: RollConvention;
};

export type RollConvention = "next_business_day" | "none" | "unknown";

const US: TimeZoneId = "America/New_York";
const IN: TimeZoneId = "Asia/Kolkata";
const CHECKED = "2026-10-03";
const INDIA_IT_NOTE =
  "India's new Income-tax Act may rename forms; recheck before filing season.";

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
      "Annual franchise tax and annual report filed with the Delaware Division of Corporations. The annual report fee is $50 for a non-exempt corporation. The ordinary maximum tax is $200,000.",
    ifMissed:
      "Late penalty of $200 plus 1.5% interest per month on the tax and the penalty. The company can fall out of good standing.",
    sources: ["https://corp.delaware.gov/paytaxes/"],
    status: "verified",
    lastChecked: CHECKED,
    notes:
      "Large Corporate Filers may have a $250,000 maximum. Weekend/holiday handling is still unknown.",
    rollConvention: "unknown",
  },
  {
    id: "de-franchise-q-jun",
    title: "Delaware franchise tax estimate — June",
    jurisdiction: "US-Delaware",
    timeZone: US,
    appliesTo: { type: "franchiseTaxAtLeast", amount: 5_000 },
    appliesLabel: "When annual franchise tax is $5,000 or more",
    schedule: { kind: "fixed", month: 6, day: 1 },
    whatThisIs:
      "First quarterly estimated franchise tax payment: 40% of the annual tax, due June 1. The remainder is due March 1 with the annual return.",
    ifMissed: "Interest can accrue on the unpaid estimate.",
    sources: ["https://corp.delaware.gov/frtaxcalc/"],
    status: "verified",
    lastChecked: CHECKED,
    notes: "",
    rollConvention: "unknown",
  },
  {
    id: "de-franchise-q-sep",
    title: "Delaware franchise tax estimate — September",
    jurisdiction: "US-Delaware",
    timeZone: US,
    appliesTo: { type: "franchiseTaxAtLeast", amount: 5_000 },
    appliesLabel: "When annual franchise tax is $5,000 or more",
    schedule: { kind: "fixed", month: 9, day: 1 },
    whatThisIs: "Second quarterly estimated franchise tax payment: 20%, due September 1.",
    ifMissed: "Interest can accrue on the unpaid estimate.",
    sources: ["https://corp.delaware.gov/frtaxcalc/"],
    status: "verified",
    lastChecked: CHECKED,
    notes: "",
    rollConvention: "unknown",
  },
  {
    id: "de-franchise-q-dec",
    title: "Delaware franchise tax estimate — December",
    jurisdiction: "US-Delaware",
    timeZone: US,
    appliesTo: { type: "franchiseTaxAtLeast", amount: 5_000 },
    appliesLabel: "When annual franchise tax is $5,000 or more",
    schedule: { kind: "fixed", month: 12, day: 1 },
    whatThisIs: "Third quarterly estimated franchise tax payment: 20%, due December 1.",
    ifMissed: "Interest can accrue on the unpaid estimate.",
    sources: ["https://corp.delaware.gov/frtaxcalc/"],
    status: "verified",
    lastChecked: CHECKED,
    notes: "",
    rollConvention: "unknown",
  },
  {
    id: "us-1120",
    title: "Federal corporate income tax return (Form 1120)",
    jurisdiction: "US-Federal",
    timeZone: US,
    appliesTo: { type: "always" },
    appliesLabel: "US C-corporations",
    schedule: {
      kind: "monthsAfterFyEnd",
      fy: "us",
      months: 4,
      day: 15,
      june30Months: 3,
    },
    whatThisIs:
      "Annual Form 1120, due on the 15th day of the 4th month after the US tax year ends, except that a tax year ending June 30 is due on the 15th day of the 3rd month. An extension may be available on Form 7004.",
    ifMissed: "IRS late-filing and late-payment penalties can apply.",
    sources: ["https://www.irs.gov/instructions/i1120"],
    status: "verified",
    lastChecked: CHECKED,
    notes: "rollConvention next_business_day is verified.",
    rollConvention: "next_business_day",
  },
  {
    id: "us-5472",
    title: "Form 5472 (25%+ foreign-owned reporting)",
    jurisdiction: "US-Federal",
    timeZone: US,
    appliesTo: { type: "us5472" },
    appliesLabel:
      "US companies that are 25% or more foreign-owned and have reportable transactions with a related party",
    schedule: {
      kind: "monthsAfterFyEnd",
      fy: "us",
      months: 4,
      day: 15,
      june30Months: 3,
    },
    whatThisIs:
      "Information return filed with the Form 1120, including any extension, when the company is 25% or more foreign-owned and has reportable transactions with a related party.",
    ifMissed: "The IRS can assess a $25,000 penalty per failure.",
    sources: ["https://www.irs.gov/instructions/i5472"],
    status: "verified",
    lastChecked: CHECKED,
    notes: "",
    rollConvention: "next_business_day",
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
      "Form 1099-NEC furnished to recipients and filed with the IRS by January 31.",
    ifMissed: "Per-form IRS penalties can apply for late or missing 1099s.",
    sources: [
      "https://www.irs.gov/businesses/small-businesses-self-employed/information-return-reporting",
    ],
    status: "verified",
    lastChecked: CHECKED,
    notes: "",
    rollConvention: "next_business_day",
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
    sources: ["https://www.mca.gov.in"],
    status: "unverified",
    lastChecked: null,
    notes:
      "First AGM is due within 9 months of the end of the first financial year.",
    rollConvention: "none",
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
    sources: ["https://www.mca.gov.in"],
    status: "unverified",
    lastChecked: null,
    notes: "",
    rollConvention: "none",
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
    sources: ["https://www.mca.gov.in"],
    status: "unverified",
    lastChecked: null,
    notes: "",
    rollConvention: "none",
  },
  {
    id: "in-itr",
    title: "Indian company income tax return",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Indian subsidiary",
    schedule: { kind: "indiaCompanyItr" },
    whatThisIs:
      "Company income-tax return for the Indian subsidiary. Due 31 October, or 30 November if a transfer pricing report (Form 3CEB) is required.",
    ifMissed: "Interest, late fees, and possible prosecution exposure.",
    sources: ["https://www.incometax.gov.in"],
    status: "reviewed",
    lastChecked: CHECKED,
    notes: INDIA_IT_NOTE,
    rollConvention: "none",
  },
  {
    id: "in-3ceb",
    title: "Form 3CEB transfer pricing report",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "indiaTransactsWithParent" },
    appliesLabel: "Indian subsidiary that transacts with the US parent",
    schedule: { kind: "fixed", month: 10, day: 31 },
    whatThisIs:
      "Accountant's report on international transactions (Form 3CEB), commonly due 31 October when the subsidiary transacts with the US parent.",
    ifMissed: "Transfer-pricing penalties can apply for a late or missing report.",
    sources: ["https://www.incometax.gov.in"],
    status: "reviewed",
    lastChecked: CHECKED,
    notes: INDIA_IT_NOTE,
    rollConvention: "none",
  },
  {
    id: "in-dir3-kyc",
    title: "DIR-3 KYC",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "hasIndianSubsidiary" },
    appliesLabel: "Each director of the Indian subsidiary",
    schedule: { kind: "dir3Kyc" },
    whatThisIs:
      "Director KYC filed once every three financial years, due 30 June of the year after the third FY, anchored to the DIN allotment year.",
    ifMissed: "DIN can be deactivated and a fee charged to reactivate.",
    sources: ["https://www.mca.gov.in"],
    status: "reviewed",
    lastChecked: CHECKED,
    notes:
      "Changes to address, email or phone must be filed within 30 days, separately. Source: G.S.R. 943(E) dated 31 Dec 2025.",
    rollConvention: "none",
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
      "Annual Foreign Liabilities and Assets return to the Reserve Bank of India. 15 July confirmed for FY 2025-26.",
    ifMissed: "RBI can treat this as a contravention of FEMA reporting.",
    sources: ["https://www.rbi.org.in"],
    status: "reviewed",
    lastChecked: CHECKED,
    notes: "",
    rollConvention: "none",
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
    sources: ["https://www.incometax.gov.in"],
    status: "unverified",
    lastChecked: null,
    notes: INDIA_IT_NOTE,
    rollConvention: "none",
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
    sources: ["https://www.gst.gov.in"],
    status: "unverified",
    lastChecked: null,
    notes:
      "Dates shown are for monthly filers; quarterly (QRMP) filers have different dates.",
    rollConvention: "none",
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
    sources: ["https://www.gst.gov.in"],
    status: "unverified",
    lastChecked: null,
    notes:
      "Dates shown are for monthly filers; quarterly (QRMP) filers have different dates.",
    rollConvention: "none",
  },
  {
    id: "in-odi-apr",
    title: "ODI annual performance report",
    jurisdiction: "India",
    timeZone: IN,
    appliesTo: { type: "flag", field: "indianResidentFoundersHoldShares" },
    appliesLabel:
      "Indian-resident founders who hold shares in the US company as overseas direct investment",
    schedule: { kind: "fixed", month: 12, day: 31 },
    whatThisIs:
      "Annual Performance Report for overseas direct investment by an Indian resident, due 31 December.",
    ifMissed: "Possible FEMA reporting contravention.",
    sources: ["https://www.rbi.org.in"],
    status: "reviewed",
    lastChecked: CHECKED,
    notes:
      "Applies if the Indian resident's holding counts as overseas direct investment (generally 10%+ or control); filed through the authorised dealer bank.",
    rollConvention: "none",
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
    case "indiaTransactsWithParent":
      return Boolean(profile.india?.transactsWithUsParent);
    case "us5472":
      return (
        profile.foreignOwned25 && profile.reportableRelatedPartyTransactions
      );
    case "franchiseTaxAtLeast":
      return franchiseTax !== null && franchiseTax >= condition.amount;
    default:
      return false;
  }
}

export function candidateLogic(rule: DeadlineRule): string {
  switch (rule.schedule.kind) {
    case "fixed":
      return `${monthName(rule.schedule.month)} ${rule.schedule.day}`;
    case "monthsAfterFyEnd":
      return rule.schedule.june30Months
        ? `${rule.schedule.day}th day of the ${rule.schedule.months}th month after US tax year end; June 30 year ends use the ${rule.schedule.june30Months}rd month`
        : `${rule.schedule.day}th day of the ${rule.schedule.months}th month after ${rule.schedule.fy} year end`;
    case "daysAfterFyEnd":
      return `${rule.schedule.days} days after India FY end`;
    case "monthly":
      return `${rule.schedule.day}th of the ${rule.schedule.followingMonth ? "following " : ""}month`;
    case "quarterly":
      return rule.schedule.monthDays
        .map((slot) => `${monthName(slot.month)} ${slot.day}`)
        .join(" / ");
    case "relative":
      return `${rule.schedule.days} days after ${rule.schedule.afterRuleId}`;
    case "dir3Kyc":
      return "30 June of the year after the 3rd FY, from DIN allotment year (default on/before 31 Mar 2025 → 30 Jun 2028)";
    case "indiaCompanyItr":
      return "31 October, or 30 November if Form 3CEB is required";
    default:
      return "";
  }
}

function monthName(month: number): string {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][month - 1] ?? String(month);
}
