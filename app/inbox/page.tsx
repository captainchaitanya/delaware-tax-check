import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Inbox",
};

export default function InboxPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 lg:py-10">
      <h1 className="font-serif text-3xl font-medium tracking-tight">Inbox</h1>
      <Card className="mt-8">
        <EmptyState
          title="No documents yet"
          body="Paste a notice or certificate here and it will show up after you review it."
        />
      </Card>
    </main>
  );
}
