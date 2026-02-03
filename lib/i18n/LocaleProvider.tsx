"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { Locale, defaultLocale, locales } from "./locales"
import { getTranslations, Translations } from "./translations"
import { getBrowserLocale, isValidLocale } from "./utils"

interface LocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => any
  translations: Translations
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

interface LocaleProviderProps {
  children: ReactNode
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  // Initialize locale from URL, localStorage, or browser
  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Check URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get("lang")

    // 2. Check localStorage
    const storedLang = localStorage.getItem("aura-locale")

    // 3. Check browser language
    const browserLang = getBrowserLocale()

    // Determine initial locale (priority order)
    let initialLocale: Locale = defaultLocale

    if (urlLang && isValidLocale(urlLang)) {
      initialLocale = urlLang as Locale
    } else if (storedLang && isValidLocale(storedLang)) {
      initialLocale = storedLang as Locale
    } else if (browserLang && isValidLocale(browserLang)) {
      initialLocale = browserLang as Locale
    }

    setLocaleState(initialLocale)

    // Update HTML lang attribute
    document.documentElement.lang = initialLocale

    setMounted(true)
  }, [])

  const setLocale = (newLocale: Locale) => {
    if (!isValidLocale(newLocale)) {
      console.warn(`Invalid locale: ${newLocale}. Using default.`)
      return
    }

    setLocaleState(newLocale)

    // Persist to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("aura-locale", newLocale)

      // Update URL query parameter
      const url = new URL(window.location.href)
      url.searchParams.set("lang", newLocale)
      window.history.replaceState({}, "", url)

      // Update HTML lang attribute
      document.documentElement.lang = newLocale
    }
  }

  // Helper function to get nested translations
  const t = (key: string): any => {
    const trans = getTranslations(locale)
    const keys = key.split(".")
    let value: any = trans

    for (const k of keys) {
      if (value === undefined || value === null) {
        console.warn(`Translation key not found: ${key}`)
        return key // Fallback: return the key itself
      }
      value = value[k]
    }

    if (value === undefined || value === null) {
      console.warn(`Translation key not found: ${key}`)
      return key
    }

    return value
  }

  const translations = getTranslations(locale)

  // Prevent flash of untranslated content
  if (!mounted) {
    return null
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, translations }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
