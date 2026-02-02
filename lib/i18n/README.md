# Internacionalización (i18n)

## Estado Actual
Actualmente el sitio está **solo en español**. La estructura i18n está preparada pero no implementada.

## Estructura

```
lib/i18n/
├── locales.ts        # Configuración de idiomas disponibles
├── translations.ts   # Archivo de traducciones
└── README.md         # Este archivo
```

## Implementación Futura

### Paso 1: Agregar Traducciones

Editar `translations.ts` y agregar traducciones para inglés y portugués:

```typescript
const translations: Record<Locale, Translations> = {
  es: SITE_CONTENT,

  en: {
    hero: {
      title: "Smart Automation for Growing SMBs",
      subtitle: "We free up time and resources with AI agents working 24/7 for your business",
      // ... más traducciones
    },
    // ... todas las secciones traducidas
  },

  pt: {
    hero: {
      title: "Automação Inteligente para PMEs em Crescimento",
      subtitle: "Liberamos tempo e recursos com agentes de IA trabalhando 24/7 para seu negócio",
      // ... más traducciones
    },
    // ... todas las secciones traducidas
  }
}
```

### Paso 2: Actualizar Rutas (Opcional)

Si quieres usar rutas como `/en` o `/pt`, crear:

```
app/
├── [locale]/
│   ├── layout.tsx
│   └── page.tsx
```

### Paso 3: Agregar Language Switcher

Crear componente `LanguageSwitcher.tsx`:

```typescript
"use client"

import { useRouter } from 'next/navigation'
import { locales, localeNames, Locale } from '@/lib/i18n/locales'

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const router = useRouter()

  const switchLanguage = (newLocale: Locale) => {
    // Actualizar URL y recargar con nuevo idioma
    router.push(`/${newLocale}`)
  }

  return (
    <div className="flex gap-2">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLanguage(locale)}
          className={currentLocale === locale ? 'font-bold' : ''}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  )
}
```

### Paso 4: Usar Traducciones en Componentes

```typescript
import { getTranslations } from '@/lib/i18n/translations'

export function Hero({ locale }: { locale: Locale }) {
  const t = getTranslations(locale)

  return (
    <h1>{t.hero.title}</h1>
  )
}
```

## Recomendaciones

Para una implementación completa de i18n, considera usar:
- **next-intl**: Librería popular para Next.js App Router
- **next-i18next**: Alternativa con más features
- **Crowdin/Lokalise**: Para gestión de traducciones en equipo

## Costos de Traducción

Páginas a traducir:
- Landing page principal (8 secciones)
- Caso de estudio (MD file)
- Metadata y SEO

Palabras estimadas: ~3,500 palabras
Costo aprox (profesional): $150-300 USD por idioma
