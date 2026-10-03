import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { GoogleGenAI } from "@google/genai";
import { extractDocument } from "../lib/llm/extract";
import { buildExtractUserPrompt, EXTRACT_SYSTEM_PROMPT } from "../lib/llm/prompt";
import { EXTRACTION_JSON_SCHEMA, extractionResultSchema } from "../lib/llm/schema";
import { resolveProvider } from "../lib/llm/selectProvider";

const NOTICE = `CEDAR-CHECK-AI-NOTICE
Registered agent reminder for Cedar Peak Technologies, Inc.
This fictional Delaware franchise tax notice says the annual report
and franchise tax are due on 2027-03-01. Estimated tax: 400.
Authorized shares: 10000000. Par value: 0.00001.
This is not a government document.`;

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function printError(error: unknown) {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? Number((error as { status: unknown }).status)
      : undefined;
  console.error("exact error:");
  console.error(
    JSON.stringify(
      {
        name: error instanceof Error ? error.name : typeof error,
        status: Number.isFinite(status) ? status : null,
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
}

const FALLBACK_CANDIDATES = [
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
];

async function probeModels(apiKey: string, primary: string) {
  const ai = new GoogleGenAI({ apiKey });
  const candidates = FALLBACK_CANDIDATES.filter((name) => name !== primary);
  console.log(`probing fallback candidates (primary=${primary})`);
  for (const model of candidates) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: "Reply with the single word ok.",
      });
      const text = response.text?.trim() ?? "";
      console.log(`OK ${model} (${text.length} chars)`);
    } catch (error) {
      const status =
        typeof error === "object" && error !== null && "status" in error
          ? Number((error as { status: unknown }).status)
          : null;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`FAIL ${model} status=${status} ${message.slice(0, 160)}`);
    }
  }
}

async function main() {
  loadEnvLocal();
  const resolution = resolveProvider();
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash";
  const probe = process.argv.includes("--probe");
  console.log(
    `provider=${resolution.id} requested=${resolution.requested} model=${model}`,
  );

  try {
    if (resolution.id === "gemini") {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set");
      }
      if (probe) {
        await probeModels(apiKey, model);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model,
        contents: buildExtractUserPrompt(NOTICE),
        config: {
          systemInstruction: EXTRACT_SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseJsonSchema: EXTRACTION_JSON_SCHEMA,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });
      const rawText = response.text?.trim() ?? "";
      console.log("raw text length:", rawText.length);
      const raw = JSON.parse(rawText) as unknown;
      console.log("raw JSON:");
      console.log(JSON.stringify(raw, null, 2));
      const parsed = extractionResultSchema.safeParse(raw);
      if (!parsed.success) {
        console.error("zod issues:");
        console.error(
          parsed.error.issues.map((issue) => ({
            path: issue.path.join("."),
            code: issue.code,
          })),
        );
        process.exitCode = 1;
        return;
      }
      console.log("parsed JSON:");
      console.log(JSON.stringify(parsed.data, null, 2));
      return;
    }

    const outcome = await extractDocument(NOTICE);
    if (outcome.ok) {
      console.log("parsed JSON:");
      console.log(JSON.stringify(outcome.result, null, 2));
      return;
    }
    console.error("extractDocument failed:");
    console.error(JSON.stringify(outcome, null, 2));
    process.exitCode = 1;
  } catch (error) {
    printError(error);
    process.exitCode = 1;
  }
}

void main();
