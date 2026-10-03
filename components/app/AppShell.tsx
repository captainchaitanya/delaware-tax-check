"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { PageFooter } from "./PageFooter";
import { useAppState } from "./AppState";
import { NAV_ITEMS } from "./nav";
import type { ThemePreference } from "@/lib/storage";

const navBase =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm outline-none transition-colors";
const navIdle =
  "text-foreground hover:bg-line/55 focus-visible:bg-transparent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
const navActive = "bg-accent-soft text-accent";

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
        <PageFooter />
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
          <p className="mt-1 text-xs leading-5 text-muted">
            Compliance desk for India–US founders
          </p>
          <Link
            href="/settings"
            className="mt-3 inline-flex max-w-full truncate rounded-full border border-line bg-card px-2.5 py-1 text-xs text-foreground hover:bg-line/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
          >
            {state.profile.companyName}
          </Link>
        </div>
        <NavList pathname={pathname} />
        <ThemeToggle />
      </aside>

      <div className="lg:pl-60">
        <header className="border-b border-line bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <p className="font-serif text-base font-medium">Founder Desk</p>
          <p className="text-xs text-muted">
            Compliance desk for India–US founders
          </p>
        </header>
        <div id="main">{children}</div>
        <PageFooter />
      </div>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const current = isCurrent(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
                    current ? "text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  <Icon />
                  <span className="flex items-center gap-1">
                    {item.label}
                    {item.badge ? (
                      <span className="rounded-sm border border-line px-1 text-[9px] uppercase tracking-wide">
                        {item.badge}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function isCurrent(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

function ThemeToggle() {
  const { state, setTheme } = useAppState();
  const next: ThemePreference =
    state.theme === "system"
      ? "light"
      : state.theme === "light"
        ? "dark"
        : "system";
  const label =
    state.theme === "system"
      ? "Theme: system. Switch to light."
      : state.theme === "light"
        ? "Theme: light. Switch to dark."
        : "Theme: dark. Switch to system.";

  return (
    <div className="border-t border-line p-3">
      <button
        type="button"
        title={`Theme: ${state.theme}`}
        aria-label={label}
        onClick={() => setTheme(next)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-card text-foreground hover:bg-line/50 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper focus-visible:outline-none"
      >
        {state.theme === "light" ? <IconSun /> : null}
        {state.theme === "dark" ? <IconMoon /> : null}
        {state.theme === "system" ? <IconMonitor /> : null}
      </button>
    </div>
  );
}

function NavList({ pathname }: { pathname: string }) {
  return (
    <nav aria-label="Primary" className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const current = isCurrent(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? "page" : undefined}
            className={`${navBase} ${current ? navActive : navIdle}`}
          >
            <Icon />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted">
                {item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function IconSun() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6 18 18M18 6l-1.4 1.4M7.4 16.6 6 18"
      />
    </svg>
  );
}

function IconMoon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        d="M16 4.5A7.5 7.5 0 1 0 19.5 15 6 6 0 0 1 16 4.5z"
      />
    </svg>
  );
}

function IconMonitor() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect
        x="4"
        y="5"
        width="16"
        height="11"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path fill="none" stroke="currentColor" strokeWidth="1.6" d="M8 20h8M12 16v4" />
    </svg>
  );
}
