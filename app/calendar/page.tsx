import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Calendar",
};

export default function CalendarPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-10">
      <h1 className="font-serif text-3xl font-medium tracking-tight">
        Calendar
      </h1>
      <Card className="mt-8">
        <EmptyState
          title="No deadlines yet"
          body="Your filings will appear here once the calendar is set up for this company."
        />
      </Card>
    </main>
  );
}
