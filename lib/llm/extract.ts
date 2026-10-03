import {
  ExtractError,
  INVALID_FORMAT_MESSAGE,
  logExtractDebug,
  providerErrorToExtractError,
} from "./errors";
import type { ExtractOutcome, ExtractSuccess } from "./outcome";
import { extractWithAnthropic } from "./providers/anthropic";
import { extractWithGemini } from "./providers/gemini";
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

export type ExtractDeps = {
  callProvider?: (
    id: LlmProviderId,
    text: string,
  ) => Promise<unknown>;
};

async function callProvider(
  id: LlmProviderId,
  text: string,
): Promise<unknown> {
  if (id === "gemini") {
    return extractWithGemini(text);
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

async function extractOnce(
  text: string,
  resolution: ProviderResolution,
  live: ExtractDeps["callProvider"],
): Promise<ExtractionResult> {
  const raw = await (live ?? callProvider)(resolution.id, text);
  return parseResult(raw);
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
    try {
      const result = await extractOnce(trimmed, resolution, deps.callProvider);
      return success(result, resolution, { sampleResult: false });
    } catch (error) {
      if (error instanceof ExtractError && error.code !== "invalid") {
        throw error;
      }
      if (!(error instanceof ExtractError) && !(error instanceof SyntaxError)) {
        throw error;
      }
      const retry = await extractOnce(trimmed, resolution, deps.callProvider);
      return success(retry, resolution, { sampleResult: false });
    }
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
