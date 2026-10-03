import { afterEach, describe, expect, it } from "vitest";
import { SAMPLE_PROFILE } from "./profile";
import {
  DEFAULT_APP_STATE,
  STORAGE_KEY,
  clearState,
  exportState,
  importState,
  readState,
  writeState,
} from "./storage";

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

describe("storage", () => {
  afterEach(() => {
    // @ts-expect-error test teardown
    delete globalThis.localStorage;
    // @ts-expect-error test teardown
    delete globalThis.window;
  });

  it("round-trips a profile and survives blocked storage", () => {
    const storage = memoryStorage();
    globalThis.localStorage = storage;
    globalThis.window = { localStorage: storage } as unknown as Window &
      typeof globalThis;

    const state = {
      version: 1 as const,
      profile: SAMPLE_PROFILE,
      theme: "dark" as const,
      deadlineProgress: {},
      documents: [],
      customDeadlines: [],
      deadlineOverrides: [],
      extraCostEstimates: { indiaFilings: "", other: "" },
    };
    expect(writeState(state)).toBe(true);
    expect(readState().profile?.companyName).toBe("Northbridge Labs, Inc.");
    expect(JSON.parse(exportState(state)).theme).toBe("dark");
    expect(clearState()).toBe(true);
    expect(readState()).toEqual(DEFAULT_APP_STATE);
  });

  it("returns defaults when storage throws", () => {
    globalThis.window = {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
    } as unknown as Window & typeof globalThis;

    expect(readState()).toEqual(DEFAULT_APP_STATE);
    expect(writeState({ ...DEFAULT_APP_STATE, theme: "light" })).toBe(false);
    expect(clearState()).toBe(false);
  });

  it("rejects empty or unrelated import JSON", () => {
    expect(() => importState("")).toThrow(/backup/i);
    expect(() => importState("{")).toThrow(/json/i);
    expect(() => importState(JSON.stringify({ hello: "world" }))).toThrow(
      /founder desk/i,
    );
    expect(importState(exportState({ ...DEFAULT_APP_STATE, profile: SAMPLE_PROFILE })).profile?.companyName).toBe(
      "Northbridge Labs, Inc.",
    );
    expect(STORAGE_KEY).toBe("founder-desk-v1");
  });
});
