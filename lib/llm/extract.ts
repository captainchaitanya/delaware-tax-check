import {
  BUSY_MESSAGE,
  ExtractError,
  INVALID_FORMAT_MESSAGE,
  isTransientError,
  logExtractDebug,
  providerErrorToExtractError,
} from "./errors";
import type { ExtractOutcome, ExtractSuccess } from "./outcome";
import { extractWithAnthropic } from "./providers/anthropic";
import {
  extractWithGemini,
  resolveGeminiModel,
} from "./providers/gemini";
import { extractWithMock } from "./providers/mock";
import { matchSampleDocument } from "./samples";
import {
  clipExtraction,
  extractionResultSchema,
  MAX_DOCUMENT_CHARS,
  type ExtractionResult,
} from "./schema";
import {
  resolveProvider,
  type EnvLike,
  type LlmProviderId,
  type ProviderResolution,
} from "./selectProvider";

export type { ExtractOutcome } from "./outcome";

export const RETRY_BACKOFF_MS = [1000, 3000] as const;

export type CallProviderOptions = {
  model?: string;
};

export type ExtractDeps = {
  callProvider?: (
    id: LlmProviderId,
    text: string,
    options?: CallProviderOptions,
  ) => Promise<unknown>;
  sleep?: (ms: number) => Promise<void>;
};

async function defaultSleep(ms: number): Promise<void> {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function callProvider(
  id: LlmProviderId,
  text: string,
  options?: CallProviderOptions,
): Promise<unknown> {
  if (id === "gemini") {
    return extractWithGemini(text, options?.model);
  }
  if (id === "anthropic") {
    return extractWithAnthropic(text);
  }
  return extractWithMock(text);
}

function parseResult(raw: unknown): ExtractionResult {
  const parsed = extractionResultSchema.safeParse(raw);
  if (!parsed.success) {
    logExtractDebug({
      stage: "zod",
      message: "Zod rejected the model JSON",
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join(".") || "(root)",
        code: issue.code,
      })),
    });
    throw new ExtractError("invalid", INVALID_FORMAT_MESSAGE);
  }
  const clipped = clipExtraction(parsed.data);
  if (!clipped.relevant) {
    throw new ExtractError(
      "irrelevant",
      "That does not look like a notice or certificate. Paste the text of a filing letter.",
    );
  }
  return clipped;
}

function validateInput(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new ExtractError("empty", "Paste the text of a notice or certificate.");
  }
  if (trimmed.length > MAX_DOCUMENT_CHARS) {
    throw new ExtractError(
      "too_long",
      `Keep the document under ${MAX_DOCUMENT_CHARS.toLocaleString()} characters.`,
    );
  }
  return trimmed;
}

function success(
  result: ExtractionResult,
  resolution: ProviderResolution,
  extra: { provider?: LlmProviderId; demoMode?: boolean; sampleResult: boolean },
): ExtractSuccess {
  return {
    ok: true,
    result,
    provider: extra.provider ?? resolution.id,
    requestedProvider: resolution.requested,
    demoMode: extra.demoMode ?? resolution.demoMode,
    sampleResult: extra.sampleResult,
  };
}

function mapOrKeep(error: unknown): ExtractError {
  return error instanceof ExtractError
    ? error
    : providerErrorToExtractError(error);
}

async function extractOnce(
  text: string,
  resolution: ProviderResolution,
  live: ExtractDeps["callProvider"],
  model?: string,
): Promise<ExtractionResult> {
  const raw = await (live ?? callProvider)(resolution.id, text, { model });
  return parseResult(raw);
}

async function extractWithResilience(
  text: string,
  resolution: ProviderResolution,
  env: EnvLike,
  deps: ExtractDeps,
): Promise<ExtractionResult> {
  const sleep = deps.sleep ?? defaultSleep;
  const primary =
    resolution.id === "gemini" ? resolveGeminiModel(env) : undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_BACKOFF_MS.length; attempt += 1) {
    try {
      return await extractOnce(text, resolution, deps.callProvider, primary);
    } catch (error) {
      lastError = error;
      const mapped = mapOrKeep(error);
      if (
        mapped.code === "invalid" ||
        mapped.code === "quota" ||
        mapped.code === "config" ||
        mapped.code === "empty" ||
        mapped.code === "too_long" ||
        mapped.code === "irrelevant"
      ) {
        throw mapped;
      }
      if (!isTransientError(error) && !isTransientError(mapped)) {
        throw mapped;
      }
      if (attempt < RETRY_BACKOFF_MS.length) {
        await sleep(RETRY_BACKOFF_MS[attempt]!);
      }
    }
  }

  const fallback = env.GEMINI_FALLBACK_MODEL?.trim();
  if (
    fallback &&
    fallback !== primary &&
    resolution.id === "gemini"
  ) {
    try {
      return await extractOnce(text, resolution, deps.callProvider, fallback);
    } catch (error) {
      lastError = error;
      const mapped = mapOrKeep(error);
      if (
        mapped.code === "invalid" ||
        mapped.code === "quota" ||
        mapped.code === "config"
      ) {
        throw mapped;
      }
    }
  }

  throw lastError instanceof ExtractError && lastError.code === "busy"
    ? lastError
    : new ExtractError("busy", BUSY_MESSAGE);
}

export async function extractDocument(
  text: string,
  env: EnvLike = process.env,
  deps: ExtractDeps = {},
): Promise<ExtractOutcome> {
  const resolution = resolveProvider(env);
  try {
    const trimmed = validateInput(text);
    const sample = matchSampleDocument(trimmed);
    if (sample) {
      return success(structuredClone(sample.result), resolution, {
        provider: "mock",
        demoMode: true,
        sampleResult: true,
      });
    }
    const result = await extractWithResilience(
      trimmed,
      resolution,
      env,
      deps,
    );
    return success(result, resolution, { sampleResult: false });
  } catch (error) {
    if (error instanceof ExtractError) {
      return {
        ok: false,
        code: error.code,
        error: error.message,
        provider: resolution.id,
        requestedProvider: resolution.requested,
        demoMode: resolution.demoMode,
      };
    }
    const mapped = providerErrorToExtractError(error);
    return {
      ok: false,
      code: mapped.code,
      error: mapped.message,
      provider: resolution.id,
      requestedProvider: resolution.requested,
      demoMode: resolution.demoMode,
    };
  }
}
