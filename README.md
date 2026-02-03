# Aura - Sitio Web de Automatización para Pymes

Sitio web de marketing para Aura, empresa de automatización de procesos con IA para Pymes.

## Tech Stack

- **Next.js 14+** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** - Estilos y sistema de diseño
- **Framer Motion** - Animaciones y transiciones
- **Lucide React** - Iconografía minimalista
- **Google Analytics** - Tracking de usuarios
- **clsx + tailwind-merge** - Gestión de clases CSS

## Comenzando

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores:

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# URL del sitio (para producción)
NEXT_PUBLIC_SITE_URL=https://aura.com
```

### 3. Ejecutar el Servidor de Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Build para Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
aura-web/
├── app/
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout raíz (incluye GA)
│   └── globals.css           # Estilos globales
│
├── components/
│   ├── ui/                   # Componentes UI base
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   ├── Section.tsx
│   │   └── GradientText.tsx
│   │
│   ├── animations/           # Componentes de animación
│   │   ├── FlowLines.tsx
│   │   ├── FadeIn.tsx
│   │   ├── StaggerContainer.tsx
│   │   └── AnimatedCounter.tsx
│   │
│   ├── sections/             # Secciones de la página
│   │   ├── Hero.tsx
│   │   ├── ElProblema.tsx
│   │   ├── LaSolucion.tsx
│   │   ├── DemoInteractiva.tsx
│   │   ├── CasosDeUso.tsx
│   │   ├── PorQueAura.tsx
│   │   ├── CTAFinal.tsx
│   │   └── Footer.tsx
│   │
│   ├── demo/                 # Demo interactivo
│   │   ├── LeadForm.tsx
│   │   ├── AnalyzingStage.tsx
│   │   ├── StepCard.tsx
│   │   ├── AutomationSteps.tsx
│   │   ├── CodeViewer.tsx
│   │   ├── ImpactMetrics.tsx
│   │   └── IntegrationLogos.tsx
│   │
│   └── GoogleAnalytics.tsx   # Componente de GA
│
├── lib/
│   ├── cn.ts                 # Utilidad para clases CSS
│   ├── constants.ts          # Contenido del sitio
│   ├── animations.ts         # Variantes de Framer Motion
│   ├── demo-data.ts          # Datos del demo
│   ├── gtag.ts               # Google Analytics helper
│   └── i18n/                 # Estructura i18n (preparada)
│       ├── locales.ts
│       ├── translations.ts
│       └── README.md
│
└── public/
    ├── logo-aura.svg         # Logo oficial de Aura
    └── caso-estudio-aura.md  # Caso de estudio descargable
```

## Características Principales

### 🎨 Sistema de Diseño "Tech Premium"

- **Dark Mode Profundo**: Fondo #0A0B10 (deep charcoal)
- **Gradiente de Marca**: #3B82F6 (azul) → #8B5CF6 (violeta)
- **Tipografía**: Inter font con tracking optimizado
- **Componentes**: Botones pill-shaped, cards elevadas, iconos thin stroke
- **Espacio**: Generoso negative space para elegancia

### ✨ Animaciones Fluidas

- **Flow Lines**: Líneas SVG animadas en el Hero
- **Scroll Animations**: FadeIn progresivo al hacer scroll
- **Stagger Effects**: Cards que aparecen escalonadamente
- **Smooth Transitions**: Todas las interacciones son fluidas (60fps)

### 🎯 Demo Interactivo

El componente estrella del sitio. Demuestra valor real con:

1. **LeadForm**: Formulario para ingresar datos de lead
2. **Analyzing**: Claude AI "pensando" (animación pulse)
3. **Automation Steps**: 4 pasos visualizados en secuencia
   - CRM (Pipedrive)
   - Email (Gmail)
   - Tarea (Seguimiento)
   - Slack (Notificación)
4. **Code Viewer**: Código real con syntax highlighting
5. **Impact Metrics**: Métricas animadas (99.5% más rápido, 250 hrs ahorradas)

**Estados:** `idle → analyzing → executing → results`

### 📊 Google Analytics

Tracking configurado para:
- Pageviews automáticos
- Eventos personalizados (demo, descargas, CTAs)
- Integración nativa con Next.js

### 📄 Caso de Estudio

Documento completo descargable ([public/caso-estudio-aura.md](public/caso-estudio-aura.md)) con:
- Cliente real (consultora de marketing)
- Problema, solución y resultados
- Métricas de impacto (ROI 450%)
- Timeline de implementación
- Aplicabilidad a otros negocios

