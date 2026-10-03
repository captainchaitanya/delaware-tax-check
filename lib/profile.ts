import { z } from "zod";
import type { CalculatorForm, ClassForm } from "./formTypes";

export const usEntitySchema = z.literal("delaware-c-corp");
export const indiaFinancialYearSchema = z.literal("apr-mar");

export const taxYearEndSchema = z
  .object({
    month: z.number().int().min(1).max(12),
    day: z.number().int().min(1).max(31),
  })
  .refine((value) => isValidMonthDay(value.month, value.day), {
    message: "Enter a valid month and day",
  });

export const shareClassFormSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  authorized: z.string(),
  parValue: z.string(),
});

export const shareStructureSchema = z.object({
  issuedShares: z.string(),
  grossAssets: z.string(),
  classes: z.array(shareClassFormSchema).min(1),
});

export const indiaDetailsSchema = z.object({
  financialYear: indiaFinancialYearSchema,
  gstRegistered: z.boolean(),
  receivesForeignInvestment: z.boolean(),
  directorCount: z.number().int().min(1, "Enter at least one director"),
});

export const companyProfileSchema = z
  .object({
    companyName: z.string().trim().min(1, "Enter the company name"),
    usEntity: usEntitySchema,
    usTaxYearEnd: taxYearEndSchema,
    foreignOwned25: z.boolean(),
    hasIndianSubsidiary: z.boolean(),
    india: indiaDetailsSchema.nullable(),
    indianResidentFoundersHoldShares: z.boolean(),
    paysUsContractors: z.boolean(),
    shareStructure: shareStructureSchema.nullable(),
    completedAt: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    if (value.hasIndianSubsidiary && value.india === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add Indian subsidiary details",
        path: ["india"],
      });
    }
    if (!value.hasIndianSubsidiary && value.india !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Clear Indian subsidiary details when there is no subsidiary",
        path: ["india"],
      });
    }
  });

export type CompanyProfile = z.infer<typeof companyProfileSchema>;
export type IndiaDetails = z.infer<typeof indiaDetailsSchema>;
export type TaxYearEnd = z.infer<typeof taxYearEndSchema>;

export const DEFAULT_TAX_YEAR_END: TaxYearEnd = { month: 12, day: 31 };

export function emptyShareStructure(): CalculatorForm {
  return {
    issuedShares: "",
    grossAssets: "",
    classes: [emptyShareClass("class-1", "Common")],
  };
}

export function emptyShareClass(id: string, name = ""): ClassForm {
  return { id, name, authorized: "", parValue: "" };
}

export function createDraftProfile(): Omit<CompanyProfile, "completedAt"> {
  return {
    companyName: "",
    usEntity: "delaware-c-corp",
    usTaxYearEnd: { ...DEFAULT_TAX_YEAR_END },
    foreignOwned25: false,
    hasIndianSubsidiary: false,
    india: null,
    indianResidentFoundersHoldShares: false,
    paysUsContractors: false,
    shareStructure: null,
  };
}

export function parseCompanyProfile(value: unknown): CompanyProfile {
  return companyProfileSchema.parse(value);
}

export function isValidMonthDay(month: number, day: number): boolean {
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day >= 1 && day <= (daysInMonth[month - 1] ?? 0);
}

export const SAMPLE_PROFILE: CompanyProfile = {
  companyName: "Northbridge Labs, Inc.",
  usEntity: "delaware-c-corp",
  usTaxYearEnd: { month: 12, day: 31 },
  foreignOwned25: true,
  hasIndianSubsidiary: true,
  india: {
    financialYear: "apr-mar",
    gstRegistered: true,
    receivesForeignInvestment: true,
    directorCount: 2,
  },
  indianResidentFoundersHoldShares: true,
  paysUsContractors: false,
  shareStructure: {
    issuedShares: "8,000,000",
    grossAssets: "100,000",
    classes: [
      {
        id: "class-1",
        name: "Common",
        authorized: "10,000,000",
        parValue: "0.00001",
      },
    ],
  },
  completedAt: "2026-10-03T00:00:00.000Z",
};
