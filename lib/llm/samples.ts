import type { ExtractionResult } from "./schema";

export type SampleDocument = {
  id: string;
  title: string;
  filename: string;
  text: string;
  result: ExtractionResult;
};

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: "delaware-notice",
    title: "Delaware franchise tax notice",
    filename: "delaware-franchise-notice.txt",
    text: `STATE OF DELAWARE
Division of Corporations
Franchise Tax Notice — Tax Year 2026

To: Northbridge Labs, Inc.
File Number: 7845123
Entity type: Domestic Corporation

NORTHBRIDGE-FRANCHISE-2027

Your annual Delaware franchise tax and annual report are due on March 1, 2027.

Estimated tax (Assumed Par Value Capital Method): $400.00
Annual report fee: $50.00
Total due: $450.00

Pay and file online with the Division of Corporations. Interest accrues on unpaid tax after the due date.

This notice is a sample for Founder Desk and does not come from the State of Delaware.
`,
    result: {
      relevant: true,
      documentType: "delaware_franchise_tax_notice",
      issuer: "Delaware Division of Corporations",
      summary:
        "Annual franchise tax and report for Northbridge Labs, due March 1, 2027, totaling $450.",
      fields: [
        {
          key: "company",
          label: "Company",
          value: "Northbridge Labs, Inc.",
          quote: "To: Northbridge Labs, Inc.",
          confidence: "high",
        },
        {
          key: "fileNumber",
          label: "File number",
          value: "7845123",
          quote: "File Number: 7845123",
          confidence: "high",
        },
        {
          key: "taxDue",
          label: "Estimated tax",
          value: "400",
          quote: "Assumed Par Value Capital Method): $400.00",
          confidence: "high",
        },
        {
          key: "reportFee",
          label: "Annual report fee",
          value: "50",
          quote: "Annual report fee: $50.00",
          confidence: "high",
        },
        {
          key: "totalDue",
          label: "Total due",
          value: "450",
          quote: "Total due: $450.00",
          confidence: "high",
        },
      ],
      shareClasses: [],
      deadline: {
        title: "Delaware franchise tax and annual report",
        isoDate: "2027-03-01",
        action: "File the annual report and pay $450.",
        quote: "due on March 1, 2027.",
        confidence: "high",
      },
      requiredAction: "Review the amount, then add March 1, 2027 to the calendar if it is new.",
    },
  },
  {
    id: "certificate",
    title: "Certificate of Incorporation",
    filename: "certificate-of-incorporation.txt",
    text: `CERTIFICATE OF INCORPORATION
OF
NORTHBRIDGE LABS, INC.

NORTHBRIDGE-COI-2024

FIRST. The name of the Corporation is Northbridge Labs, Inc.

SECOND. The registered office of the Corporation in the State of Delaware is 1209 Orange Street, Wilmington, County of New Castle.

THIRD. The total number of shares of stock that the Corporation is authorized to issue is 12,000,000 shares, divided as follows:

  Common Stock: 10,000,000 shares, par value $0.00001 per share.
  Series Seed Preferred Stock: 2,000,000 shares, par value $0.00001 per share.

FOURTH. The Corporation is to have perpetual existence.

This certificate is a fictional sample for Founder Desk. It is not a filed Delaware instrument.
`,
    result: {
      relevant: true,
      documentType: "certificate_of_incorporation",
      issuer: "Northbridge Labs, Inc.",
      summary:
        "Delaware certificate authorizing 10,000,000 common and 2,000,000 preferred shares at $0.00001 par.",
      fields: [
        {
          key: "company",
          label: "Company",
          value: "Northbridge Labs, Inc.",
          quote: "The name of the Corporation is Northbridge Labs, Inc.",
          confidence: "high",
        },
        {
          key: "totalAuthorized",
          label: "Total authorized shares",
          value: "12000000",
          quote: "authorized to issue is 12,000,000 shares",
          confidence: "high",
        },
      ],
      shareClasses: [
        {
          name: "Common",
          authorized: "10000000",
          parValue: "0.00001",
          quote: "Common Stock: 10,000,000 shares, par value $0.00001",
          confidence: "high",
        },
        {
          name: "Series Seed Preferred",
          authorized: "2000000",
          parValue: "0.00001",
          quote: "Series Seed Preferred Stock: 2,000,000 shares, par value $0.00001",
          confidence: "high",
        },
      ],
      deadline: null,
      requiredAction:
        "Review the share classes, then send them to the Franchise Tax Checker if they look right.",
    },
  },
  {
    id: "mca-notice",
    title: "MCA AOC-4 reminder",
    filename: "mca-aoc4-notice.txt",
    text: `GOVERNMENT OF INDIA
Ministry of Corporate Affairs
Office of the Registrar of Companies, Karnataka

Reminder: Filing of Form AOC-4

Company: Cedar Peak Ventures Private Limited
CIN: U74999KA2024PTC184221
CEDAR-PEAK-AOC4-2026

The annual general meeting of the company was held on 30 September 2026.

Form AOC-4 (financial statements) is due within 30 days of the AGM, on 30 October 2026.

Please file on the MCA portal. Additional fees may apply after the due date.

This is a fictional sample for Founder Desk. It is not an MCA or ROC communication.
`,
    result: {
      relevant: true,
      documentType: "mca_roc_notice",
      issuer: "Registrar of Companies, Karnataka",
      summary:
        "AOC-4 reminder for Cedar Peak Ventures, due 30 October 2026, 30 days after the AGM.",
      fields: [
        {
          key: "company",
          label: "Company",
          value: "Cedar Peak Ventures Private Limited",
          quote: "Company: Cedar Peak Ventures Private Limited",
          confidence: "high",
        },
        {
          key: "cin",
          label: "CIN",
          value: "U74999KA2024PTC184221",
          quote: "CIN: U74999KA2024PTC184221",
          confidence: "high",
        },
        {
          key: "agmDate",
          label: "AGM date",
          value: "2026-09-30",
          quote: "held on 30 September 2026.",
          confidence: "high",
        },
      ],
      shareClasses: [],
      deadline: {
        title: "AOC-4 financial statements",
        isoDate: "2026-10-30",
        action: "File Form AOC-4 on the MCA portal.",
        quote: "on 30 October 2026.",
        confidence: "high",
      },
      requiredAction: "Confirm the AGM date, then add 30 October 2026 to the calendar if needed.",
    },
  },
  {
    id: "irs-letter",
    title: "IRS-style 1120 letter",
    filename: "irs-1120-letter.txt",
    text: `Department of the Treasury
Internal Revenue Service
Ogden, UT 84201-0005

Notice Number: CP-FD-4481
NORTHBRIDGE-IRS-1120-2025

Northbridge Labs, Inc.
EIN: 98-0000000

We need information about your Form 1120, U.S. Corporation Income Tax Return, for the tax year ended December 31, 2025.

Your Form 1120 is due April 15, 2026. An extension, if filed, may give more time to file but not to pay tax that is due.

Please respond by April 15, 2026. Keep a copy of this letter with your records.

This letter is a fictional sample for Founder Desk. It is not from the Internal Revenue Service.
`,
    result: {
      relevant: true,
      documentType: "irs_notice",
      issuer: "Internal Revenue Service",
      summary:
        "IRS-style letter about Form 1120 for tax year 2025, asking for a response by April 15, 2026.",
      fields: [
        {
          key: "company",
          label: "Company",
          value: "Northbridge Labs, Inc.",
          quote: "Northbridge Labs, Inc.",
          confidence: "high",
        },
        {
          key: "ein",
          label: "EIN",
          value: "98-0000000",
          quote: "EIN: 98-0000000",
          confidence: "medium",
        },
        {
          key: "noticeNumber",
          label: "Notice number",
          value: "CP-FD-4481",
          quote: "Notice Number: CP-FD-4481",
          confidence: "high",
        },
        {
          key: "taxYearEnd",
          label: "Tax year end",
          value: "2025-12-31",
          quote: "tax year ended December 31, 2025.",
          confidence: "high",
        },
      ],
      shareClasses: [],
      deadline: {
        title: "Respond to IRS Form 1120 letter",
        isoDate: "2026-04-15",
        action: "Respond with the requested Form 1120 information.",
        quote: "Please respond by April 15, 2026.",
        confidence: "high",
      },
      requiredAction: "Read the request, then add April 15, 2026 to the calendar if you will act on it.",
    },
  },
];

export function matchSampleDocument(text: string): SampleDocument | null {
  const haystack = text.replace(/\s+/g, " ");
  return (
    SAMPLE_DOCUMENTS.find(
      (sample) =>
        haystack.includes(sample.text.replace(/\s+/g, " ").slice(0, 80)) ||
        sample.text
          .split("\n")
          .find((line) => /NORTHBRIDGE-|CEDAR-PEAK-/.test(line) && haystack.includes(line.trim())),
    ) ?? null
  );
}
