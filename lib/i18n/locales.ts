// Supported locales for future i18n implementation
export const locales = ['es', 'en', 'pt'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

// Locale names for language switcher
export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
}

// Locale metadata
export const localeMetadata: Record<Locale, { flag: string; htmlLang: string }> = {
  es: { flag: '🇪🇸', htmlLang: 'es-ES' },
  en: { flag: '🇺🇸', htmlLang: 'en-US' },
  pt: { flag: '🇧🇷', htmlLang: 'pt-BR' },
}
