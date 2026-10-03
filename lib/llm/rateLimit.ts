const DEFAULT_LIMIT = 5;
const WINDOW_MS = 60_000;

const hits = new Map<string, number[]>();

export function allowRequest(
  key: string,
  limit = DEFAULT_LIMIT,
  now = Date.now(),
): boolean {
  const recent = (hits.get(key) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

export function resetRateLimit() {
  hits.clear();
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "local";
  }
  return request.headers.get("x-real-ip") ?? "local";
}
