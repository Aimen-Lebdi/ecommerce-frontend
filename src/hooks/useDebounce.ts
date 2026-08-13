import { useEffect, useState } from "react";

/**
 * Returns `value` after it has remained unchanged for `delay` ms.
 *
 * Used for live search suggestions: debounces the API call so it only fires
 * after the user stops typing for a short interval.
 *
 * @param value - The value to debounce.
 * @param delay - Delay in milliseconds (default 300).
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
