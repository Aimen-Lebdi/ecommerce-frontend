import { Skeleton } from "./ui/skeleton";

/**
 * Route-level loading fallback shown while a lazily-loaded page chunk
 * is being fetched. Quiet by design: tonal steps only, no spinners.
 */
const RouteFallback = () => {
  return (
    <div className="container mx-auto px-4 py-8" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteFallback;
