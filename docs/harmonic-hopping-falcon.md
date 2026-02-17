# Plan Minimalista: Frontend-Only con Mock Data

## Contexto

Transformar el sitio web actual de Aura en una **demostración visual** de la plataforma SaaS, usando SOLO frontend con datos mock. El objetivo es validar el concepto con usuarios potenciales ANTES de construir el backend real.

### Por qué este enfoque

1. **Validación rápida**: Mostrar a usuarios sin esperar 8 semanas
2. **Costo mínimo**: ~20K tokens vs ~50K+ del enfoque completo
3. **Timeline corto**: 1 semana vs 8-10 semanas
4. **Iteración rápida**: Cambios inmediatos sin migraciones de DB
5. **Presentación**: Perfecto para pitch a inversionistas o primeros clientes

### Limitaciones Aceptadas

- ❌ Sin autenticación real (simulada)
- ❌ Sin base de datos
- ❌ Sin ejecutar automatizaciones reales
- ❌ Sin pagos (solo UI de pricing)
- ❌ Sin integraciones externas

### Lo que SÍ tendremos

- ✅ Landing page existente (ya funciona)
- ✅ Dashboard visual completo
- ✅ UI del Centralizador Omnicanal con mensajes mock
- ✅ UI del Bot Asistente IA con conversaciones mock
- ✅ Marketplace con templates de automatizaciones
- ✅ Simulación de ejecutar automatizaciones (logs mock)
- ✅ Multi-idioma (ES/EN/PT) ya funcional
- ✅ Todo responsive y con animaciones

---

## Estructura de Archivos (Solo Frontend)

```
aura-web/
├── app/
│   ├── (marketing)/              # ✅ YA EXISTE
│   │   └── page.tsx              # Landing actual
│   │
│   ├── (demo)/                   # 🆕 NUEVO - Demo routes (sin auth)
│   │   ├── layout.tsx            # Layout con sidebar simulado
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Overview con stats mock
│   │   ├── automations/
│   │   │   ├── page.tsx          # Lista de automatizaciones
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Detalles + logs mock
│   │   │       └── configure/
│   │   │           └── page.tsx  # Configuración mock
│   │   ├── marketplace/
│   │   │   ├── page.tsx          # Catálogo de templates
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Detalles de template
│   │   ├── inbox/                # 🔥 CENTRALIZADOR OMNICANAL
│   │   │   └── page.tsx          # Bandeja unificada
│   │   └── assistant/            # 🤖 BOT ASISTENTE IA
│   │       └── page.tsx          # Chat con bot
│   │
│   └── layout.tsx                # ✅ YA EXISTE
│
├── components/
│   ├── ui/                       # ✅ YA EXISTEN
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Container.tsx
│   │   └── Section.tsx
│   │
│   ├── sections/                 # ✅ YA EXISTEN (landing)
│   │
│   ├── demo/                     # 🆕 ACTUALIZAR
│   │   ├── DemoSidebar.tsx       # Sidebar del dashboard
│   │   ├── DemoTopBar.tsx        # Barra superior con user mock
│   │   ├── AutomationCard.tsx    # Card de automatización
│   │   ├── TemplateCard.tsx      # Card de template marketplace
│   │   ├── ExecutionTimeline.tsx # Timeline de ejecución
│   │   ├── InboxMessage.tsx      # Mensaje del centralizador
│   │   └── ChatMessage.tsx       # Mensaje del bot IA
│   │
│   └── animations/               # ✅ YA EXISTE (FadeIn.tsx)
│
├── lib/
│   ├── i18n/                     # ✅ YA EXISTE (LocaleProvider)
│   │
│   └── mock-data/                # 🆕 NUEVO
│       ├── automations.ts        # Automatizaciones mock
│       ├── templates.ts          # Templates marketplace
│       ├── executions.ts         # Logs de ejecuciones
│       ├── inbox-messages.ts     # Mensajes centralizador
│       └── chat-bot.ts           # Conversaciones bot IA
│
└── public/                       # ✅ YA EXISTE
```

---

## Roadmap de Implementación (1 Semana)

