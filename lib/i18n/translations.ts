import { Locale } from './locales'
import { SITE_CONTENT } from '@/lib/constants'

// Type for translations structure
export type Translations = typeof SITE_CONTENT

// Current translations (Spanish only)
// Future: Add 'en' and 'pt' translations here
const translations: Record<Locale, Translations> = {
  es: SITE_CONTENT,

  // TODO: Add English translations
  en: SITE_CONTENT, // Placeholder - use Spanish for now

  // TODO: Add Portuguese translations
  pt: SITE_CONTENT, // Placeholder - use Spanish for now
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.es
}

// Helper to get specific translation key
export function t(locale: Locale, key: string): any {
  const translations = getTranslations(locale)
  const keys = key.split('.')
  let value: any = translations

  for (const k of keys) {
    value = value?.[k]
  }

  return value
}
