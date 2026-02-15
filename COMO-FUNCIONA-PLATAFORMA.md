# Cómo Funcionaría la Plataforma Aura SaaS

## Introducción

Este documento explica **cómo funcionaría la plataforma** desde la perspectiva del usuario (dueño de Pyme) y del negocio (Aura). El objetivo es validar que el modelo se ajusta a tu visión antes de comenzar el desarrollo técnico.

---

## 1. Visión General

Aura se convierte en un **marketplace de automatizaciones** donde Pymes pueden:
- 🛍️ **Comprar** automatizaciones pre-configuradas (tipo "plugins")
- ⚙️ **Configurar** las automatizaciones con sus propias cuentas (Gmail, WhatsApp, etc.)
- ▶️ **Ejecutar** las automatizaciones (manual o automático)
- 📊 **Monitorear** logs, métricas y resultados en un dashboard

---

## 2. Journey del Usuario (Pyme)

### Paso 1: Descubrimiento
**¿Cómo llega un usuario a Aura?**
- Landing page actual (ya existe) explica el problema y la solución
- SEO: búsquedas como "automatizar leads", "recordatorios citas automáticos"
- Ads: Google Ads, Facebook Ads para Pymes
- Referidos: programa de afiliados (futuro)

**Landing page muestra:**
- Hero: "Automatiza tu Pyme en minutos, no meses"
- Demo interactiva (ya existe)
- Casos de uso por industria
- Pricing claro ($0, $29, $79, $199)
- CTA: "Comenzar Gratis" o "Ver Marketplace"

---

### Paso 2: Registro (Onboarding)
**Usuario hace clic en "Comenzar Gratis"**

**Flow:**
```
1. Click "Comenzar Gratis"
   ↓
2. Modal: "Registrarse con Google" o "Email"
   ↓
3. OAuth redirect (Google) → Permisos → Vuelve a Aura
   ↓
4. Pantalla de bienvenida: "¡Hola María! Ahora crea tu organización"
   ↓
5. Form: Nombre de la organización, industria (selector), idioma
   → Ejemplo: "Consultora MR", "Servicios Profesionales", "Español"
   ↓
6. Redirect a /dashboard
```

**Estado al finalizar:**
- ✅ Usuario autenticado
- ✅ Organización creada
- ✅ Plan: FREE (1 automatización, 100 ejecuciones/mes)
- ✅ Dashboard vacío esperando primera automatización

---

### Paso 3: Explorar Marketplace
**Usuario entra a `/marketplace`**

**Lo que ve:**
```
┌──────────────────────────────────────────────────────┐
│  Marketplace de Automatizaciones                     │
│  [Filtro: Todas las industrias ▼]  [Buscar...]      │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ 🧲      │  │ 📅      │  │ 💰      │              │
│  │ Leads   │  │ Citas   │  │ Facturas│              │
│  │ to CRM  │  │ Auto    │  │ Tracker │              │
│  │         │  │         │  │         │              │
│  │ GRATIS  │  │ $29/mes │  │ GRATIS  │              │
│  │ [Ver]   │  │ [Ver]   │  │ [Ver]   │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │ 📦      │  │ 🔔      │  │ 📊      │              │
│  │ Stock   │  │ WhatsApp│  │ Dashboard│              │
│  │ Alert   │  │ Notif.  │  │ BI      │              │
│  │         │  │         │  │         │              │
│  │ GRATIS  │  │ $49     │  │ $149    │              │
│  │ [Ver]   │  │ [Ver]   │  │ [Ver]   │              │
│  └─────────┘  └─────────┘  └─────────┘              │
└──────────────────────────────────────────────────────┘
```

**Cada card muestra:**
- Icono + nombre
- Descripción corta (1 línea)
- Precio (GRATIS, $X/mes incluido en plan, o $X compra única)
- Badge: "Más popular", "Nuevo", "Recomendado"
- Rating: ⭐⭐⭐⭐⭐ (4.8) - 234 usuarios

---

### Paso 4: Ver Detalles de Automatización
**Usuario hace clic en "Leads to CRM"**