### **DÍA 1: Setup Base + Mock Data**

**Mañana (2-3 horas):**
- [ ] Crear estructura `lib/mock-data/`
- [ ] Crear `automations.ts` con 5-6 automatizaciones mock
- [ ] Crear `templates.ts` con 10-12 templates (categorías variadas)
- [ ] Crear `executions.ts` con logs de ejecuciones simuladas

**Tarde (2-3 horas):**
- [ ] Crear layout `app/(demo)/layout.tsx` con estructura base
- [ ] Crear `components/demo/DemoSidebar.tsx` (nav links)
- [ ] Crear `components/demo/DemoTopBar.tsx` (user mock, selector org)
- [ ] Agregar link "Ver Demo" en landing page

**Entregable:** Estructura base funcionando, se puede navegar al demo

---

### **DÍA 2: Dashboard + Automatizaciones**

**Mañana (3 horas):**
- [ ] Página `/dashboard` con stats mock:
  - Total automatizaciones activas
  - Ejecuciones este mes
  - Tasa de éxito
  - Gráfico de ejecuciones (mock)
- [ ] Componente `AutomationCard.tsx`
- [ ] Página `/automations` con lista de automatizaciones

**Tarde (3 horas):**
- [ ] Página `/automations/[id]` con detalles
- [ ] Componente `ExecutionTimeline.tsx` (mostrar steps)
- [ ] Botón "Ejecutar Ahora" (simula agregar log nuevo)
- [ ] Página `/automations/[id]/configure` (form básico)

**Entregable:** Sección de automatizaciones completa y navegable

---

### **DÍA 3: Marketplace**

**Mañana (2-3 horas):**
- [ ] Crear `lib/mock-data/templates.ts` con templates por categoría:
  - 📬 Leads & CRM (3 templates)
  - 📅 Agendamiento (2 templates)
  - 💰 Facturación (2 templates)
  - 📦 Inventario (2 templates)
  - 📢 Marketing (3 templates)
- [ ] Componente `TemplateCard.tsx`
- [ ] Página `/marketplace` con grid + filtros

**Tarde (2-3 horas):**
- [ ] Página `/marketplace/[slug]` con detalles completos:
  - Descripción larga
  - Qué hace (pasos)
  - Integraciones necesarias
  - Pricing (si es add-on)
  - Botón "Activar" (agrega a /automations)
- [ ] Navegación entre marketplace y automations

**Entregable:** Marketplace completo con templates navegables

---

### **DÍA 4: Centralizador Omnicanal 🔥**

**Mañana (3 horas):**
- [ ] Crear `lib/mock-data/inbox-messages.ts`:
  - Mensajes de WhatsApp
  - DMs de Instagram
  - Emails
  - Mensajes de Facebook
  - Formularios web
  - Llamadas (registros)
- [ ] Componente `InboxMessage.tsx` (con icono del canal)
- [ ] Página `/inbox` con lista de mensajes

**Tarde (3 horas):**
- [ ] Filtros por canal (WhatsApp, Instagram, Email, etc.)
- [ ] Filtros por estado (No leído, En proceso, Resuelto)
- [ ] Click en mensaje → panel lateral con detalles
- [ ] Botón "Responder" (mock)
- [ ] Botón "Asignar a..." (mock)
- [ ] Stats: mensajes pendientes, tiempo promedio respuesta

**Entregable:** Centralizador Omnicanal funcional con datos mock

---

### **DÍA 5: Bot Asistente IA 🤖**

**Mañana (3 horas):**
- [ ] Crear `lib/mock-data/chat-bot.ts`:
  - Conversaciones ejemplo (cliente pregunta → bot responde)
  - Casos: consulta de precio, agendar cita, info producto
  - Mensajes con metadata (sentiment, lead_score, etc.)
- [ ] Componente `ChatMessage.tsx` (estilo chat)
- [ ] Página `/assistant` con lista de conversaciones

**Tarde (3 horas):**
- [ ] Click en conversación → vista de chat completa
- [ ] Mostrar cuando bot "entregó" conversación a humano
- [ ] Panel lateral: datos del lead extraídos por IA
  - Nombre, email, teléfono
  - Interés detectado
  - Score (0-100)
  - Sentimiento
