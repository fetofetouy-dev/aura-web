# Estructura del Sitio Web - Aura

## Investigación y Contexto

Basado en la investigación del mercado de automatización con IA para Pymes en 2026:

### Hallazgos Clave:
- **64% de Pymes en España** ya usa IA, y el **83%** ha aumentado su facturación
- Las Pymes buscan automatizar: gestión de correos, redes sociales, CRM, campañas de marketing
- **Tendencia 2026:** Agentes autónomos que ejecutan tareas completas (detectar oportunidad → generar contenido → lanzar campaña → optimizar)
- Ejemplos prácticos que resuenan: gestión de leads automática, onboarding de clientes, soporte 24/7

### Competidores/Referencias:
- AlexMultimedia (automatización con MAKE para Pymes)
- Eesel AI (AI teammates sin código)
- Claude Cowork (automatización multistep en navegador y archivos)

---

## Estructura Propuesta del Sitio

### 1. HERO SECTION (Above the Fold)
**Propósito:** Captar atención inmediata y comunicar el valor principal

**Elementos:**
- Logo "AURA" con el arrow flow wordmark
- **H1 Principal:** "Automatización inteligente para Pymes que quieren crecer"
- **Subtítulo:** "Liberamos tiempo y recursos con agentes de IA que trabajan 24/7 para tu negocio"
- **CTA Principal:** "Ver Demo en Vivo" (pill button con gradiente)
- **CTA Secundario:** "Agenda una Consulta"
- **Elemento Visual:** Líneas de flujo sutiles animadas en el fondo, simulando automatización en acción

**Mensaje Clave:** Automatización = Más tiempo + Más ventas + Menos costos

---

### 2. SECCIÓN: "EL PROBLEMA" (Problem Statement)
**Propósito:** Conectar emocionalmente con el dolor del cliente

**Título:** "¿Tu Pyme pierde tiempo en tareas repetitivas?"

**3 Cards con problemas comunes:**
1. **Gestión Manual de Leads**
   - "Cada lead nuevo requiere 10 pasos manuales: agregar al CRM, enviar email, programar seguimiento..."
   - Icono: Clipboard con check marks

2. **Respuestas Lentas a Clientes**
   - "Tus clientes esperan horas (o días) por respuestas a preguntas comunes"
   - Icono: Clock con mensaje

3. **Creación de Contenido**
   - "Necesitas estar presente en redes sociales pero no tienes tiempo ni equipo"
   - Icono: Document con sparkles

**Visual:** Fondo #13151E para las cards, bordes sutiles #1F2937

---

### 3. SECCIÓN: "LA SOLUCIÓN" (How It Works)
**Propósito:** Explicar claramente cómo Aura resuelve estos problemas

**Título:** "Automatización inteligente con Claude AI"

**Proceso en 3 pasos:**
1. **Analizamos tu negocio** → Identificamos procesos automatizables
2. **Diseñamos tu agente** → Creamos flujos personalizados con Claude Code
3. **Implementamos y optimizamos** → Tu equipo se enfoca en lo importante

**Visual:** Timeline horizontal con iconos conectados por líneas de flujo (gradiente sutil)

---

### 4. SECCIÓN: "DEMO INTERACTIVA" ⭐ (Este es el diferenciador clave)
**Propósito:** Mostrar valor tangible - que el visitante VIVA la automatización

**Título:** "Mira cómo funciona en tiempo real"

**Automatización de Ejemplo:**
**"Asistente de Gestión de Leads para Pymes"**

**Interfaz Interactiva en el sitio:**
```
┌─────────────────────────────────────────────┐
│  🎯 Simulador: Nuevo Lead Detectado         │
├─────────────────────────────────────────────┤
│  Nombre: María Rodríguez                    │
│  Email: maria@emaildemo.com                 │
│  Interés: Automatización de marketing       │
│  Origen: LinkedIn                           │
│                                             │
│  [▶ Activar Automatización]                │
└─────────────────────────────────────────────┘

Al presionar el botón, se despliega una animación mostrando:
✓ Lead agregado al CRM (Salesforce/Pipedrive)
✓ Email de bienvenida enviado (personalizado)
✓ Tarea creada para vendedor: "Seguimiento en 2 días"
✓ Lead agregado a campaña de nurturing
✓ Notificación enviada a Slack del equipo

Tiempo total: 0.3 segundos
Tiempo manual tradicional: ~15 minutos
```

