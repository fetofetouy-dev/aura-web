# Aura — Arquitectura del Proyecto

## Vision

**Aura es un motor de automatizacion, no un CRM.** Se conecta al sistema operativo del cliente (CRM, ERP, agenda, e-commerce) y ejecuta acciones automaticas basadas en los datos que recibe.

El cliente de Aura (dueno de clinica, comercio, estudio) sigue usando su sistema de gestion habitual. Aura observa los cambios y ejecuta automatizaciones: emails de bienvenida, recordatorios de citas, reactivacion de inactivos, felicitaciones de cumpleanos, etc.

### Principios

1. **Aura no reemplaza el sistema del cliente** — se conecta a el
2. **La fuerza esta en la masa** — automatizaciones que corren sobre toda la base, no edicion individual
3. **Los datos fluyen continuamente** — no es una carga unica, es un stream
4. **Zero-config ideal** — el cliente conecta su sistema y Aura hace el resto

---

## Stack Tecnico

| Componente | Tecnologia |
|---|---|
| Frontend | Next.js 14 App Router + TypeScript |
| Estilos | Tailwind CSS |
| Auth | Supabase Auth (email/password + Google OAuth, PKCE) |
| Base de datos | Supabase (PostgreSQL) |
| Background jobs | Inngest (event-driven + cron) |
| Email | Gmail API via Google OAuth |
| Deploy | Vercel |
| Dominio | https://aura-web-omega.vercel.app |

---

## Modulos Actuales

### Clientes (Panel de datos)
- Vista de los datos que Aura usa para ejecutar automatizaciones
- No es un CRM — es un panel de verificacion y debug
- Soporta: vista de lista paginada, detalle, edicion (fallback), eliminacion
- Campos: name, email, phone, company, birthday, notes, metadata (JSONB extra)

### Citas
- CRUD completo con status management: scheduled, confirmed, completed, cancelled, noshow
- Asociadas a un cliente
- Cambios de status loguean interacciones (appointment_completed, appointment_noshow)

### Automatizaciones (Inngest)

| Automatizacion | Trigger | Que hace |
|---|---|---|
| **Lead-to-CRM** | Evento: customer/created | Envia email de bienvenida via Gmail |
| **Birthday Reminder** | Cron: diario 8am UTC | Envia email de cumpleanos a clientes con fecha hoy |
| **Reactivation Reminder** | Cron: diario 9am UTC | Envia "te extranamos" a clientes 60+ dias inactivos |

Todas las automatizaciones:
- Obtienen credenciales de Gmail del tenant
- Refrescan el access token
- Envian email via Gmail API
- Loguean en `automation_executions` (status, steps, duration)
- Loguean en `interactions` (email_sent)
- Actualizan stats via `increment_automation_stats` RPC

### CSV Import
- Importacion masiva con mapeo heuristico de columnas (espanol/ingles)
- Soporta: nombre, email, telefono, empresa, cumpleanos, notas
- Columnas no mapeadas se guardan en `metadata` JSONB
- Deduplicacion por upsert en (tenant_id, email)
- Dispara evento customer/created para cada cliente con email

### Webhooks Genericos
- Endpoint: `POST /api/webhooks/[source]`
- Auth: header `x-aura-secret` contra tabla `webhook_endpoints`
- Event mapping configurable: paths del payload externo -> campos de Aura
- Emite evento Inngest `webhook/received`
- **Pendiente**: UI en Settings para que el usuario configure sus webhooks

---

## Flujo de Datos

```
INGRESO DE DATOS
  |
  |-- Manual (formulario /backoffice/customers/new)
  |-- CSV Import (drag & drop /backoffice/customers/import)
  |-- Webhook (POST /api/webhooks/{source})
  |-- [Futuro] Conectores nativos (OAuth + import + sync)
  |
  v
BASE DE DATOS (Supabase)
  |-- customers (datos del cliente)
  |-- interactions (eventos: email_sent, appointment_completed, etc.)
  |-- appointments (citas)
  |
  v
TRIGGERS
  |-- Evento "customer/created" --> lead-to-crm
  |-- Cron diario 8am --> birthday-reminder
  |-- Cron diario 9am --> reactivation-reminder
  |-- [Futuro] Evento "webhook/received" --> acciones configurables
  |
  v
EJECUCION (Inngest)
  |-- Fetch Google credentials del tenant
  |-- Refresh access token
  |-- Enviar email via Gmail API
  |-- Loguear interaccion + ejecucion
  |
  v
RESULTADO
  |-- automation_executions (historial)
  |-- interactions (fundamento para RFM futuro)
  |-- Dashboard con stats reales
```

---

## Multi-tenancy

- Todas las tablas tienen `tenant_id` (UUID, referencia a `auth.users.id`)
- Server-side: `supabaseAdmin` (service role) para operaciones de datos
- Client-side: `createSupabaseBrowserClient()` para auth
- `requireAuth()` en cada API route valida sesion y retorna `user`
- RLS habilitado en tablas con policies por `auth.uid()`

---

## Tablas Principales

```
customers          — datos del cliente (panel de datos)
interactions       — eventos de cada cliente (base para RFM)
appointments       — citas agendadas
automation_executions — historial de ejecuciones de automatizaciones
webhook_endpoints  — configuracion de webhooks entrantes
google_credentials — tokens OAuth de Gmail/Calendar por tenant
```

---

## Integraciones

### Google (implementada)
- OAuth con scopes: gmail.send, gmail.readonly, calendar.events
- Tokens guardados en `google_credentials`
- Refresh automatico antes de cada uso
- UI en Settings: estado de conexion + test de email

### Webhooks inbound (parcialmente implementada)
- Endpoint generico funcional
- Tabla `webhook_endpoints` existe
- **Falta**: UI en Settings para configurar, ver URL/secret, activar/desactivar

### Conectores nativos (planificado)
- Patron: OAuth -> save tokens -> import inicial -> webhooks/polling
- Prioridad: Google Sheets, TiendaNube, MercadoLibre
- Arquitectura en `lib/connectors/[sistema]/` con interfaz comun `AuraConnector`
- Tabla planificada: `connector_credentials`

---

## Estructura de Archivos Clave

```
app/
  api/
    customers/          — CRUD clientes
    appointments/       — CRUD citas
    automations/        — stats + run manual
    dashboard/          — stats agregados para dashboard
    import/customers/   — CSV import
    inngest/            — Inngest serve handler
    webhooks/[source]/  — webhook generico inbound
    integrations/       — Google status
    auth/               — save-google-tokens
  backoffice/
    dashboard/          — dashboard con datos reales
    customers/          — lista, detalle, import, nuevo
    appointments/       — lista, nueva cita
    automations/        — lista con stats reales
    settings/           — configuracion + integraciones
lib/
  inngest/
    functions/          — lead-to-crm, birthday, reactivation
  import/               — column-mapper heuristico
  email-templates.ts    — templates centralizados
  api-auth.ts           — requireAuth()
  interactions.ts       — logInteraction()
  types.ts              — interfaces compartidas
```
