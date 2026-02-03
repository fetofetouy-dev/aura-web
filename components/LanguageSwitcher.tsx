"use client"

import { useState, useEffect, useRef } from "react"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import { locales, localeNames, localeMetadata } from "@/lib/i18n/locales"

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-background-elevated transition-colors"
        aria-label="Select language"
      >
        <span className="text-xl" aria-hidden="true">
          {localeMetadata[locale].flag}
        </span>
        <span className="text-sm font-medium text-text-primary">
          {localeNames[locale]}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-background-elevated border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[150px]">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                setLocale(loc)
                setIsOpen(false)
              }}
              className={`flex items-center gap-3 px-4 py-3 w-full hover:bg-background transition-colors ${
                locale === loc ? "bg-accent-blue/10" : ""
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {localeMetadata[loc].flag}
              </span>
              <span className="text-sm text-text-primary">{localeNames[loc]}</span>
              {locale === loc && (
                <svg
                  className="w-4 h-4 ml-auto text-accent-blue"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
