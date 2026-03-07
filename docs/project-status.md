# Aura — Estado del Proyecto (Marzo 2026)

## Qué es Aura

Aura es un **motor de automatización e inteligencia para PyMEs** (clínicas, peluquerías, comercios, estudios). No es un CRM — es la capa que se conecta al sistema existente del cliente y ejecuta acciones automáticas basadas en datos.

**Propuesta de valor**: El dueño de una PyME no tiene tiempo para analizar datos ni mandar emails manualmente. Aura lo hace automáticamente: detecta clientes en riesgo, envía emails de bienvenida, celebra cumpleaños, y alerta cuando algo necesita atención.

**URL**: https://aura-web-omega.vercel.app

---

## Arquitectura General

```
[Landing page] → [Auth (Supabase)] → [Backoffice SPA]
                                           ↓
                              [API Routes (Next.js)]
                                    ↓           ↓
                          [Supabase DB]    [Inngest (jobs)]
                                                ↓
                                    [Gmail API / Calendar API]
```

- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS
- **Auth**: Supabase Auth (email/password + Google OAuth)
- **DB**: Supabase PostgreSQL con RLS multi-tenant
- **Jobs**: Inngest (event-driven + cron)
- **Email**: Gmail API (envía desde la cuenta del tenant)
- **Ads**: Meta Ads API + TikTok Ads API (OAuth)
- **Deploy**: Vercel
- **Dominio**: aura-web-omega.vercel.app

---

## Identidad Visual — "Warm Editorial"

Aura tiene una identidad visual propia que la diferencia de apps genéricas:

