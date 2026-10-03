import type { ReactNode } from "react";

type StatProps = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export function Stat({ label, value, hint }: StatProps) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-mono text-2xl tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
