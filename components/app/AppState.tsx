"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CompanyProfile } from "@/lib/profile";
import {
  DEFAULT_APP_STATE,
  readState,
  writeState,
  type AppState,
  type ThemePreference,
} from "@/lib/storage";
import { applyDocumentTheme } from "@/lib/theme";

type AppStateContextValue = {
  hydrated: boolean;
  state: AppState;
  saveProfile: (profile: CompanyProfile) => void;
  setTheme: (theme: ThemePreference) => void;
  replaceState: (next: AppState) => void;
  resetState: () => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<AppState>(DEFAULT_APP_STATE);

  useEffect(() => {
    const stored = readState();
    setState(stored);
    applyDocumentTheme(stored.theme);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    applyDocumentTheme(state.theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyDocumentTheme(state.theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [hydrated, state.theme]);

  const persist = useCallback((next: AppState) => {
    setState(next);
    writeState(next);
  }, []);

  const saveProfile = useCallback(
    (profile: CompanyProfile) => {
      persist({ ...state, profile });
    },
    [persist, state],
  );

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      persist({ ...state, theme });
    },
    [persist, state],
  );

  const resetState = useCallback(() => {
    persist(DEFAULT_APP_STATE);
  }, [persist]);

  const value = useMemo(
    () => ({
      hydrated,
      state,
      saveProfile,
      setTheme,
      replaceState: persist,
      resetState,
    }),
    [hydrated, persist, resetState, saveProfile, setTheme, state],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const value = useContext(AppStateContext);
  if (!value) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return value;
}
