import type { ReactNode } from "react";

const tones = {
  neutral: "border-line bg-paper text-muted",
  accent: "border-accent/30 bg-accent-soft text-accent",
  warn: "border-warn/30 bg-warn-soft text-warn",
  live: "border-line bg-card text-foreground",
} as const;

type BadgeProps = {
  children: ReactNode;
  tone?: keyof typeof tones;
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function UnverifiedBadge() {
  return (
    <Badge tone="warn">
      Unverified
      <span className="sr-only"> — confirm this figure before you file</span>
    </Badge>
  );
}
