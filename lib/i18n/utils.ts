import { Locale, locales } from "./locales"

/**
 * Get the browser's preferred language
 * Returns a locale code (e.g., "es", "en", "pt") or null if not found
 */
export function getBrowserLocale(): Locale | null {
  if (typeof window === "undefined" || !navigator.language) {
    return null
  }

  // Extract language code (e.g., "en-US" → "en")
  const browserLang = navigator.language.split("-")[0]

  // Check if it's one of our supported locales
  if (isValidLocale(browserLang)) {
    return browserLang as Locale
  }

  return null
}

/**
 * Check if a given string is a valid locale
 */
export function isValidLocale(locale: string): boolean {
  return locales.includes(locale as Locale)
}
