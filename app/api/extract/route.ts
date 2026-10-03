import { QUOTA_EXHAUSTED_MESSAGE } from "@/lib/llm/errors";
import { extractDocument } from "@/lib/llm/extract";
import {
  allowLiveExtraction,
  allowRequest,
  clientKeyFromRequest,
} from "@/lib/llm/rateLimit";
import { matchSampleDocument } from "@/lib/llm/samples";
import { resolveProvider } from "@/lib/llm/selectProvider";

function failure(
  status: number,
  code: string,
  error: string,
  resolution: ReturnType<typeof resolveProvider>,
) {
  return Response.json(
    {
      ok: false,
      code,
      error,
      provider: resolution.id,
      requestedProvider: resolution.requested,
      demoMode: resolution.demoMode,
    },
    { status },
  );
}

export async function GET() {
  const resolution = resolveProvider();
  return Response.json({
    provider: resolution.id,
    requestedProvider: resolution.requested,
    demoMode: resolution.demoMode,
  });
}

export async function POST(request: Request) {
  const resolution = resolveProvider();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure(
      400,
      "invalid",
      "Send the document as JSON with a text field.",
      resolution,
    );
  }

  const text =
    typeof body === "object" &&
    body !== null &&
    "text" in body &&
    typeof body.text === "string"
      ? body.text
      : "";

  const sample = matchSampleDocument(text.trim());
  const live = !sample && resolution.id !== "mock";

  if (!sample && !allowRequest(clientKeyFromRequest(request))) {
    return failure(
      429,
      "rate_limit",
      "Please wait a minute before reading another document.",
      resolution,
    );
  }

  if (live && !allowLiveExtraction()) {
    return failure(429, "quota", QUOTA_EXHAUSTED_MESSAGE, resolution);
  }

  const outcome = await extractDocument(text);
  const status = outcome.ok
    ? 200
    : outcome.code === "empty" ||
        outcome.code === "too_long" ||
        outcome.code === "irrelevant"
      ? 400
      : outcome.code === "quota"
        ? 429
        : 502;
  return Response.json(outcome, { status });
}