- [ ] Botón "Tomar conversación" (mock)
- [ ] Configuración del bot (tono, industria, prompts)

**Entregable:** Bot Asistente IA completo con conversaciones mock

---

### **DÍA 6: Polish + i18n**

**Mañana (3 horas):**
- [ ] Revisar que TODO esté traducido (ES/EN/PT)
- [ ] Agregar traducciones faltantes en dictionaries
- [ ] Loading states (skeletons donde sea apropiado)
- [ ] Empty states con ilustraciones/iconos

**Tarde (3 horas):**
- [ ] Animaciones con Framer Motion
- [ ] Responsive mobile (sidebar colapsable)
- [ ] Dark mode toggle (opcional)
- [ ] Tooltips explicativos
- [ ] Probar navegación completa

**Entregable:** UI pulida y responsive

---

### **DÍA 7: Testing + Deploy**

**Mañana (2 horas):**
- [ ] Testing manual completo:
  - Navegar todo el demo
  - Probar en mobile
  - Probar cambio de idioma
  - Verificar que links funcionen
- [ ] Fix bugs encontrados

**Tarde (2 horas):**
- [ ] Push a GitHub
- [ ] Deploy a Vercel
- [ ] Verificar que funcione en producción
- [ ] Crear video demo (Loom, 2-3 min)
- [ ] Screenshot de secciones clave

**Entregable:** Demo live en producción + material de presentación

---

## Mock Data Structures

### 1. Automatizaciones (`lib/mock-data/automations.ts`)

```typescript
export const mockAutomations = [
  {
    id: "1",
    name: "Nuevo Lead → CRM + Email",
    template: "lead-to-crm",
    category: "LEADS_CRM",
    isActive: true,
    lastExecution: "2025-02-14T10:30:00Z",
    lastExecutionStatus: "SUCCESS",
    executionCount: 127,
    createdAt: "2025-01-15T08:00:00Z",
  },
  {
    id: "2",
    name: "Recordatorio de Cita 24h Antes",
    template: "appointment-reminder",
    category: "APPOINTMENTS",
    isActive: true,
    lastExecution: "2025-02-14T09:00:00Z",
    lastExecutionStatus: "SUCCESS",
    executionCount: 89,
    createdAt: "2025-01-20T10:00:00Z",
  },
  // ... más automatizaciones
]
```

### 2. Templates (`lib/mock-data/templates.ts`)

```typescript
export const mockTemplates = [
  {
    slug: "lead-to-crm",
    name: { es: "Lead a CRM", en: "Lead to CRM", pt: "Lead para CRM" },
    description: {
      es: "Captura leads de formularios y los agrega automáticamente a tu CRM",
      en: "Captures leads from forms and automatically adds them to your CRM",
      pt: "Captura leads de formulários e os adiciona automaticamente ao seu CRM"
    },
    category: "LEADS_CRM",
    icon: "user-plus",
    price: 0, // Incluido en plan
    steps: [
      { icon: "mail", title: "Recibir lead de formulario" },
      { icon: "database", title: "Agregar a CRM" },
      { icon: "send", title: "Enviar email de bienvenida" },
      { icon: "bell", title: "Notificar al equipo" }
    ],
    integrations: ["Gmail", "Google Sheets", "Slack"],
    isPopular: true
  },
  // ... más templates
]
```

### 3. Mensajes Inbox (`lib/mock-data/inbox-messages.ts`)

```typescript
export const mockInboxMessages = [
  {
    id: "1",
    channel: "whatsapp",
    from: "Maria Gonzalez",
    phone: "+54 9 11 2345-6789",
    message: "Hola! Quisiera saber los precios del servicio de contabilidad",
    timestamp: "2025-02-14T11:45:00Z",
    status: "unread",
    leadScore: 75,
    sentiment: "positive"
  },
  {
    id: "2",
    channel: "instagram",
    from: "@carlos_tech",
    message: "Me interesa el paquete para e-commerce. Tienen demo?",
    timestamp: "2025-02-14T11:30:00Z",
    status: "in_progress",
    assignedTo: "Juan Pérez",
    leadScore: 82,
    sentiment: "positive"
  },
  {
    id: "3",
    channel: "email",
    from: "ana.silva@empresa.com",
    subject: "Consulta sobre automatizaciones",
    message: "Buenos días, estoy buscando una solución para automatizar la facturación...",
    timestamp: "2025-02-14T10:15:00Z",
    status: "resolved",
    leadScore: 90,
    sentiment: "neutral"
  },
  // ... más mensajes (WhatsApp, Facebook, formularios, llamadas)
]
```

