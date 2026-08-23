// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// English ships inline: it is the fallback language, so it must be present
// before first paint. French and Arabic load as separate chunks on demand.
import enTranslation from '../locales/en/translation.json';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const loadedBundles = new Set<string>(['en']);

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
    },
    fallbackLng: 'en', // Fallback language
    lng: 'en', // Default language
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[], // Supported languages
    load: 'languageOnly', // Normalize e.g. "ar-DZ" to "ar"

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Cache user language preference
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: true, // Disable suspense for now
    },
  });

/** Resolve an arbitrary language tag to one we support. */
export function normalizeLanguage(lng: string | undefined): SupportedLanguage {
  const base = (lng ?? '').split('-')[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base)
    ? (base as SupportedLanguage)
    : 'en';
}

/**
 * Lazily fetch a locale chunk and register it. English is bundled inline and
 * always considered loaded; fr/ar resolve to their own cached chunks.
 */
export async function ensureLanguageBundle(lng: string): Promise<void> {
  const target = normalizeLanguage(lng);
  if (loadedBundles.has(target)) return;
  const mod = await import(`../locales/${target}/translation.json`);
  i18n.addResourceBundle(target, 'translation', mod.default, true, true);
  loadedBundles.add(target);
}

/**
 * Switch the active language, loading its translations first so the UI never
 * renders raw keys.
 */
export async function setLanguage(lng: string): Promise<void> {
  const target = normalizeLanguage(lng);
  await ensureLanguageBundle(target);
  await i18n.changeLanguage(target);
}

/** Resolves once the initial language's translations are ready to render. */
export const i18nReady = ensureLanguageBundle(i18n.language);

export default i18n;