import type { MonthBucket } from "@/lib/deadlines/chart";

export function MonthChart({ buckets }: { buckets: MonthBucket[] }) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));

  return (
    <ul className="grid grid-cols-12 items-end gap-1" aria-label="Deadlines per month">
      {buckets.map((bucket) => {
        const height = Math.max(4, Math.round((bucket.count / max) * 72));
        return (
          <li key={`${bucket.year}-${bucket.month}`} className="flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm bg-accent"
              style={{ height }}
              title={`${bucket.label}: ${bucket.count}`}
            >
              <span className="sr-only">
                {bucket.label}: {bucket.count} deadline{bucket.count === 1 ? "" : "s"}
              </span>
            </div>
            <span className="text-[10px] text-muted" aria-hidden="true">
              {bucket.label.slice(0, 3)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
