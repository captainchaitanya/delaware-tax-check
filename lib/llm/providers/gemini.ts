import { GoogleGenAI } from "@google/genai";
import {
  CONFIG_MESSAGE,
  ExtractError,
  logExtractDebug,
  providerErrorToExtractError,
  sanitizeErrorMessage,
  statusFromError,
} from "../errors";
import { buildExtractUserPrompt, EXTRACT_SYSTEM_PROMPT } from "../prompt";
import { EXTRACTION_JSON_SCHEMA } from "../schema";

function textFromResponse(response: {
  text?: string;
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}): string {
  const direct = response.text?.trim() ?? "";
  if (direct) {
    return direct;
  }
  return (response.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

export function resolveGeminiModel(
  env: Record<string, string | undefined> = process.env,
): string {
  return env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
}

export async function extractWithGemini(
  text: string,
  model = resolveGeminiModel(),
): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logExtractDebug({
      stage: "api",
      message: "GEMINI_API_KEY is not set",
    });
    throw new ExtractError("config", CONFIG_MESSAGE);
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: buildExtractUserPrompt(text),
      config: {
        systemInstruction: EXTRACT_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: EXTRACTION_JSON_SCHEMA,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });
    const raw = textFromResponse(response);
    if (!raw) {
      throw new ExtractError(
        "invalid",
        "The model returned an empty response.",
      );
    }
    const stripped = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(stripped) as unknown;
  } catch (error) {
    if (error instanceof ExtractError) {
      throw error;
    }
    logExtractDebug({
      stage: "api",
      status: statusFromError(error),
      message:
        error instanceof Error
          ? error.message
          : sanitizeErrorMessage(String(error)),
    });
    if (error instanceof SyntaxError) {
      throw error;
    }
    throw providerErrorToExtractError(error);
  }
}
