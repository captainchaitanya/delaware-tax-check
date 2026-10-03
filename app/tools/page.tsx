import { Card } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/LinkButton";

export const metadata = {
  title: "Tools",
};

export default function ToolsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-10">
      <h1 className="font-serif text-3xl font-medium tracking-tight">Tools</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Calculators and readers that sit on top of your company profile.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card as="article">
          <h2 className="font-serif text-xl font-medium">
            Franchise Tax Checker
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Compare Delaware&apos;s Authorized Shares Method with the Assumed
            Par Value Capital Method.
          </p>
          <div className="mt-4">
            <LinkButton href="/tools/franchise-tax">Open the checker</LinkButton>
          </div>
        </Card>
        <Card as="article">
          <h2 className="font-serif text-xl font-medium">Document Inbox</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Paste a notice and review extracted dates and share classes before
            anything is saved.
          </p>
          <div className="mt-4">
            <LinkButton href="/inbox">Open Inbox</LinkButton>
          </div>
        </Card>
      </div>
    </main>
  );
}