**Página `/marketplace/leads-to-crm`:**
```
┌──────────────────────────────────────────────────────┐
│  ← Volver al Marketplace                             │
├──────────────────────────────────────────────────────┤
│                                                       │
│  🧲 Leads to CRM                                     │
│  ⭐⭐⭐⭐⭐ 4.8 (234 usuarios)                         │
│                                                       │
│  Automatiza la captura de leads desde formularios    │
│  web y envíalos directamente a tu CRM con IA.        │
│                                                       │
│  ✅ Incluido en plan Starter ($29/mes)               │
│  [Activar Automatización]                            │
│                                                       │
│  ─────────────────────────────────────────────────   │
│                                                       │
│  📋 ¿Qué hace esta automatización?                   │
│  1. Detecta nuevo lead en tu formulario web          │
│  2. Analiza el lead con IA (scoring)                 │
│  3. Crea contacto en tu CRM (Pipedrive, HubSpot)     │
│  4. Envía email de bienvenida personalizado          │
│  5. Crea tarea de seguimiento para tu equipo         │
│  6. Notifica en Slack/WhatsApp                       │
│                                                       │
│  ⚙️ Configuración requerida:                         │
│  - Gmail (para enviar emails)                        │
│  - CRM (Pipedrive o HubSpot) [opcional]             │
│  - Slack o WhatsApp [opcional]                       │
│                                                       │
│  💡 Casos de uso:                                    │
│  - Consultoras: Leads de LinkedIn → CRM              │
│  - E-commerce: Carritos abandonados → Follow-up      │
│  - Servicios: Formulario contacto → Respuesta auto   │
│                                                       │
│  📹 [Ver Video Demo]  📄 [Ver Documentación]         │
│                                                       │
│  ───────────────────────────────────────────────     │
│                                                       │
│  💬 Reseñas:                                         │
│  ⭐⭐⭐⭐⭐ "Ahorro 5 horas por semana" - Juan P.      │
│  ⭐⭐⭐⭐⭐ "Configuración súper fácil" - Ana R.       │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Usuario hace clic en "Activar Automatización"**

---

### Paso 5: Activar Automatización
**Flow depende del plan:**

**Si está en plan FREE:**
```
Modal: "Esta automatización requiere plan Starter ($29/mes)"
  [Upgrade a Starter] [Cancelar]
```

**Si ya tiene plan Starter o superior:**
```
Modal: "Configurar Leads to CRM"

  Paso 1/3: Nombre
  Nombre: [Leads desde Formulario Web]

  [Siguiente]
```

**Paso 2/3: Conectar Integraciones**
```
┌────────────────────────────────────────┐
│ Conecta tus cuentas                    │
│                                        │
│ Gmail ✅ Conectado (maria@consultora.com) │
│ [Desconectar] [Reconectar]            │
│                                        │
│ CRM                                    │
│ [Conectar Pipedrive] [Conectar HubSpot]│
│ [⏭️ Omitir por ahora]                  │
│                                        │
│ Slack (Opcional)                       │
│ [Conectar Slack]                       │
│ [⏭️ Omitir por ahora]                  │
│                                        │
│ [← Atrás] [Siguiente →]                │
└────────────────────────────────────────┘
```

**Paso 3/3: Configurar Reglas**
```
┌────────────────────────────────────────┐
│ Configuración                          │
│                                        │
│ ¿Cuándo ejecutar?                      │
│ ○ Manual (ejecuto yo cuando quiera)   │
│ ● Automático (cuando llegue un lead)  │
│ ○ Programado (cada X horas)           │
│                                        │
│ Email de bienvenida:                   │
│ Asunto: [Bienvenido a Consultora MR]  │
│ Plantilla: [Seleccionar plantilla ▼]  │
│                                        │
│ Notificaciones:                        │
│ ☑️ Enviarme email cuando se ejecute   │
│ ☐ Notificar en Slack                  │
│                                        │
│ [← Atrás] [Activar Automatización]    │
└────────────────────────────────────────┘
```

**Click en "Activar":**
- Automatización se crea en DB
- Estado: ACTIVA
- Redirect a `/dashboard/automations/[id]`

---

### Paso 6: Dashboard de Automatizaciones
**Usuario ve su dashboard principal**

**`/dashboard`:**
```
┌──────────────────────────────────────────────────────┐
│  Sidebar:              │  Contenido Principal        │
│  ─────────             │                             │
│  📊 Dashboard          │  Dashboard de Consultora MR │
│  ⚡ Automatizaciones   │                             │
│  🛍️ Marketplace        │  Resumen del mes            │
│  🔌 Integraciones      │  ┌─────────────────────┐   │
│  ⚙️ Configuración      │  │ 47 ejecuciones      │   │
│  💳 Billing            │  │ 500 límite del plan │   │
│                        │  └─────────────────────┘   │
│  [Upgrade to Pro]      │                             │
│                        │  Automatizaciones activas   │
└────────────────────────│                             │
                         │  ┌─────────────────────┐   │
                         │  │ 🧲 Leads to CRM     │   │
                         │  │ Activa desde hace 3d│   │
                         │  │ 12 ejecuciones ✅   │   │
                         │  │ Última: Hace 2h     │   │
                         │  │ [Ver logs] [Config] │   │
                         │  └─────────────────────┘   │
                         │                             │
                         │  ┌─────────────────────┐   │
                         │  │ 📦 Stock Alert      │   │
                         │  │ Activa              │   │
                         │  │ 8 ejecuciones ✅    │   │
                         │  │ Última: Hace 5h     │   │
                         │  │ [Ver logs] [Config] │   │
                         │  └─────────────────────┘   │
                         │                             │
                         │  [+ Agregar Automatización] │
                         │                             │
                         └─────────────────────────────┘
