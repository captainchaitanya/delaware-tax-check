export const VERIFICATION_STATUSES = [
  "verified",
  "reviewed",
  "unverified",
] as const;

export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];
