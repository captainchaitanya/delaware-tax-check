import Anthropic from "@anthropic-ai/sdk";
import { providerErrorToExtractError } from "../errors";
import { buildExtractUserPrompt, EXTRACT_SYSTEM_PROMPT } from "../prompt";
import { EXTRACTION_JSON_SCHEMA } from "../schema";

function textFromMessage(message: { content: Array<{ type: string; text?: string }> }): string {
  return message.content
    .filter((block) => block.type === "text" && block.text)
    .map((block) => block.text)
    .join("\n")
    .trim();
}

export async function extractWithAnthropic(text: string): Promise<unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw providerErrorToExtractError(new Error("Missing ANTHROPIC_API_KEY"));
  }
  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 4096,
      system: EXTRACT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `${buildExtractUserPrompt(text)}\n\nJSON schema:\n${JSON.stringify(EXTRACTION_JSON_SCHEMA)}`,
        },
      ],
    });
    const raw = textFromMessage(message);
    const stripped = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(stripped) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw error;
    }
    throw providerErrorToExtractError(error);
  }
}
