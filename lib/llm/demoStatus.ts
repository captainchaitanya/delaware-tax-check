export type DemoStatus = "checking" | "live" | "demo";

export const DEMO_MODE_CACHE_KEY = "founder-desk-demo-mode";

let memoryCache: boolean | null = null;

export function demoStatusFromFlag(
  demoMode: boolean | null | undefined,
): DemoStatus {
  if (demoMode === true) {
    return "demo";
  }
  if (demoMode === false) {
    return "live";
  }
  return "checking";
}

export function demoStatusCopy(status: DemoStatus): string | null {
  if (status === "checking") {
    return "Checking AI…";
  }
  if (status === "demo") {
    return "Demo mode";
  }
  return null;
}

export function demoModeFromPayload(payload: { demoMode?: unknown }): boolean | null {
  if (payload.demoMode === true) {
    return true;
  }
  if (payload.demoMode === false) {
    return false;
  }
  return null;
}

export function peekMemoryDemoMode(): boolean | null {
  return memoryCache;
}

export function readCachedDemoMode(): boolean | null {
  if (memoryCache !== null) {
    return memoryCache;
  }
  if (typeof sessionStorage === "undefined") {
    return null;
  }
  try {
    const raw = sessionStorage.getItem(DEMO_MODE_CACHE_KEY);
    if (raw === "true") {
      memoryCache = true;
      return true;
    }
    if (raw === "false") {
      memoryCache = false;
      return false;
    }
  } catch {
    return null;
  }
  return null;
}

export function writeCachedDemoMode(demoMode: boolean): void {
  memoryCache = demoMode;
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(DEMO_MODE_CACHE_KEY, demoMode ? "true" : "false");
  } catch {
    // Private mode or blocked storage should not break the inbox.
  }
}

export function clearCachedDemoMode(): void {
  memoryCache = null;
  if (typeof sessionStorage === "undefined") {
    return;
  }
  try {
    sessionStorage.removeItem(DEMO_MODE_CACHE_KEY);
  } catch {
    // ignore
  }
}