```

---

### Paso 7: Ejecutar Automatización (Manual)
**Usuario hace clic en "Ejecutar ahora"**

**Flow:**
```
1. Modal: "Ejecutar Leads to CRM"
   ¿Datos del lead? (opcional)
   Nombre: [Juan Pérez]
   Email: [juan@empresa.com]

   [Cancelar] [Ejecutar]

2. Click "Ejecutar" → Inngest recibe evento

3. Dashboard muestra:
   "Ejecutando... ⏳"

4. Se actualiza cada 2 segundos (polling)

5. Después de ~10 segundos:
   "✅ Ejecutada exitosamente"
   [Ver detalles]
```

**Click en "Ver detalles" → `/automations/[id]/logs/[executionId]`:**
```
┌──────────────────────────────────────────────────────┐
│  Ejecución #47 - Exitosa ✅                          │
│  Fecha: 15 Feb 2025, 14:32                           │
│  Duración: 8.4 segundos                              │
│  Trigger: Manual                                     │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Timeline:                                           │
│                                                       │
│  ✅ [14:32:01] Analizar lead con IA                  │
│     Input: Juan Pérez (juan@empresa.com)            │
│     Output: Score 85/100 (Lead calificado)          │
│                                                       │
│  ✅ [14:32:03] Crear contacto en CRM                 │
│     Pipedrive: Contacto creado (ID: #12345)         │
│     Deal abierto: "Juan Pérez - Consultoría"        │
│                                                       │
│  ✅ [14:32:05] Enviar email de bienvenida            │
│     Gmail: Email enviado a juan@empresa.com         │
│     Asunto: "Bienvenido a Consultora MR"            │
│                                                       │
│  ✅ [14:32:07] Crear tarea de seguimiento            │
│     Tarea creada para María Rodríguez               │
│     Fecha: 17 Feb 2025                              │
│                                                       │
│  ✅ [14:32:08] Notificar en Slack                    │
│     Canal #ventas notificado                        │
│     Mensaje: "Nuevo lead: Juan Pérez (Score 85)"   │
│                                                       │
│  ────────────────────────────────────────────────   │
│  Resultado: Todos los pasos completados ✅           │
│                                                       │
│  [Ejecutar nuevamente] [Descargar logs JSON]        │
└──────────────────────────────────────────────────────┘
```

---

### Paso 8: Ejecución Automática
**Automatización configurada en "Automático"**

**¿Cómo se dispara?**

**Opción A: Webhook (recomendado)**
```
Usuario configura en su formulario web:
URL webhook: https://aura.com/api/webhooks/leads/abc123xyz

Cuando llega un lead:
1. Formulario envía POST a webhook de Aura
2. Aura valida token
3. Aura triggerea Inngest
4. Automatización se ejecuta en background
5. Usuario recibe email: "Automatización ejecutada con éxito"
```

**Opción B: Polling (más simple, menos tiempo real)**
```
Aura revisa cada 5 minutos:
1. Cron job revisa Gmail del usuario
2. Detecta nuevo email con subject "Nuevo lead"
3. Parsea datos del email
4. Triggerea automatización
```

**Opción C: Zapier-like (futuro)**
```
Aura provee "trigger" de eventos:
- Nuevo lead en formulario
- Nuevo email recibido
- Nueva fila en Google Sheets
- etc.
```

**Usuario ve en dashboard:**
```
Notificación: "🎉 Automatización ejecutada"
Leads to CRM procesó 1 lead: Juan Pérez
[Ver detalles]
```

---

## 3. Modelo de Monetización

### Planes de Suscripción (Estilo N8N - Vista Detallada)

| Feature | Free | Starter | Professional | Enterprise |
|---------|------|---------|--------------|------------|
| **💰 Precio** | $0 | $29/mes | $79/mes | $199/mes |
| **⚡ Automatizaciones activas** | 1 | 3 | 10 | Ilimitadas |
| **🔄 Ejecuciones/mes** | 100 | 500 | 2,000 | 10,000 |
| **🔌 Integraciones** | 2 básicas<br>(Gmail + Calendar) | 5 integrations<br>(+ WhatsApp, Slack) | Ilimitadas<br>(+ APIs custom) | Ilimitadas<br>+ Enterprise apps |
| **📬 Centralizador Omnicanal** | ❌ | ✅ 1 buzón | ✅ 3 buzones | ✅ Ilimitado |
| **🤖 Asistente IA Comercial** | ❌ | ❌ | ✅ 1 bot | ✅ 3 bots + fine-tuning |
| **👥 Contactos gestionados** | 50 | 500 | 2,000 | Ilimitados |
| **💬 Historial conversaciones** | 7 días | 30 días | 90 días | 1 año |
| **👨‍💼 Multi-usuario (equipo)** | 1 usuario | 2 usuarios | 5 usuarios | Ilimitado |
| **💡 Respuestas automáticas** | ❌ | Templates básicos | Templates + IA | IA avanzada + custom |
| **📊 Analytics & Reportes** | Básico | Intermedio | Avanzado + exports | Enterprise + API |
| **🔗 Webhooks personalizados** | ❌ | ❌ | ✅ 10 webhooks | ✅ Ilimitado |
| **🎯 Prioridad ejecución** | Normal | Normal | Alta | Máxima |
| **💾 Backups** | ❌ | Semanal | Diario | Diario + on-demand |
| **🆘 Soporte** | Comunidad | Email (48h) | Email + Chat (24h) | Prioritario + Call (4h) |
| **✅ SLA Uptime** | Best effort | 99% | 99.5% | 99.9% |
| **🎓 Onboarding** | Docs | Docs + Videos | + 1 llamada setup | + Implementación dedicada |

### Marketplace (Compras Únicas)

Algunos items NO incluidos en planes:
- **Pack BI Avanzado**: $149 (dashboards financieros, reconciliación contable)
- **Pack Compliance Fiscal**: $99 (facturación automática, reportes AFIP)
- **Integración Custom**: $299 (conectar software específico del cliente)
- **Template Personalizado**: $499 (creamos automatización a medida)

### Comisiones (Futuro)

Si conectamos Mercado Pago/Stripe del cliente:
- Cobrar 0.5% adicional sobre sus transacciones
- Ejemplo: Cliente factura $10,000/mes → Aura cobra $50 extra

---

## 4. Casos de Uso por Industria

### 🛒 E-commerce

**Automatizaciones clave:**
1. **Carritos Abandonados**
   - Detecta carrito abandonado (24h sin comprar)
   - Envía email con descuento 10% OFF
   - Si no compra en 48h, envía WhatsApp

2. **Post-Venta**
   - Compra completada → Email de agradecimiento + tracking
   - 7 días después → Pedir reseña en Google/Mercado Libre
   - 30 días después → Recordar re-compra (productos recurrentes)

3. **Stock Alert**
   - Stock < 10 unidades → Email a compras
   - Stock = 0 → Pausar anuncio en Mercado Libre
   - Stock repuesto → Re-activar anuncio

---

### 💼 Servicios Profesionales (Consultoras, Abogados, Contadores)

**Automatizaciones clave:**
1. **Lead Management**
   - Formulario web → CRM → Email bienvenida → Tarea seguimiento
   - Lead no responde en 3 días → Email recordatorio
   - Lead responde → Crear propuesta automática

2. **Facturación Recurrente**
   - Día 1 del mes → Generar factura para clientes recurrentes
   - Enviar factura por email
   - Día 10 → Recordatorio si no pagó
   - Día 20 → Alerta a contable

3. **Recordatorios de Reuniones**
   - 24h antes de reunión → Email + SMS al cliente
   - 2h antes → WhatsApp con link de Zoom
   - Post-reunión → Email con resumen + próximos pasos

---

### 🏥 Consultorios/Clínicas

**Automatizaciones clave:**
1. **Gestión de Citas**
   - Paciente agenda cita → Email confirmación + instrucciones
   - 24h antes → SMS recordatorio
   - 2h antes → WhatsApp con ubicación
   - Post-consulta → Email con indicaciones médicas
   - 7 días después → Pedir feedback (NPS)

2. **Facturación Médica**
   - Cita completada → Verificar si se cobró (cruce DoctoCliq vs HIOPOS)
   - Si no se cobró → Alerta a administración
   - Fin de mes → Reporte de servicios no facturados

3. **Inventario Médico**
   - Stock insumo < umbral → Email a compras
   - Proyectar consumo según agenda futura
   - Vencimiento próximo → Alerta

---

### 🍽️ Restaurantes/Cafeterías

**Automatizaciones clave:**
1. **Reservas**
   - Reserva por Instagram DM → Agregar a Google Calendar
   - 2h antes → WhatsApp confirmación
   - Post-visita → Pedir reseña en Google Maps

2. **Compras Inteligentes**
   - Analizar ventas últimos 7 días
   - Proyectar necesidades próxima semana
   - Generar orden de compra automática
   - Enviar a proveedores por WhatsApp

3. **Marketing**
   - Martes sin reservas → Enviar promo 2x1 a clientes recurrentes
   - Cliente no visita en 30 días → Email "Te extrañamos" + descuento

---

### 📬 Centralizador Omnicanal de Contactos (FEATURE ESTRELLA)

**¿Qué es?**
Un buzón unificado que escucha TODOS los canales por donde te contactan clientes y centraliza todo en un solo lugar.

**Problema que resuelve:**
Pymes reciben mensajes por Instagram, WhatsApp, email, formulario web, Facebook, teléfono... y se pierden mensajes críticos o responden tarde.

**Cómo funciona:**

**1. Canales conectados:**
   - 📧 Gmail/Outlook
   - 📱 WhatsApp Business API
   - 📷 Instagram DMs
   - 📘 Facebook Messenger
   - 💬 Chat del sitio web
   - 📞 Llamadas (con transcripción IA)
   - 📝 Formularios web

**2. Detección automática:**
   ```
   Nuevo mensaje en Instagram DM
      ↓
   IA detecta: "Consulta comercial - lead potencial"
      ↓
   Crea registro en buzón unificado
      ↓
   Asigna a: Recepcionista/Vendedor según reglas
      ↓
   Notifica por: Email + Slack + Push notification
   ```

**3. Dashboard unificado:**
   ```
   ┌────────────────────────────────────────────┐
   │  Buzón Unificado - Consultora MR           │
   ├────────────────────────────────────────────┤
   │  📬 Juan Pérez                             │
   │  📷 Instagram DM - Hace 5 min              │
   │  "Hola, quiero consultar por servicios"   │
   │  [Responder] [Asignar] [Marcar resuelto]  │
   ├────────────────────────────────────────────┤
   │  📧 Ana García                             │
   │  📧 Email - Hace 15 min                    │
   │  "Solicito presupuesto para..."           │
   │  [Responder] [Asignar] [Marcar resuelto]  │
   ├────────────────────────────────────────────┤
   │  💬 Carlos Ruiz                            │
   │  📱 WhatsApp - Hace 1h                     │
   │  "¿Tienen disponibilidad para mañana?"    │
   │  [Responder] [Asignar] [Marcar resuelto]  │
   └────────────────────────────────────────────┘
   ```

**4. Registro unificado de contacto:**
   Cada contacto tiene un perfil único con:
   - Historial completo de conversaciones (todos los canales)
   - Tags automáticos (lead caliente, consulta, reclamo, etc.)
   - Score de prioridad (IA determina urgencia)
   - Asignación a miembro del equipo
   - Notas internas del equipo
   - Próximas acciones sugeridas

**5. Acciones automáticas:**
   - **Asignación inteligente**: IA determina a quién derivar según contenido
   - **Respuesta automática**: "Recibimos tu mensaje, te respondemos en X min"
   - **Escalamiento**: Si no se responde en X tiempo, notifica a supervisor
   - **Recordatorios**: "Tienes 3 mensajes sin responder de hace 2h"
   - **Analytics**: Tiempo promedio de respuesta, tasa de conversión por canal

**Casos de uso:**
- **Consultoras**: Todas las consultas (email, LinkedIn, web) van a 1 solo lugar
- **E-commerce**: Instagram, WhatsApp, email unificados → responder desde 1 dashboard
- **Clínicas**: Pacientes consultan por WhatsApp, llaman, mandan email → todo centralizado
- **Restaurantes**: Reservas por Instagram, llamadas, web → todo en un lugar

**Diferenciador vs competencia:**
- Zapier NO tiene un buzón unificado con UI
- Otras herramientas cobran $100+ solo por esta feature
- Aura lo incluye en Professional ($79/mes) con IA incorporada

---

### 🤖 Asistente Comercial IA (Bot Inteligente)

**¿Qué es?**
Un bot con IA (Claude/GPT) que responde automáticamente a consultas comunes y cualifica leads antes de derivar a humano.

**Problema que resuelve:**
Recepcionistas/vendedores pasan 60% del tiempo respondiendo las mismas preguntas: "¿Cuánto cuesta?", "¿Tienen disponibilidad?", "¿Dónde están ubicados?".

**Cómo funciona:**

**1. Entrenamiento del bot:**
   Usuario configura el bot con:
   - FAQs (precios, horarios, ubicación, servicios)
   - Documentos del negocio (menú, lista de precios, catálogo)
   - Ejemplos de conversaciones exitosas
   - Tono de voz (formal, casual, técnico)

**2. Respuesta automática inteligente:**
   ```
   Cliente (WhatsApp): "Hola, cuánto cuesta una consulta?"
      ↓
   Bot IA: "¡Hola! Una consulta inicial cuesta $50 USD.
            ¿Te gustaría agendar una cita? Tengo
            disponibilidad mañana a las 10am o 3pm."
      ↓
   Cliente: "Sí, mañana a las 10am"
      ↓
   Bot IA: "Perfecto, agenté tu cita para mañana 10am.
            Te envié un email de confirmación. ¿Algo más?"
      ↓
   Bot marca: Lead calificado ✅
   Notifica: A recepcionista por si necesita follow-up
   ```

**3. Cualificación de leads:**
   Bot hace preguntas clave:
   - "¿Qué servicio te interesa?"
   - "¿Cuál es tu presupuesto aproximado?"
   - "¿Cuándo necesitás comenzar?"

   Según respuestas, asigna score:
   - 🔥 Lead caliente (85+): Derivar a vendedor YA
   - ⚡ Lead tibio (60-84): Agendar follow-up
   - 🧊 Lead frío (<60): Enviar info y nutrir con contenido

**4. Handoff inteligente a humano:**
   Si detecta:
   - Frustración del cliente
   - Pregunta compleja que no puede responder
   - Cliente pide hablar con humano

   Entonces:
   - "Te conecto con María, nuestra especialista. Espera 1 minuto."
   - Notifica a humano con contexto completo de la conversación
   - Humano continúa conversación con historial visible

**5. Integración con Centralizador:**
   - Bot responde en TODOS los canales (WhatsApp, Instagram, email, web)
   - Todas las conversaciones se registran en buzón unificado
   - Equipo puede ver qué respondió el bot y continuar si es necesario

**6. Aprendizaje continuo:**
   - Analiza conversaciones exitosas vs fallidas
   - Aprende de respuestas del equipo humano
   - Sugiere mejoras en FAQs
   - Reporta preguntas que no pudo responder

**Casos de uso:**
- **Consultoras**: Bot responde consultas básicas, agenda reuniones, califica leads
- **E-commerce**: Bot responde sobre productos, stock, envíos, procesa pedidos simples
- **Clínicas**: Bot agenda citas, responde sobre precios, da indicaciones de ubicación
- **Restaurantes**: Bot toma reservas, responde sobre menú, horarios, ubicación

**Métricas:**
- Ahorro de tiempo: 40-60% de consultas resueltas sin humano
- Velocidad de respuesta: Instantánea (vs 30 min-2h con humano)
- Disponibilidad: 24/7 (vs horario laboral)
- Conversión: 20-30% más leads calificados (respuesta inmediata)

**Diferenciador vs competencia:**
- ManyChat/Chatfuel son rígidos (árboles de decisión)
- Aura usa IA real (Claude) para conversaciones naturales
- Se integra con TODO el ecosistema Aura (automatizaciones, centralizador)

---

## 5. ¿Qué Pasa "Por Dentro"? (Técnico Simplificado)

### Cuando un usuario ejecuta una automatización:

```
1. Usuario hace clic "Ejecutar" en dashboard
   ↓
2. Frontend (Next.js) llama a tRPC: executeAutomation(id)
   ↓
3. Backend valida:
   - ¿Usuario tiene permisos?
   - ¿Automatización existe y está activa?
   - ¿No excedió límite de ejecuciones del mes?
   ↓
4. Backend envía evento a Inngest (queue):
   inngest.send("automation/execute", { automationId, userId })
   ↓
5. Inngest ejecuta función en background:
   - Load config de automatización desde DB
   - Load integraciones conectadas (tokens)
   - Ejecutar steps secuencialmente:
     a) Analizar lead con IA (Claude API)
     b) Crear contacto en CRM (Pipedrive API)
     c) Enviar email (Gmail API)
     d) Crear tarea (DB)
     e) Notificar Slack (Slack API)
   - Cada step guarda log en DB
   ↓
