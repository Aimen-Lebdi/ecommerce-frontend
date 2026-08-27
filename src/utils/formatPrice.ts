/**
 * Single source of truth for rendering DZD prices across the app.
 *
 * Every price the shopper (or admin) sees must go through here so amounts
 * are grouped, decimalized and localized identically on every surface —
 * "23212 DZD", "23212.00 DZD" and "29,515 DZD" in the same session eroded
 * trust in the numbers COD shoppers care about most.
 *
 * Locale follows the active UI language (mirrors the <html lang> attribute
 * the Header keeps in sync): en → en-US, fr → fr-FR, ar → ar-DZ.
 */
const LOCALE_BY_LANGUAGE: Record<string, string> = {
  en: "en-US",
  fr: "fr-FR",
  ar: "ar-DZ",
};

const formatterCache = new Map<string, Intl.NumberFormat>();

const resolveLocale = (locale?: string): string => {
  const language = (
    locale ??
    document.documentElement.lang ??
    "en"
  ).toLowerCase();
  return (
    LOCALE_BY_LANGUAGE[language] ??
    LOCALE_BY_LANGUAGE[language.slice(0, 2)] ??
    LOCALE_BY_LANGUAGE.en
  );
};

const getFormatter = (locale: string): Intl.NumberFormat => {
  let formatter = formatterCache.get(locale);
  if (!formatter) {
    // Group thousands; show up to 2 decimals only when the amount has them
    // ("23,212 DZD" not "23,212.00 DZD", but "2,000.5 DZD" stays exact).
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    formatterCache.set(locale, formatter);
  }
  return formatter;
};

/**
 * Format an amount as a localized DZD price string, e.g. `formatPrice(23212)`
 * → `"23,212 DZD"` (en) / `"23 212 DZD"` (fr) / `"23,212 DZD"` (ar-DZ).
 * Non-finite input degrades to `"0 DZD"` rather than leaking "NaN"/"undefined".
 */
export const formatPrice = (
  value: number | string | null | undefined,
  locale?: string
): string => {
  const amount =
    typeof value === "string" ? Number.parseFloat(value) : (value ?? NaN);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `${getFormatter(resolveLocale(locale)).format(safeAmount)} DZD`;
};
