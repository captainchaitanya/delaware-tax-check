import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const display = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const figures = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-figures",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Delaware Tax Check",
  description:
    "See whether a Delaware franchise tax notice is using the Authorized Shares Method, and what the Assumed Par Value Capital Method would charge instead.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${figures.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <div className="h-1 bg-accent" aria-hidden="true" />
        <header className="border-b border-line">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-1 px-4 py-4 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="font-serif text-lg font-medium tracking-tight">
              Delaware Tax Check
            </p>
            <p className="text-xs text-muted">
              Educational tool, not tax advice
            </p>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
