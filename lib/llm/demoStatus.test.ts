import { afterEach, describe, expect, it } from "vitest";
import {
  DEMO_MODE_CACHE_KEY,
  clearCachedDemoMode,
  demoModeFromPayload,
  demoStatusCopy,
  demoStatusFromFlag,
  peekMemoryDemoMode,
  readCachedDemoMode,
  writeCachedDemoMode,
} from "./demoStatus";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
    clear: () => data.clear(),
    key: () => null,
    get length() {
      return data.size;
    },
  } satisfies Storage;
}

describe("demo status", () => {
  afterEach(() => {
    clearCachedDemoMode();
    // @ts-expect-error test teardown
    delete globalThis.sessionStorage;
  });

  it("maps checking, live, and demo", () => {
    expect(demoStatusFromFlag(null)).toBe("checking");
    expect(demoStatusFromFlag(undefined)).toBe("checking");
    expect(demoStatusCopy("checking")).toBe("Checking AI…");

    expect(demoStatusFromFlag(false)).toBe("live");
    expect(demoStatusCopy("live")).toBeNull();

    expect(demoStatusFromFlag(true)).toBe("demo");
    expect(demoStatusCopy("demo")).toBe("Demo mode");
  });

  it("shows demo only when the server sends demoMode: true", () => {
    expect(demoModeFromPayload({ demoMode: true })).toBe(true);
    expect(demoModeFromPayload({ demoMode: false })).toBe(false);
    expect(demoModeFromPayload({})).toBeNull();
    expect(demoModeFromPayload({ demoMode: "true" })).toBeNull();
  });

  it("caches live and demo status for the session", () => {
    globalThis.sessionStorage = memoryStorage();
    expect(readCachedDemoMode()).toBeNull();

    writeCachedDemoMode(false);
    expect(peekMemoryDemoMode()).toBe(false);
    expect(sessionStorage.getItem(DEMO_MODE_CACHE_KEY)).toBe("false");
    expect(demoStatusFromFlag(readCachedDemoMode())).toBe("live");

    clearCachedDemoMode();
    sessionStorage.setItem(DEMO_MODE_CACHE_KEY, "true");
    expect(readCachedDemoMode()).toBe(true);
    expect(demoStatusFromFlag(readCachedDemoMode())).toBe("demo");
  });
});
