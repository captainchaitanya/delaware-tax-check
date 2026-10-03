import Link from "next/link";
import type { ReactNode } from "react";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
};

export function LinkButton({ href, children }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 self-start rounded-md border border-line bg-card px-3 text-sm font-medium text-foreground hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  );
}
