export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-line/70 ${className}`}
      aria-hidden="true"
    />
  );
}

export function AppLoadingSkeleton() {
  return (
    <div className="min-h-dvh" role="status" aria-live="polite">
      <span className="sr-only">Opening your desk…</span>
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-line lg:bg-paper lg:p-5">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-3 h-4 w-40" />
        <div className="mt-8 flex flex-col gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="px-4 py-8 lg:pl-64">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-10 w-72" />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    </div>
  );
}
