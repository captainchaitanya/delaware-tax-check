import { ExtractError, providerErrorToExtractError } from "./errors";
import type { ExtractOutcome } from "./outcome";
import { extractWithAnthropic } from "./providers/anthropic";
import { extractWithGemini } from "./providers/gemini";
import { extractWithMock } from "./providers/mock";
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
    throw new ExtractError(
      "invalid",
      "The model returned something we could not use. Try again.",
    );
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

async function extractOnce(
  text: string,
  resolution: ProviderResolution,
): Promise<ExtractionResult> {
  const raw = await callProvider(resolution.id, text);
  return parseResult(raw);
}

export async function extractDocument(
  text: string,
  env: EnvLike = process.env,
): Promise<ExtractOutcome> {
  const resolution = resolveProvider(env);
  try {
    const trimmed = validateInput(text);
    try {
      const result = await extractOnce(trimmed, resolution);
      return {
        ok: true,
        result,
        provider: resolution.id,
        requestedProvider: resolution.requested,
        demoMode: resolution.demoMode,
      };
    } catch (error) {
      if (error instanceof ExtractError && error.code !== "invalid") {
        throw error;
      }
      const retry = await extractOnce(trimmed, resolution);
      return {
        ok: true,
        result: retry,
        provider: resolution.id,
        requestedProvider: resolution.requested,
        demoMode: resolution.demoMode,
      };
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
