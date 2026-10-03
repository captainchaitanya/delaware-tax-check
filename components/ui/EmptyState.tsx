import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  body: string;
  action?: ReactNode;
};

export function EmptyState({ title, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col gap-2 py-2">
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm leading-6 text-muted">{body}</p>
      {action}
    </div>
  );
}
