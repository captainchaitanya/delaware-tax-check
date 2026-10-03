import { GoogleGenAI } from "@google/genai";
import { providerErrorToExtractError } from "../errors";
import { buildExtractUserPrompt, EXTRACT_SYSTEM_PROMPT } from "../prompt";
import { EXTRACTION_JSON_SCHEMA } from "../schema";

export async function extractWithGemini(text: string): Promise<unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw providerErrorToExtractError(new Error("Missing GEMINI_API_KEY"));
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: buildExtractUserPrompt(text),
      config: {
        systemInstruction: EXTRACT_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: EXTRACTION_JSON_SCHEMA,
      },
    });
    const raw = response.text?.trim() ?? "";
    return JSON.parse(raw) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw error;
    }
    throw providerErrorToExtractError(error);
  }
}
