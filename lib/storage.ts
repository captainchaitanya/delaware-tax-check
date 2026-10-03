import { companyProfileSchema, type CompanyProfile } from "./profile";
import { z } from "zod";

export const STORAGE_KEY = "founder-desk-v1";

export type ThemePreference = "light" | "dark" | "system";

export type DeadlineProgress = {
  done: boolean;
  notes: string;
};

export type AppState = {
  version: 1;
  profile: CompanyProfile | null;
  theme: ThemePreference;
  deadlineProgress: Record<string, DeadlineProgress>;
};

const appStateSchema = z.object({
  version: z.literal(1),
  profile: companyProfileSchema.nullable(),
  theme: z.enum(["light", "dark", "system"]),
  deadlineProgress: z
    .record(
      z.string(),
      z.object({
        done: z.boolean(),
        notes: z.string(),
      }),
    )
    .default({}),
});

export const DEFAULT_APP_STATE: AppState = {
  version: 1,
  profile: null,
  theme: "system",
  deadlineProgress: {},
};

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const storage = window.localStorage;
    const probe = "__founder_desk_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function readState(): AppState {
  try {
    const storage = getLocalStorage();
    if (!storage) {
      return DEFAULT_APP_STATE;
    }
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_STATE;
    }
    return appStateSchema.parse(JSON.parse(raw));
  } catch {
    return DEFAULT_APP_STATE;
  }
}

export function writeState(state: AppState): boolean {
  try {
    const parsed = appStateSchema.parse(state);
    const storage = getLocalStorage();
    if (!storage) {
      return false;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch {
    return false;
  }
}

export function clearState(): boolean {
  try {
    const storage = getLocalStorage();
    if (!storage) {
      return false;
    }
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function exportState(state: AppState): string {
  return JSON.stringify(appStateSchema.parse(state), null, 2);
}

export function importState(json: string): AppState {
  const trimmed = json.trim();
  if (trimmed === "") {
    throw new Error("Paste a Founder Desk backup file");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error("That file is not valid JSON");
  }
  const result = appStateSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("That file is not a Founder Desk backup");
  }
  return result.data;
}
