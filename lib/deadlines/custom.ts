import type { Jurisdiction } from "./rules";

export type CustomDeadlineSource = "document" | "manual";

export type CustomDeadline = {
  id: string;
  title: string;
  isoDate: string;
  jurisdiction: Jurisdiction;
  whatThisIs: string;
  ifMissed: string;
  source: CustomDeadlineSource;
  documentId: string | null;
};
