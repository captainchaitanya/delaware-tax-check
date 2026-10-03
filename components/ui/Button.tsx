import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-accent text-background hover:opacity-90 dark:text-background",
  secondary:
    "border border-line bg-card text-foreground hover:border-accent/40",
  ghost:
    "text-foreground hover:bg-paper",
  danger:
    "border border-line bg-card text-foreground hover:border-foreground",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 items-center justify-center rounded-md px-4 text-sm font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
