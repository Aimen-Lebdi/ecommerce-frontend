// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Arabic ships inline: it is the default language, so it must be present
// before first paint. English also ships inline as the fallback. French
// loads as a separate chunk on demand.
import arTranslation from '../locales/ar/translation.json';
import enTranslation from '../locales/en/translation.json';

const SUPPORTED_LANGUAGES = ['en', 'fr', 'ar'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Single source of truth for the persisted language choice. A fresh key
// (instead of the legacy `i18nextLng` / `preferred-language`) means everyone
// starts in Arabic once, then their choice persists across visits.
export const LANGUAGE_STORAGE_KEY = 'app-language';

const loadedBundles = new Set<string>(['en', 'ar']);

// Best-effort cleanup of the legacy storage keys so previously saved
// English/French preferences don't override the new Arabic default.
function cleanupLegacyLanguageKeys(): void {
  try {
    localStorage.removeItem('i18nextLng');
    localStorage.removeItem('preferred-language');
  } catch {
    /* localStorage unavailable — ignore */
  }
}

cleanupLegacyLanguageKeys();

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      ar: {
        translation: arTranslation,
      },
      en: {
        translation: enTranslation,
      },
    },
    fallbackLng: 'en', // Fallback language
    lng: 'ar', // Default language (Arabic)
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[], // Supported languages
    load: 'languageOnly', // Normalize e.g. "ar-DZ" to "ar"

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      // Only honor an explicitly saved choice; never sniff the browser.
      order: ['localStorage'],
      caches: ['localStorage'], // Cache user language preference
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
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
    : 'ar';
}

/**
 * Lazily fetch a locale chunk and register it. Arabic and English are bundled
 * inline and always considered loaded; French resolves to its own cached chunk.
 */
export async function ensureLanguageBundle(lng: string): Promise<void> {
  const target = normalizeLanguage(lng);
  if (loadedBundles.has(target)) return;
  const mod = await import(`../locales/${target}/translation.json`);
  i18n.addResourceBundle(target, 'translation', mod.default, true, true);
  loadedBundles.add(target);
}

/** Apply the correct `dir`/`lang` attributes for a language. */
function applyDocumentDirection(lng: SupportedLanguage): void {
  const html = document.documentElement;
  html.setAttribute('lang', lng);
  html.setAttribute('dir', lng === 'ar' ? 'rtl' : 'ltr');
}

/**
 * Switch the active language, loading its translations first so the UI never
 * renders raw keys. Also keeps the document direction and the persisted
 * choice in sync so every caller gets consistent behavior.
 */
export async function setLanguage(lng: string): Promise<void> {
  const target = normalizeLanguage(lng);
  await ensureLanguageBundle(target);
  await i18n.changeLanguage(target);
  applyDocumentDirection(target);
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, target);
  } catch {
    /* localStorage unavailable — ignore */
  }
}

/** Resolves once the initial language's translations are ready to render. */
export const i18nReady = ensureLanguageBundle(i18n.language);

export default i18n;