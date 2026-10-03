const DEFAULT_LIMIT = 5;
const WINDOW_MS = 60_000;
export const DAILY_LIVE_CAP = 15;

const hits = new Map<string, number[]>();
let liveDay = "";
let liveCount = 0;

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

function utcDayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

function rollDay(now: number) {
  const day = utcDayKey(now);
  if (day !== liveDay) {
    liveDay = day;
    liveCount = 0;
  }
}

export function dailyLiveCap(
  env: Record<string, string | undefined> = process.env,
): number {
  const raw = Number(env.AI_DAILY_CAP);
  if (Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return DAILY_LIVE_CAP;
}

export function canLiveExtract(
  cap = DAILY_LIVE_CAP,
  now = Date.now(),
): boolean {
  rollDay(now);
  return liveCount < cap;
}

export function recordLiveExtraction(
  cap = DAILY_LIVE_CAP,
  now = Date.now(),
): void {
  rollDay(now);
  if (liveCount < cap) {
    liveCount += 1;
  }
}

export function resetDailyCap() {
  liveDay = "";
  liveCount = 0;
}

export function resetRateLimit() {
  hits.clear();
  resetDailyCap();
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "local";
  }
  return request.headers.get("x-real-ip") ?? "local";
}
