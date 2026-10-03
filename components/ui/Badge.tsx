import type { ReactNode } from "react";
import type { VerificationStatus } from "@/lib/verification";

const tones = {
  neutral: "border-line bg-paper text-muted",
  accent: "border-accent/30 bg-accent-soft text-accent",
  warn: "border-warn/30 bg-warn-soft text-warn",
  live: "border-line bg-card text-foreground",
} as const;

type BadgeProps = {
  children: ReactNode;
  tone?: keyof typeof tones;
  title?: string;
};

export function Badge({ children, tone = "neutral", title }: BadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function UnverifiedBadge() {
  return (
    <VerificationBadge status="unverified" />
  );
}

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified") {
    return <Badge tone="accent">Verified</Badge>;
  }
  if (status === "reviewed") {
    return (
      <Badge
        title="Matches reliable professional sources; official page not yet confirmed"
      >
        Reviewed
        <span className="sr-only">
          . Matches reliable professional sources; official page not yet
          confirmed
        </span>
      </Badge>
    );
  }
  return (
    <Badge tone="warn">
      Unverified
      <span className="sr-only"> — confirm this figure before you file</span>
    </Badge>
  );
}
