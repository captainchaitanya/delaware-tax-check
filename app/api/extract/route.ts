import { extractDocument } from "@/lib/llm/extract";
import {
  allowRequest,
  clientKeyFromRequest,
} from "@/lib/llm/rateLimit";
import { resolveProvider } from "@/lib/llm/selectProvider";

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
  if (!allowRequest(clientKeyFromRequest(request))) {
    return Response.json(
      {
        ok: false,
        code: "rate_limit",
        error: "Please wait a minute before reading another document.",
        provider: resolution.id,
        requestedProvider: resolution.requested,
        demoMode: resolution.demoMode,
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      {
        ok: false,
        code: "invalid",
        error: "Send the document as JSON with a text field.",
        provider: resolution.id,
        requestedProvider: resolution.requested,
        demoMode: resolution.demoMode,
      },
      { status: 400 },
    );
  }

  const text =
    typeof body === "object" &&
    body !== null &&
    "text" in body &&
    typeof body.text === "string"
      ? body.text
      : "";

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
