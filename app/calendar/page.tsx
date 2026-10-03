import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-24 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          Calendar
        </h1>
        <Badge>Coming next</Badge>
      </div>
      <Card className="mt-8">
        <EmptyState
          title="No deadlines generated yet"
          body="Phase B will turn the company profile into a 12-month list of US and India filings. This page is intentionally empty so it never looks broken."
        />
      </Card>
    </main>
  );
}