### 4. Conversaciones Bot (`lib/mock-data/chat-bot.ts`)

```typescript
export const mockBotConversations = [
  {
    id: "1",
    leadName: "Pedro Martinez",
    leadEmail: "pedro@email.com",
    leadPhone: "+54 9 11 3456-7890",
    startedAt: "2025-02-14T10:00:00Z",
    status: "active", // active | handed_off | closed
    messages: [
      {
        id: "m1",
        sender: "lead",
        text: "Hola, necesito información sobre sus servicios",
        timestamp: "2025-02-14T10:00:00Z"
      },
      {
        id: "m2",
        sender: "bot",
        text: "¡Hola Pedro! Encantado de ayudarte. Somos Aura, ayudamos a Pymes a automatizar sus procesos. ¿Qué tipo de negocio tienes?",
        timestamp: "2025-02-14T10:00:05Z"
      },
      {
        id: "m3",
        sender: "lead",
        text: "Tengo una consultora de marketing digital",
        timestamp: "2025-02-14T10:00:30Z"
      },
      {
        id: "m4",
        sender: "bot",
        text: "Perfecto! Para consultoras como la tuya, nuestras automatizaciones más populares son:\n\n1. Gestión de leads: captura y seguimiento automático\n2. Facturación recurrente: genera facturas automáticamente\n3. Reportes a clientes: envía reportes programados\n\n¿Alguna de estas te interesa especialmente?",
        timestamp: "2025-02-14T10:00:35Z"
      },
      // ... más mensajes
    ],
    leadScore: 85,
    interest: "Automatización de leads",
    sentiment: "positive",
    handedOffAt: null // o timestamp si fue entregado a humano
  },
  // ... más conversaciones
]
```

---

## Componentes Clave a Crear

### 1. DemoSidebar.tsx

```typescript
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Zap,
  Store,
  Inbox,
  Bot,
  Settings
} from "lucide-react"

const navItems = [
  { href: "/demo/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/demo/automations", label: "Automatizaciones", icon: Zap },
  { href: "/demo/marketplace", label: "Marketplace", icon: Store },
  { href: "/demo/inbox", label: "Centralizador", icon: Inbox },
  { href: "/demo/assistant", label: "Bot IA", icon: Bot },
  { href: "/demo/settings", label: "Configuración", icon: Settings },
]

export function DemoSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-background-elevated border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Aura Demo</h1>
      </div>
      <nav className="px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-accent-blue/10 text-accent-blue'
                  : 'hover:bg-background'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

### 2. InboxMessage.tsx

```typescript
import {
  MessageCircle, // WhatsApp
  Instagram,
  Mail,
  Facebook,
  Phone,
  FileText // Forms
} from "lucide-react"

const channelIcons = {
  whatsapp: MessageCircle,
  instagram: Instagram,
  email: Mail,
  facebook: Facebook,
  phone: Phone,
  form: FileText
}

