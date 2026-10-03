import { z } from "zod";

export const MAX_DOCUMENT_CHARS = 20_000;

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
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  quote: z.string().min(1),
  confidence: z.enum(CONFIDENCE_LEVELS),
});

export const shareClassExtractSchema = z.object({
  name: z.string().min(1),
  authorized: z.string().min(1),
  parValue: z.string().min(1),
  quote: z.string().min(1),
  confidence: z.enum(CONFIDENCE_LEVELS),
});

export const extractedDeadlineSchema = z.object({
  title: z.string().min(1),
  isoDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  action: z.string().min(1),
  quote: z.string().min(1),
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
      anyOf: [
        { type: "null" },
        {
          type: "object",
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
      ],
    },
    requiredAction: { type: "string" },
  },
} as const;