### 🌍 Multi-idioma (Preparado)

Estructura i18n configurada para:
- **Español** (actual)
- **Inglés** (preparado)
- **Portugués** (preparado)

Ver [lib/i18n/README.md](lib/i18n/README.md) para implementar.

## Personalización

### Contenido del Sitio

Todo el contenido está centralizado en [lib/constants.ts](lib/constants.ts):

```typescript
export const SITE_CONTENT = {
  hero: { ... },
  problema: { ... },
  solucion: { ... },
  // ... todas las secciones
}
```

Edita este archivo para cambiar textos, CTAs, etc.

### Colores de Marca

Definidos en [tailwind.config.ts](tailwind.config.ts):

```typescript
colors: {
  background: {
    DEFAULT: "#0A0B10",    // Deep charcoal
    elevated: "#13151E",   // Cards
  },
  accent: {
    blue: "#3B82F6",       // Electric blue
    violet: "#8B5CF6",     // Vivid violet
  },
  text: {
    primary: "#FFFFFF",    // Headlines
    body: "#E5E7EB",       // Body text
    muted: "#9CA3AF",      // Muted/inactive
  },
}
```

### Logo

El logo oficial está en [public/logo-aura.svg](public/logo-aura.svg).

Para reemplazarlo:
1. Mantén el esquema de colores (blanco + gradiente azul-violeta)
2. Actualiza las dimensiones en Hero.tsx y Footer.tsx si es necesario
3. Formato recomendado: SVG para escalabilidad

## Guía de Marca

Ver [BRAND_GUIDE.md](BRAND_GUIDE.md) para:
- Paleta de colores completa
- Jerarquía tipográfica
- Guidelines de UI
- Iconografía y elementos gráficos

## Deploy a Producción

### Vercel (Recomendado)

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para guía completa.

**Resumen rápido:**

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Deploy a producción
vercel --prod
```

Configurar en Vercel:
- Variables de entorno (`NEXT_PUBLIC_GA_ID`)
- Dominio personalizado
- Analytics (incluido gratis)

### Otras Plataformas

El sitio funciona en cualquier plataforma que soporte Next.js:
- Netlify
- Cloudflare Pages
- AWS Amplify
- Railway

## Performance

### Optimizaciones Aplicadas

✅ **Server Components** donde es posible (Footer, ElProblema, CasosDeUso)
✅ **Lazy Loading** del demo interactivo
✅ **Tree-shaking** de Lucide icons (imports específicos)
✅ **GPU-accelerated animations** (transform + opacity)
✅ **Image optimization** con Next.js Image
✅ **Tailwind CSS purge** (solo CSS usado)

### Meta de Performance

- **Lighthouse Score:** > 90 en todas las categorías
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Cumulative Layout Shift:** < 0.1

## Testing

### Checklist de QA

- [ ] Hero se ve correctamente con flow lines
- [ ] Demo interactivo completa todo el flujo
- [ ] Todos los botones funcionan
- [ ] Descarga de caso de estudio funciona
- [ ] Animaciones son fluidas (no lag)
- [ ] Responsive en mobile, tablet, desktop
- [ ] Google Analytics trackea correctamente
- [ ] Logo se muestra en Hero y Footer
- [ ] Gradientes se ven correctamente
- [ ] No hay errores en console

### Browsers Soportados

- Chrome/Edge (últimas 2 versiones)
- Firefox (últimas 2 versiones)
- Safari (últimas 2 versiones)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Próximos Pasos

### Funcionalidades Futuras

1. **Formulario de Contacto**
   - Integrar con Resend o SendGrid
   - Enviar emails de leads al equipo

2. **CRM Integration**
   - Conectar con Pipedrive/HubSpot
   - Leads automáticos desde el sitio

3. **Blog/Recursos**
   - Sección de contenido SEO
   - Casos de estudio adicionales
   - Guías de automatización

4. **A/B Testing**
   - Variantes de CTAs
   - Headlines diferentes
   - Colores de botones

5. **Multi-idioma**
   - Implementar i18n completo
   - Traducir a inglés y portugués

### Marketing

- [ ] SEO: Sitemap y robots.txt
- [ ] Google Search Console
- [ ] LinkedIn Ads
- [ ] Google Ads
- [ ] Email marketing

## Soporte y Recursos

- **Documentación de Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Tailwind CSS**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Framer Motion**: [framer.com/motion](https://www.framer.com/motion/)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

## Licencia

© 2026 Aura. Todos los derechos reservados.

---

Construido con ❤️ por el equipo de Aura


