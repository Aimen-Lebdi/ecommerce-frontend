/**
 * Extract a human-readable message from an unknown thrown or Redux-rejected
 * value. Handles plain strings (RTK `unwrap()` rejections), Error objects,
 * axios-shaped errors (`response.data.message`), and anything else falls back
 * to the provided default.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error) return error;
  if (error && typeof error === "object") {
    const e = error as {
      message?: unknown;
      response?: { data?: { message?: unknown } };
    };
    const fromResponse = e.response?.data?.message;
    if (typeof fromResponse === "string" && fromResponse) return fromResponse;
    if (typeof e.message === "string" && e.message) return e.message;
  }
  return fallback;
}
