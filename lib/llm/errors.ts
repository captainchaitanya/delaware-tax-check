export const QUOTA_EXHAUSTED_MESSAGE =
  "The free AI quota for today is used up. Try a sample document, or come back tomorrow.";

export const CONFIG_MESSAGE = "AI isn't configured correctly";

export const INVALID_FORMAT_MESSAGE =
  "The AI's answer didn't match the expected format. Try again or edit the text.";

export const BUSY_MESSAGE =
  "The AI service is busy right now. Try again in a minute, or try a sample document below.";

export type ExtractErrorCode =
  | "empty"
  | "too_long"
  | "irrelevant"
  | "invalid"
  | "quota"
  | "config"
  | "busy"
  | "provider";

export class ExtractError extends Error {
  readonly code: ExtractErrorCode;

  constructor(code: ExtractErrorCode, message: string) {
    super(message);
    this.name = "ExtractError";
    this.code = code;
  }
}

export function statusFromError(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as { status: unknown }).status);
    return Number.isFinite(status) ? status : undefined;
  }
  return undefined;
}

export function sanitizeErrorMessage(value: string): string {
  return value
    .replace(/AIza[0-9A-Za-z_-]{10,}/g, "[redacted]")
    .replace(/(api[_-]?key)["'\s:=]+["']?[^"'\s]+/gi, "$1=[redacted]");
}

export function logExtractDebug(info: {
  stage: "api" | "zod";
  status?: number;
  message?: string;
  issues?: Array<{ path: string; code: string }>;
}) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  console.error("[extract]", {
    stage: info.stage,
    status: info.status ?? null,
    message: sanitizeErrorMessage(info.message ?? ""),
    issues: info.issues ?? null,
  });
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

export function isTransientError(error: unknown): boolean {
  if (error instanceof ExtractError) {
    return error.code === "busy";
  }
  const status = statusFromError(error);
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    status === 429
  ) {
    return false;
  }
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/429|quota|resource exhausted|rate limit/i.test(message)) {
    return false;
  }
  return (
    status === 503 ||
    status === 502 ||
    status === 504 ||
    /UNAVAILABLE|ETIMEDOUT|ECONNRESET|ENOTFOUND|ECONNREFUSED|timeout|timed out|network|fetch failed|socket hang up/i.test(
      message,
    )
  );
}

export function providerErrorToExtractError(error: unknown): ExtractError {
  if (error instanceof ExtractError) {
    return error;
  }
  const status = statusFromError(error);
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (
    status === 429 ||
    /429|quota|resource exhausted|rate limit/i.test(message)
  ) {
    return new ExtractError("quota", QUOTA_EXHAUSTED_MESSAGE);
  }
  if (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 404 ||
    /api[_-]?key|invalid.?key|permission denied|unauthenticated|model.+not found|not found.+model|INVALID_ARGUMENT|missing gemini|missing anthropic/i.test(
      message,
    )
  ) {
    return new ExtractError("config", CONFIG_MESSAGE);
  }
  if (isTransientError(error)) {
    return new ExtractError("busy", BUSY_MESSAGE);
  }
  return new ExtractError(
    "provider",
    "The model could not read that just now.",
  );
}
