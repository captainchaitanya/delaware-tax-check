import { z } from "zod";

export const MAX_DOCUMENT_CHARS = 20_000;

function asNonEmptyString(value: unknown): unknown {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return value;
}

function asIsoDate(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  const day = /^(\d{4}-\d{2}-\d{2})/.exec(trimmed);
  return day ? day[1] : trimmed;
}

const requiredString = z.preprocess(asNonEmptyString, z.string().min(1));
const isoDateString = z.preprocess(
  asIsoDate,
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
);

export const DOCUMENT_TYPES = [
  "delaware_franchise_tax_notice",
  "certificate_of_incorporation",
  "irs_notice",
  "mca_roc_notice",
  "gst_notice",
  "bank_kyc_letter",
  "other",
] as const;

export const CONFIDENCE_LEVELS = ["high", "medium", "low"] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];
export type Confidence = (typeof CONFIDENCE_LEVELS)[number];

export const extractedFieldSchema = z.object({
  key: requiredString,
  label: requiredString,
  value: requiredString,
  quote: requiredString,
  confidence: z.enum(CONFIDENCE_LEVELS),
});

export const shareClassExtractSchema = z.object({
  name: requiredString,
  authorized: requiredString,
  parValue: requiredString,
  quote: requiredString,
  confidence: z.enum(CONFIDENCE_LEVELS),
});

export const extractedDeadlineSchema = z.object({
  title: requiredString,
  isoDate: isoDateString,
  action: requiredString,
  quote: requiredString,
  confidence: z.enum(CONFIDENCE_LEVELS),
});

export const extractionResultSchema = z.object({
  relevant: z.boolean(),
  documentType: z.enum(DOCUMENT_TYPES),
  issuer: z.string().min(1),
  summary: z.string().min(1),
  fields: z.array(extractedFieldSchema),
  shareClasses: z.array(shareClassExtractSchema),
  deadline: extractedDeadlineSchema.nullable(),
  requiredAction: z.string().min(1),
});

export type ExtractedField = z.infer<typeof extractedFieldSchema>;
export type ShareClassExtract = z.infer<typeof shareClassExtractSchema>;
export type ExtractedDeadline = z.infer<typeof extractedDeadlineSchema>;
export type ExtractionResult = z.infer<typeof extractionResultSchema>;

export function clipQuote(quote: string): string {
  return quote.trim().split(/\s+/).filter(Boolean).slice(0, 15).join(" ");
}

export function clipExtraction(value: ExtractionResult): ExtractionResult {
  return {
    ...value,
    fields: value.fields.map((field) => ({
      ...field,
      quote: clipQuote(field.quote),
    })),
    shareClasses: value.shareClasses.map((share) => ({
      ...share,
      quote: clipQuote(share.quote),
    })),
    deadline: value.deadline
      ? { ...value.deadline, quote: clipQuote(value.deadline.quote) }
      : null,
  };
}

export const EXTRACTION_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "relevant",
    "documentType",
    "issuer",
    "summary",
    "fields",
    "shareClasses",
    "deadline",
    "requiredAction",
  ],
  properties: {
    relevant: { type: "boolean" },
    documentType: { type: "string", enum: [...DOCUMENT_TYPES] },
    issuer: { type: "string" },
    summary: { type: "string" },
    fields: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "label", "value", "quote", "confidence"],
        properties: {
          key: { type: "string" },
          label: { type: "string" },
          value: { type: "string" },
          quote: { type: "string" },
          confidence: { type: "string", enum: [...CONFIDENCE_LEVELS] },
        },
      },
    },
    shareClasses: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "authorized", "parValue", "quote", "confidence"],
        properties: {
          name: { type: "string" },
          authorized: { type: "string" },
          parValue: { type: "string" },
          quote: { type: "string" },
          confidence: { type: "string", enum: [...CONFIDENCE_LEVELS] },
        },
      },
    },
    deadline: {
      type: ["object", "null"],
      additionalProperties: false,
      required: ["title", "isoDate", "action", "quote", "confidence"],
      properties: {
        title: { type: "string" },
        isoDate: { type: "string" },
        action: { type: "string" },
        quote: { type: "string" },
        confidence: { type: "string", enum: [...CONFIDENCE_LEVELS] },
      },
    },
    requiredAction: { type: "string" },
  },
} as const;
