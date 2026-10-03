"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAppState } from "./AppState";
import { NAV_ITEMS } from "./nav";
import type { ThemePreference } from "@/lib/storage";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hydrated, state } = useAppState();
  const onboarding = pathname.startsWith("/onboarding");

  useEffect(() => {
    if (!hydrated || onboarding) {
      return;
    }
    if (!state.profile) {
      router.replace("/onboarding");
    }
  }, [hydrated, onboarding, router, state.profile]);

  if (!hydrated) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-sm text-muted">Opening your desk…</p>
      </div>
    );
  }

  if (onboarding) {
    return (
      <div className="min-h-dvh">
        <div className="h-1 bg-accent" aria-hidden="true" />
        {children}
      </div>
    );
  }

  if (!state.profile) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-sm text-muted">Taking you to setup…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-line bg-paper lg:flex">
        <div className="border-b border-line px-5 py-5">
          <p className="font-serif text-lg font-medium tracking-tight">
            Founder Desk
          </p>
          <p className="mt-1 text-xs text-muted">Educational, not advice</p>
        </div>
        <NavList pathname={pathname} />
        <ThemeSwitch />
      </aside>

      <div className="lg:pl-60">
        <header className="border-b border-line bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <p className="font-serif text-base font-medium">Founder Desk</p>
        </header>
        <div id="main">{children}</div>
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const current =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] ${
                    current ? "text-accent" : "text-muted"
                  }`}
                >
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function ThemeSwitch() {
  const { state, setTheme } = useAppState();
  const options: ThemePreference[] = ["system", "light", "dark"];
  return (
    <fieldset className="border-t border-line p-4">
      <legend className="text-xs text-muted">Appearance</legend>
      <div className="mt-2 flex gap-1">
        {options.map((option) => (
          <label
            key={option}
            className={`flex flex-1 cursor-pointer items-center justify-center rounded-md border px-1 py-1.5 text-[11px] capitalize ${
              state.theme === option
                ? "border-accent bg-accent-soft text-foreground"
                : "border-line text-muted"
            }`}
          >
            <input
              type="radio"
              name="sidebar-theme"
              className="sr-only"
              checked={state.theme === option}
              onChange={() => setTheme(option)}
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const current =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${
              current
                ? "bg-accent-soft text-accent"
                : "text-foreground hover:bg-card"
            }`}
          >
            <Icon />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
