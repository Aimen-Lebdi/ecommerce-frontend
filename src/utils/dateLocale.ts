import { arDZ, fr, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

/**
 * date-fns Locale matching the active UI language, so formatted dates render
 * in Arabic/French instead of always en-US. Defaults to en-US.
 */
export function getDateLocale(language?: string): Locale {
  switch (language) {
    case "ar":
      return arDZ;
    case "fr":
      return fr;
    default:
      return enUS;
  }
}
