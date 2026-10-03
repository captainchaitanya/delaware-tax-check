import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = {
  title: "Inbox",
};

export default function InboxPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-24 lg:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-3xl font-medium tracking-tight">
          Inbox
        </h1>
        <Badge>Coming next</Badge>
      </div>
      <Card className="mt-8">
        <EmptyState
          title="No documents yet"
          body="Phase C will let you paste a Delaware notice, certificate, or India filing letter. Nothing is stored until you review it."
        />
      </Card>
    </main>
  );
}
