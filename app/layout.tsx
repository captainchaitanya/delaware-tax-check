import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Source_Serif_4 } from "next/font/google";
import { AppShell } from "@/components/app/AppShell";
import { AppStateProvider } from "@/components/app/AppState";
import { ToastProvider } from "@/components/ui/Toast";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
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
  title: {
    default: "Founder Desk",
    template: "%s · Founder Desk",
  },
  description:
    "A compliance cockpit for founders running a Delaware C-corp from India — calendar, inbox, and franchise tax checker.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${figures.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground">
        <ToastProvider>
          <AppStateProvider>
            <AppShell>{children}</AppShell>
          </AppStateProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
