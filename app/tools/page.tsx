import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Tools",
};

export default function ToolsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-24 lg:py-10">
      <h1 className="font-serif text-3xl font-medium tracking-tight">Tools</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Calculators and readers that sit on top of your company profile.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card as="article">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">
              Franchise Tax Checker
            </h2>
            <Badge tone="live">Live</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Compare Delaware&apos;s Authorized Shares Method with the Assumed
            Par Value Capital Method.
          </p>
          <Link
            href="/tools/franchise-tax"
            className="mt-4 inline-flex text-sm font-medium text-accent underline underline-offset-4"
          >
            Open the checker
          </Link>
        </Card>
        <Card as="article">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-xl font-medium">Document Inbox</h2>
            <Badge>Coming next</Badge>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            Paste a notice and review extracted dates and share classes before
            anything is saved.
          </p>
          <Link
            href="/inbox"
            className="mt-4 inline-flex text-sm font-medium text-accent underline underline-offset-4"
          >
            Preview the inbox
          </Link>
        </Card>
      </div>
    </main>
  );
}
