import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: "section" | "article" | "div";
};

export function Card({ children, className = "", as: Tag = "section" }: CardProps) {
  return (
    <Tag
      className={`rounded-md border border-line bg-card p-4 shadow-[0_1px_0_rgba(28,25,21,0.04)] sm:p-5 ${className}`}
    >
      {children}
    </Tag>
  );
}
