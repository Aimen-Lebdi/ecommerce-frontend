/**
 * Idle-time prefetch of the storefront routes visitors hit most, so the
 * first navigation never waits on a chunk fetch. Chunks are content-hashed
 * and immutable, so this costs nothing after the first visit.
 *
 * Respects data-saver preferences: users on Save-Data or a 2G connection
 * opt out of speculative downloads entirely.
 *
 * Lives in its own module (rather than in clientRoutes) to keep the layout →
 * routes import graph acyclic.
 */

type NetworkInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

export function prefetchLikelyClientRoutes(): void {
  if (typeof window === "undefined") return;

  const connection = (
    navigator as Navigator & { connection?: NetworkInfo }
  ).connection;
  if (connection?.saveData || connection?.effectiveType === "2g") return;

  const warm = () => {
    void import("../pages/client/Shop");
    void import("../pages/client/ProductDetail");
    void import("../pages/client/Cart");
    void import("../pages/client/SignIn");
  };

  // Optional lookup rather than `in` narrowing — the DOM lib types declare
  // requestIdleCallback unconditionally, which would narrow the fallback
  // branch to `never`.
  const requestIdle = (
    window as Window & {
      requestIdleCallback?: (
        cb: () => void,
        opts?: { timeout: number },
      ) => number;
    }
  ).requestIdleCallback;

  if (requestIdle) {
    requestIdle(warm, { timeout: 3000 });
  } else {
    window.setTimeout(warm, 1500);
  }
}
