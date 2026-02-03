import { Locale } from './locales'
import * as es from './dictionaries/es'
import * as en from './dictionaries/en'
import * as pt from './dictionaries/pt'

export type Translations = typeof es

const translations: Record<Locale, Translations> = {
  es,
  en,
  pt,
}

export function getTranslations(locale: Locale): Translations {
  return translations[locale] || translations.es
}
