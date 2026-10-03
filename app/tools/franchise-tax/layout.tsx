import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Franchise Tax Checker",
};

export default function FranchiseTaxLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
