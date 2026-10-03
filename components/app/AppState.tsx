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
import type { CustomDeadline } from "@/lib/deadlines/custom";
import type { ExtraCostEstimates } from "@/lib/costEstimates";
import type { CompanyProfile } from "@/lib/profile";
import {
  DEFAULT_APP_STATE,
  readState,
  writeState,
  type AppState,
  type DeadlineProgress,
  type InboxDocument,
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
  setDeadlineProgress: (id: string, progress: DeadlineProgress) => void;
  upsertDocument: (document: InboxDocument) => void;
  updateDocument: (id: string, patch: Partial<InboxDocument>) => void;
  upsertCustomDeadline: (deadline: CustomDeadline) => void;
  removeCustomDeadline: (id: string) => void;
  setExtraCostEstimates: (estimates: ExtraCostEstimates) => void;
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

  const setDeadlineProgress = useCallback(
    (id: string, progress: DeadlineProgress) => {
      persist({
        ...state,
        deadlineProgress: {
          ...state.deadlineProgress,
          [id]: progress,
        },
      });
    },
    [persist, state],
  );

  const upsertDocument = useCallback(
    (document: InboxDocument) => {
      const existing = state.documents.some((item) => item.id === document.id);
      persist({
        ...state,
        documents: existing
          ? state.documents.map((item) =>
              item.id === document.id ? document : item,
            )
          : [document, ...state.documents],
      });
    },
    [persist, state],
  );

  const updateDocument = useCallback(
    (id: string, patch: Partial<InboxDocument>) => {
      persist({
        ...state,
        documents: state.documents.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      });
    },
    [persist, state],
  );

  const upsertCustomDeadline = useCallback(
    (deadline: CustomDeadline) => {
      const existing = state.customDeadlines.some((item) => item.id === deadline.id);
      persist({
        ...state,
        customDeadlines: existing
          ? state.customDeadlines.map((item) =>
              item.id === deadline.id ? deadline : item,
            )
          : [...state.customDeadlines, deadline],
      });
    },
    [persist, state],
  );

  const removeCustomDeadline = useCallback(
    (id: string) => {
      persist({
        ...state,
        customDeadlines: state.customDeadlines.filter((item) => item.id !== id),
      });
    },
    [persist, state],
  );

  const setExtraCostEstimates = useCallback(
    (extraCostEstimates: ExtraCostEstimates) => {
      persist({ ...state, extraCostEstimates });
    },
    [persist, state],
  );

  const value = useMemo(
    () => ({
      hydrated,
      state,
      saveProfile,
      setTheme,
      replaceState: persist,
      resetState,
      setDeadlineProgress,
      upsertDocument,
      updateDocument,
      upsertCustomDeadline,
      removeCustomDeadline,
      setExtraCostEstimates,
    }),
    [
      hydrated,
      persist,
      removeCustomDeadline,
      resetState,
      saveProfile,
      setDeadlineProgress,
      setExtraCostEstimates,
      setTheme,
      state,
      updateDocument,
      upsertCustomDeadline,
      upsertDocument,
    ],
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