- **Logo**: "aura" en tipografía serif (DM Serif Display)
- **Tipografía**: DM Serif Display (headings) + Inter (body/UI)
- **Color primario**: Amber/dorado (#C4853A light, #E5A946 dark)
- **Color secundario**: Azul (#3B82F6) para links y acciones secundarias
- **Dark mode** activado por defecto, con toggle para cambiar a light
- **Estilo**: Minimalista, neutrales cálidos, sin emojis como iconos

---

## Qué funciona hoy

### Landing Page (`/`)
- Hero, problema, solución, casos de uso, demo interactiva, CTA
- Multilingüe (ES/EN/PT) con i18n
- Animaciones con framer-motion
- Google Analytics integrado

### Auth (completo)
- Login con email/password
- Registro con email/password
- Google OAuth (PKCE flow)
- Forgot password + reset password
- Middleware protege `/backoffice/*` y `/api/*`

### Backoffice — Funcional
1. **Dashboard** — Stats reales (clientes, citas, ejecuciones, tasa éxito) + distribución de segmentos RFM + alertas activas + ejecuciones recientes + acciones rápidas
2. **Clientes** — CRUD completo, importar CSV (mapeo inteligente de columnas), badges de segmento RFM, filtro por segmento, paginación
3. **Detalle de cliente** — Datos, segmento RFM con scores, timeline cronológica de interacciones
4. **Citas** — Listado con estados, crear nueva cita con selector de cliente
5. **Automatizaciones** — Listado de las 5 funciones activas, historial de ejecuciones con pasos detallados, activar/desactivar
6. **Settings** — Conexión Gmail OAuth, webhooks configurables, estado de conexiones
7. **Media/Publicidad** — Conexión Meta Ads + TikTok Ads (OAuth), campañas, optimizador de presupuesto

### Backoffice — Mock/Pendiente
- **Inbox** — UI completa pero datos mock
- **Assistant** — UI completa pero datos mock (acá irá Claude API)
- **Marketplace** — UI placeholder

### Motor de Automatización (5 funciones Inngest)
1. **lead-to-crm** — Cuando se crea un cliente con email → email de bienvenida vía Gmail
2. **birthday-reminder** — Cron diario 8am → feliz cumpleaños a clientes del día
3. **reactivation-reminder** — Cron diario 9am → email a inactivos >60 días
4. **google-calendar-sync** — Cron cada 30min → sync Google Calendar → citas
5. **rfm-scoring** — Cron diario 2am → scoring RFM por tenant, alertas de churn en downgrades

### Inteligencia (Cerebro de Aura — Fase A+B completas)
- **RFM Scoring**: Recency/Frequency/Monetary con thresholds por industria
- **Segmentos**: Champion, Loyal, New, At Risk, Dormant, Lost
- **Alertas automáticas**: Se crean cuando un cliente baja de segmento
- **Dashboard insights**: Distribución de segmentos, alertas activas, tasa retención/churn
- **Timeline**: Historial cronológico de todas las interacciones por cliente

### Seguridad (implementada)
- **Security headers**: HSTS, X-Frame-Options DENY, nosniff, Referrer-Policy, Permissions-Policy
- **OAuth state firmado**: HMAC-SHA256 para Meta y TikTok callbacks (anti-tampering)
- **Rate limiting**: Import CSV (5/min), test-gmail (5/min)
- **Middleware defense-in-depth**: Bloquea API routes para usuarios no autenticados
- **Inngest signing key**: Configurada en producción
- **OAUTH_STATE_SECRET**: Configurada en producción
- **Auditoría de seguridad completa**: En curso (Marzo 2026)

### Infraestructura
- **Webhooks genéricos** — Endpoint configurable por tenant para recibir datos externos
- **Connector credentials** — Tabla preparada para MercadoPago, WhatsApp, Instagram
- **Sync logs** — Auditoría de sincronizaciones
- **Interactions** — 17 tipos de eventos que alimentan RFM
- **Agent Skills** — 59 skills instaladas (Next.js, Supabase, React, Sentry, Anthropic)

---

## Qué falta (Roadmap)

### Prioridad Alta
- **Auditoría de seguridad** — Revisión completa en curso, arreglar vulnerabilidades encontradas
- **Fase C — IA con Claude API** — Resumen inteligente por cliente, brief diario, chat con IA en Assistant

### Prioridad Media
- **Recordatorio de citas** — Automatización nueva (email 24h antes)
- **Editor de emails** — Templates personalizables por tenant
- **Inbox real** — Reemplazar mock data con datos reales
- **Login UX** — Toggle show/hide password

### Prioridad Baja / Futuro
- **Fase D — Bot de WhatsApp** — Número WABA, intent classification con Claude
- **Marketplace de integraciones** — MercadoPago, WhatsApp Business, Instagram
- **Onboarding wizard** — Para nuevos tenants
- **Custom SMTP** — Mails de auth desde dominio Aura

---

## Base de Datos (11 tablas)

| Tabla | Descripción | Multi-tenant |
|-------|-------------|--------------|
| `customers` | Clientes + segmento + scores RFM | tenant_id |
| `interactions` | Eventos por cliente (17 tipos) | tenant_id |
| `appointments` | Citas con estados | tenant_id |
| `automation_executions` | Historial de automatizaciones | tenant_id |
| `automation_stats` | Contadores por tipo | tenant_id |
| `google_credentials` | Tokens OAuth Gmail/Calendar | tenant_id |
| `connector_credentials` | Tokens de otros conectores | tenant_id |
| `sync_logs` | Logs de sincronización | tenant_id |
| `webhook_endpoints` | Config de webhooks entrantes | tenant_id |
| `tenant_profiles` | Config per-tenant (PK: `id`) | id |
| `customer_alerts` | Alertas de churn/segmento | tenant_id |

---

## Decisiones técnicas importantes

1. **No FK a auth.users** — Las FK cross-schema fallan en Supabase. Integridad via `requireAuth()`.
2. **supabaseAdmin para todo server-side** — Service role + filtro manual por tenant_id.
3. **Gmail como canal de email** — El tenant conecta su Gmail. Los emails salen desde SU dirección.
4. **Inngest como motor de jobs** — Event-driven + cron. Cada función es idempotente.
5. **Dark mode por defecto** — Anti-FOUC con script inline en `<head>`. Toggle via localStorage.
6. **CSS Variables** — Toda la paleta via CSS vars (`:root` y `.dark`), sin necesidad de `dark:` en cada clase.
7. **TopBar en layout** — Cuenta de usuario, notificaciones y theme toggle siempre visibles.
