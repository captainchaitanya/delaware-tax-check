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

  const persist = useCallback(
    (next: AppState | ((prev: AppState) => AppState)) => {
      setState((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        writeState(resolved);
        return resolved;
      });
    },
    [],
  );

  const saveProfile = useCallback(
    (profile: CompanyProfile) => {
      persist((prev) => ({ ...prev, profile }));
    },
    [persist],
  );

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      persist((prev) => ({ ...prev, theme }));
    },
    [persist],
  );

  const resetState = useCallback(() => {
    persist(DEFAULT_APP_STATE);
  }, [persist]);

  const setDeadlineProgress = useCallback(
    (id: string, progress: DeadlineProgress) => {
      persist((prev) => ({
        ...prev,
        deadlineProgress: {
          ...prev.deadlineProgress,
          [id]: progress,
        },
      }));
    },
    [persist],
  );

  const upsertDocument = useCallback(
    (document: InboxDocument) => {
      persist((prev) => {
        const existing = prev.documents.some((item) => item.id === document.id);
        return {
          ...prev,
          documents: existing
            ? prev.documents.map((item) =>
                item.id === document.id ? document : item,
              )
            : [document, ...prev.documents],
        };
      });
    },
    [persist],
  );

  const updateDocument = useCallback(
    (id: string, patch: Partial<InboxDocument>) => {
      persist((prev) => ({
        ...prev,
        documents: prev.documents.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      }));
    },
    [persist],
  );

  const upsertCustomDeadline = useCallback(
    (deadline: CustomDeadline) => {
      persist((prev) => {
        const existing = prev.customDeadlines.some(
          (item) => item.id === deadline.id,
        );
        return {
          ...prev,
          customDeadlines: existing
            ? prev.customDeadlines.map((item) =>
                item.id === deadline.id ? deadline : item,
              )
            : [...prev.customDeadlines, deadline],
        };
      });
    },
    [persist],
  );

  const removeCustomDeadline = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        customDeadlines: prev.customDeadlines.filter((item) => item.id !== id),
      }));
    },
    [persist],
  );

  const setExtraCostEstimates = useCallback(
    (extraCostEstimates: ExtraCostEstimates) => {
      persist((prev) => ({ ...prev, extraCostEstimates }));
    },
    [persist],
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
