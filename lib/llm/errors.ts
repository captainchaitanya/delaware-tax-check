export const QUOTA_EXHAUSTED_MESSAGE =
  "The free AI quota for today is used up. Try a sample document, or come back tomorrow.";

export type ExtractErrorCode =
  | "empty"
  | "too_long"
  | "irrelevant"
  | "invalid"
  | "quota"
  | "provider";

export class ExtractError extends Error {
  readonly code: ExtractErrorCode;

  constructor(code: ExtractErrorCode, message: string) {
    super(message);
    this.name = "ExtractError";
    this.code = code;
  }
}

export function messageForExtractError(error: unknown): {
  code: ExtractErrorCode;
  message: string;
} {
  if (error instanceof ExtractError) {
    return { code: error.code, message: error.message };
  }
  return {
    code: "provider",
    message: "The model could not read that just now.",
  };
}

export function providerErrorToExtractError(error: unknown): ExtractError {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status: unknown }).status)
      : undefined;
  const message = error instanceof Error ? error.message : "";
  if (
    status === 429 ||
    /429|quota|resource exhausted|rate limit/i.test(message)
  ) {
    return new ExtractError("quota", QUOTA_EXHAUSTED_MESSAGE);
  }
  return new ExtractError(
    "provider",
    "The model could not read that just now.",
  );
}