6. Al terminar:
   - Update execution log: status = SUCCESS
   - Increment usage counter
   - Enviar notificación al usuario (email)
   ↓
7. Usuario ve en dashboard:
   - Execution log completo con timeline
   - Puede descargar JSON de resultado
```

### Ejecución automática (webhook):

```
1. Formulario del cliente envía POST a:
   POST https://aura.com/api/webhooks/abc123xyz
   Body: { name: "Juan", email: "juan@test.com" }
   ↓
2. Webhook valida token
   ↓
3. Busca automatización asociada a token
   ↓
4. Trigger Inngest (mismo flow que manual)
   ↓
5. Automatización se ejecuta en background
   ↓
6. Usuario recibe email: "Tu automatización se ejecutó"
```

---

## 6. Diferenciación vs Competidores

### vs Zapier/Make.com:
- ❌ **Ellos:** Genérico, requiere configuración técnica, curva de aprendizaje
- ✅ **Aura:** Específico para Pymes, pre-configurado, instalar y usar

### vs N8N (self-hosted):
- ❌ **Ellos:** Requiere servidor, mantenimiento, conocimientos técnicos
- ✅ **Aura:** Cloud, cero mantenimiento, soporte en español

### vs Contratar freelancer/agencia:
- ❌ **Ellos:** $500-2000 por automatización, demora semanas, sin soporte
- ✅ **Aura:** $29-79/mes, activar en minutos, soporte continuo

### vs Excel/Sheets manual:
- ❌ **Ellos:** Propenso a errores, consume tiempo, no escala
- ✅ **Aura:** Automático, confiable, escala con el negocio

---

## 7. Métricas de Éxito (KPIs)

### Para Pymes (lo que ven en dashboard):
- ⏱️ **Tiempo ahorrado**: "Has ahorrado 47 horas este mes"
- 💰 **Costo evitado**: "Equivalente a $1,200 en trabajo manual"
- 📈 **Ejecuciones exitosas**: "234/250 (93.6% success rate)"
- ⚡ **Velocidad promedio**: "Procesa 1 lead en 8.2 segundos"

### Para Aura (internal):
- 👥 **MAU (Monthly Active Users)**: Cuántos usuarios usan la plataforma
- 💳 **MRR (Monthly Recurring Revenue)**: $X en suscripciones mensuales
- 📊 **Conversión Free → Paid**: X% de usuarios gratuitos upgradearon
- 🔄 **Churn rate**: X% de usuarios cancelaron suscripción
- 🎯 **Ejecuciones promedio por usuario**: X ejecuciones/mes
- 💰 **LTV (Lifetime Value)**: Valor promedio de un cliente en su vida útil

---

## 8. Preguntas Clave para Validar

Antes de avanzar con el desarrollo, considera estas preguntas:

### Sobre el Producto:
1. **¿Te imaginás a un dueño de Pyme usando esto?** ¿O es muy técnico?
2. **¿El pricing tiene sentido?** ¿$29/mes es muy poco/mucho?
3. **¿Las automatizaciones propuestas resuelven dolores reales?**
4. **¿Falta algún caso de uso crítico?**

### Sobre el Modelo de Negocio:
1. **¿Preferís enfocarte en suscripciones o en marketplace?**
2. **¿Está claro cómo ganan plata?** (MRR + marketplace + comisiones)
3. **¿El plan Free es demasiado generoso o demasiado limitado?**

### Sobre la Competencia:
1. **¿Qué haría que alguien elija Aura vs Zapier?**
   - Propuesta: "Zapier para no-técnicos, pre-configurado para Pymes"
2. **¿Cómo competimos con freelancers?**
   - Propuesta: "Más barato, más rápido, soporte continuo"

### Sobre la Ejecución:
1. **¿8 semanas para MVP es realista?** (sí, pero ajustado)
2. **¿$50-80/mes de hosting es sostenible?** (sí hasta ~500 usuarios)
3. **¿Quién dará soporte a clientes?** (automatizado + manual)

---

## 9. Próximos Pasos

Si este modelo te convence:

### ✅ Validar:
1. ¿Se ajusta a tu visión?
2. ¿Hay algo que cambiarías?
3. ¿Algún caso de uso que falta?

### ✅ Decidir:
1. ¿Arrancamos con el MVP técnico?
2. ¿Priorizamos alguna industria específica?
3. ¿Hay features que podemos posponer para más adelante?

### ✅ Comenzar:
1. Aprobar plan arquitectónico
2. Iniciar Semana 1: Database + Auth
3. Iterar rápido con feedback

---

## Resumen Ejecutivo

**¿Qué es Aura SaaS?**
Plataforma de automatización + centralizador omnicanal + asistente IA para Pymes

**¿Cómo funciona?**
1. Pyme se registra (gratis)
2. Explora marketplace de automatizaciones
3. Activa automatización
4. Conecta sus cuentas (Gmail, WhatsApp, Instagram, etc.)
5. **NUEVO:** Centralizador unifica TODOS los mensajes en 1 buzón
6. **NUEVO:** Bot IA responde automáticamente 24/7
7. Automatización se ejecuta (manual o auto)
8. Ve logs y métricas en dashboard

**¿Cómo ganan plata?**
- Suscripciones: $0 → $29 → $79 → $199/mes
- Marketplace: Items premium $49-299
- Futuro: Comisiones sobre transacciones

**Features Estrella (Diferenciadores):**
1. **📬 Centralizador Omnicanal**: Unifica Instagram, WhatsApp, email, web en 1 buzón
2. **🤖 Asistente IA**: Bot inteligente que responde y califica leads automáticamente
3. **⚡ Automatizaciones pre-built**: No empezar de cero como Zapier

**¿Por qué usarían Aura?**
- **vs Zapier**: Pre-configurado, más fácil, incluye UI de buzón unificado
- **vs ManyChat**: IA real (no árboles rígidos) + automatizaciones backend
- **vs Contratar**: 10x más barato ($79/mes vs $2000+ implementación)
- **vs Excel manual**: Automático, confiable, escala con negocio
- **Plus**: Soporte en español, enfocado en Pymes latinoamericanas

**¿Es viable técnicamente?**
Sí, con stack moderno y MVP en 8 semanas

**¿Es rentable?**
Sí, con:
- 100 clientes pagando $29/mes = $2,900 MRR
- 50 clientes pagando $79/mes = $3,950 MRR
- Total: $6,850/mes - $80 hosting = **$6,770 profit/mes**

**Escalabilidad:**
- Mes 1-3: MVP con 3-5 automatizaciones
- Mes 4-6: Agregar 10-15 automatizaciones más
- Mes 7-12: Migrar a microservicios, agregar API
- Año 2+: Expansión internacional, integraciones enterprise

---

¿Te convence este modelo? ¿Hay algo que cambiarías?