**Código de la Automatización (Mostrar como "código vivo"):**
```javascript
// Automatización construida con Claude Code
async function procesarNuevoLead(lead) {
  // 1. Agregar a CRM
  await crm.agregarContacto(lead)

  // 2. Enviar email personalizado
  const emailContent = await claude.generarEmail({
    tipo: 'bienvenida',
    contexto: lead.interes
  })
  await email.enviar(lead.email, emailContent)

  // 3. Crear tareas de seguimiento
  await crm.crearTarea({
    asignado: 'equipo_ventas',
    fecha: Date.now() + 2*24*60*60*1000,
    tipo: 'seguimiento_lead'
  })

  // 4. Notificar equipo
  await slack.notificar('#ventas', `Nuevo lead: ${lead.nombre}`)
}
```

**Métricas de Impacto (mostrar al lado):**
- ⚡ 99.5% más rápido
- 💰 Ahorro: ~250 hrs/mes
- 📈 0% de leads olvidados

---

### 5. SECCIÓN: "CASOS DE USO" (Use Cases)
**Propósito:** Mostrar versatilidad - no es solo para un tipo de negocio

**Título:** "Automatizaciones que transforman Pymes"

**Grid de 6 cards:**

1. **E-commerce**
   - Respuestas automáticas a consultas de productos
   - Seguimiento post-compra personalizado
   - Gestión de inventario y alertas

2. **Consultorías/Agencias**
   - Onboarding automatizado de clientes
   - Generación de reportes mensuales
   - Propuestas comerciales personalizadas

3. **Clínicas/Servicios de Salud**
   - Confirmación de citas automática
   - FAQs y pre-calificación de pacientes
   - Recordatorios y seguimiento

4. **Restaurantes/Hotelería**
   - Gestión de reservas
   - Respuestas a reseñas
   - Marketing en fechas especiales

5. **Inmobiliarias**
   - Calificación automática de prospectos
   - Tours virtuales y scheduling
   - Seguimiento de clientes interesados

6. **Retail**
   - Gestión de redes sociales
   - Respuestas a clientes en WhatsApp/IG
   - Análisis de inventario y restock

---

### 6. SECCIÓN: "POR QUÉ AURA" (Why Us)
**Propósito:** Diferenciadores vs competencia

**Título:** "La diferencia Aura"

**3 Pilares:**

1. **Powered by Claude AI** ⚡
   - La IA más avanzada del mercado (Anthropic)
   - Razonamiento complejo, no solo templates

2. **Hecho para Pymes** 🎯
   - Precios accesibles, sin contratos anuales
   - Implementación en días, no meses

3. **Soporte Continuo** 🤝
   - Optimizamos tus automatizaciones constantemente
   - Equipo humano siempre disponible

---

### 7. SECCIÓN: "PRICING" (Opcional para MVP)
**Propósito:** Transparencia en costos

**Estructura de planes:**
- **Starter:** 1-2 automatizaciones simples
- **Growth:** 3-5 automatizaciones + optimización
- **Scale:** Automatizaciones ilimitadas + agente dedicado

**CTA:** "Hablemos de tu caso" (no pricing exacto, enfoque consultivo)

---

### 8. SECCIÓN: "TESTIMONIOS" (Si ya tienes)
**Propósito:** Social proof

**Formato:** Cards con:
- Quote del cliente
- Métrica de impacto
- Logo/Nombre del negocio

---

### 9. SECCIÓN: "CTA FINAL"
**Propósito:** Última oportunidad de conversión

**Título:** "¿Listo para automatizar tu Pyme?"

**Dos opciones:**
1. **"Agenda una Demo Personalizada"** (Calendly embed)
2. **"Descarga el Caso de Estudio"** (Lead magnet)

---

### 10. FOOTER
**Elementos:**
- Logo Aura
- Links: Inicio | Casos de Uso | Blog (futuro) | Contacto
- Email: contacto@aura.com
- Redes sociales (LinkedIn, Twitter/X)
- Legal: Términos | Privacidad

---

## Stack Tecnológico Recomendado

Para lograr la estética "Tech Premium" con performance óptima:

### Frontend:
- **Next.js 14+** (App Router) - SSR, optimización automática
- **Tailwind CSS** - Para mantener consistencia con el sistema de diseño
- **Framer Motion** - Animaciones fluidas de las líneas de flujo
- **Lucide Icons** - Iconografía minimalista

### Hosting:
- **Vercel** - Deploy optimizado para Next.js, edge functions
- **Alternativa:** Netlify

### Interactividad del Demo:
- **React** components con state management local
- **Anime.js** o **GSAP** para las animaciones del flujo de automatización

### Analytics:
- **Vercel Analytics** - Integrado nativamente
- **PostHog** - Para tracking de eventos (clicks en demo)

---

## Próximos Pasos

1. ✅ Documentación guardada
2. ⏳ Crear estructura de carpetas del proyecto
3. ⏳ Implementar Hero Section con el sistema de diseño
4. ⏳ Desarrollar el componente de Demo Interactiva
5. ⏳ Integrar formularios de contacto/calendario

¿Quieres que proceda a crear el proyecto Next.js con la estructura base?
