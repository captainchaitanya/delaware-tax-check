import { newClassForm } from "../example";
import type { CalculatorForm } from "../formTypes";
import type { Jurisdiction } from "../deadlines/rules";
import type { CustomDeadline } from "../deadlines/custom";
import type { DocumentType, ExtractionResult } from "./schema";

export const DOCUMENT_TYPE_LABEL: Record<DocumentType, string> = {
  delaware_franchise_tax_notice: "Delaware franchise tax notice",
  certificate_of_incorporation: "Certificate of Incorporation",
  irs_notice: "IRS notice",
  mca_roc_notice: "MCA / ROC notice",
  gst_notice: "GST notice",
  bank_kyc_letter: "Bank / KYC letter",
  other: "Other document",
};

export function jurisdictionForDocument(type: DocumentType): Jurisdiction {
  if (type === "irs_notice") {
    return "US-Federal";
  }
  if (
    type === "mca_roc_notice" ||
    type === "gst_notice" ||
    type === "bank_kyc_letter"
  ) {
    return "India";
  }
  return "US-Delaware";
}

export function shareStructureFromExtraction(
  extraction: ExtractionResult,
  existing: CalculatorForm | null,
): CalculatorForm | null {
  if (extraction.shareClasses.length === 0) {
    return null;
  }
  return {
    issuedShares: existing?.issuedShares ?? "",
    grossAssets: existing?.grossAssets ?? "",
    classes: extraction.shareClasses.map((share, index) =>
      newClassForm({
        id: existing?.classes[index]?.id ?? `extracted-${index + 1}`,
        name: share.name,
        authorized: share.authorized,
        parValue: share.parValue,
      }),
    ),
  };
}

export function customDeadlineFromExtraction(
  extraction: ExtractionResult,
  documentId: string,
  edits: { title: string; isoDate: string; action: string },
): CustomDeadline | null {
  if (!edits.isoDate || !edits.title.trim()) {
    return null;
  }
  return {
    id: `custom:${documentId}`,
    title: edits.title.trim(),
    isoDate: edits.isoDate,
    jurisdiction: jurisdictionForDocument(extraction.documentType),
    whatThisIs: edits.action.trim() || extraction.requiredAction,
    ifMissed: "Confirm the official notice. Missing a stated date can bring fees or penalties.",
    source: "document",
    documentId,
  };
}