export function InboxMessage({ message }) {
  const Icon = channelIcons[message.channel]

  return (
    <div className="border-b border-border p-4 hover:bg-background-elevated cursor-pointer">
      <div className="flex items-start gap-4">
        <div className={`p-2 rounded-full ${getChannelColor(message.channel)}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold">{message.from}</h4>
            <span className="text-sm text-text-muted">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>
          <p className="text-sm text-text-body line-clamp-2">
            {message.message}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={getStatusVariant(message.status)}>
              {message.status}
            </Badge>
            <span className="text-xs text-text-muted">
              Score: {message.leadScore}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## Features del Demo

### ✅ Lo que el usuario PUEDE hacer:

1. **Navegar libremente** entre todas las secciones
2. **Ver automatizaciones** activas/inactivas
3. **"Ejecutar" automatizaciones** (agrega log mock nuevo)
4. **Explorar marketplace** con filtros por categoría
5. **"Activar" templates** (aparecen en /automations)
6. **Ver centralizador** con mensajes de múltiples canales
7. **Filtrar mensajes** por canal/estado
8. **Ver conversaciones del bot IA**
9. **Cambiar idioma** (ES/EN/PT) en cualquier momento
10. **Ver en mobile** (responsive)

### ❌ Lo que NO funciona (y está OK):

1. No hay login real (botón "Iniciar Sesión" redirige a demo)
2. No se guardan cambios (todo es efímero)
3. No se ejecutan automatizaciones reales
4. No hay pagos (botones de upgrade son decorativos)
5. No hay conexiones a APIs externas

---

## Transición al Backend Real (Futuro)

Cuando decidas construir el backend:

1. **Mock data → API calls**: Reemplazar imports de mock-data por fetch/tRPC
2. **Auth simulada → NextAuth.js**: Agregar login real con Google OAuth
3. **Estado local → Base de datos**: Migrar a Prisma + PostgreSQL
4. **Botones decorativos → Funcionalidad**: Conectar Stripe, Inngest, etc.

El código del frontend será **~80% reutilizable**.

---

## Verification (Testing Manual)

### Checklist de QA:

**Landing Page:**
- [ ] Se ve correctamente en desktop/mobile
- [ ] Botón "Ver Demo" redirige a `/demo/dashboard`
- [ ] Cambio de idioma funciona

**Dashboard:**
- [ ] Muestra stats mock (automatizaciones, ejecuciones)
- [ ] Cards son clickeables
- [ ] Gráficos se ven correctamente

**Automatizaciones:**
- [ ] Lista muestra automatizaciones mock
- [ ] Puede filtrar por estado (activas/inactivas)
- [ ] Click en card → va a detalles
- [ ] Página de detalles muestra timeline de ejecución
- [ ] Botón "Ejecutar" agrega nuevo log (mock)

**Marketplace:**
- [ ] Grid de templates se muestra
- [ ] Filtros por categoría funcionan
- [ ] Click en template → página de detalles
- [ ] Botón "Activar" simula agregar a automatizaciones

**Centralizador:**
- [ ] Lista de mensajes de múltiples canales
- [ ] Iconos correctos por canal (WhatsApp, Instagram, etc.)
- [ ] Filtros por canal funcionan
- [ ] Click en mensaje → panel lateral con detalles

**Bot Asistente:**
- [ ] Lista de conversaciones
- [ ] Click en conversación → vista de chat
- [ ] Mensajes bot vs lead se distinguen visualmente
- [ ] Panel lateral muestra datos del lead extraídos

**General:**
- [ ] Sidebar navigation funciona
- [ ] Mobile: sidebar se colapsa (hamburger menu)
- [ ] Cambio de idioma funciona en TODAS las páginas
- [ ] No hay errores en consola
- [ ] Loading states están presentes

---

## Costos y Timeline

### Estimación de Tokens:
- Setup + mock data: ~3K tokens
- Dashboard + automatizaciones: ~5K tokens
- Marketplace: ~3K tokens
- Centralizador: ~4K tokens
- Bot IA: ~4K tokens
- Polish + i18n: ~2K tokens
- **TOTAL: ~21K tokens** ✅ Dentro del objetivo

### Timeline:
- **7 días** de trabajo (1 día por sección)
- **2-3 horas por día** = 14-21 horas totales
- **Entregable:** Demo funcional en Vercel

---

## Next Steps

1. ✅ **Aprobar este plan** - Usuario confirma que este enfoque es correcto
2. **Comenzar Día 1**: Setup base + mock data
3. **Iterar diariamente**: Completar una sección por día
4. **Deploy continuo**: Push a Vercel cada día
5. **Feedback**: Ajustar según lo que veas

**¿Procedemos con este plan?**
