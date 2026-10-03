"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ToastAction = {
  href: string;
  label: string;
};

type ToastContextValue = {
  notify: (message: string, action?: ToastAction) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [action, setAction] = useState<ToastAction | null>(null);

  const notify = useCallback((next: string, nextAction?: ToastAction) => {
    setMessage(next);
    setAction(nextAction ?? null);
    window.setTimeout(
      () => {
        setMessage((current) => (current === next ? null : current));
        setAction((current) =>
          current?.href === nextAction?.href && current?.label === nextAction?.label
            ? null
            : current,
        );
      },
      nextAction ? 6000 : 3200,
    );
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 lg:bottom-6"
      >
        {message ? (
          <p className="pointer-events-auto rounded-md border border-line bg-card px-4 py-2 text-sm text-foreground shadow-sm">
            {message}
            {action ? (
              <>
                {" "}
                <Link
                  href={action.href}
                  className="font-medium text-accent underline underline-offset-4"
                >
                  {action.label}
                </Link>
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return value;
}
