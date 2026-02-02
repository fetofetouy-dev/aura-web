import { Database, Mail, CheckSquare, MessageSquare } from "lucide-react"

export const DEMO_LEAD = {
  name: "María Rodríguez",
  email: "maria@emaildemo.com",
  company: "Consultora MR",
  interest: "Automatización de marketing",
  source: "LinkedIn",
  score: 85,
}

export interface AutomationStep {
  id: string
  title: string
  icon: any
  details: string[]
  duration: number // milliseconds
}

export const AUTOMATION_STEPS: AutomationStep[] = [
  {
    id: "crm",
    title: "CRM - Pipedrive",
    icon: Database,
    details: [
      "Contacto creado",
      "Deal abierto: 'María - Automatización'",
      "Score asignado: 85/100",
      "Etapa: Nuevo Lead",
    ],
    duration: 800,
  },
  {
    id: "email",
    title: "Email - Gmail",
    icon: Mail,
    details: [
      "Email de bienvenida enviado",
      "Contenido personalizado generado con IA",
      "Plantilla: Onboarding Pymes",
      "Estado: Entregado",
    ],
    duration: 800,
  },
  {
    id: "task",
    title: "Tarea - CRM",
    icon: CheckSquare,
    details: [
      "Tarea creada para vendedor",
      "Tipo: Seguimiento de lead",
      "Fecha: En 2 días",
      "Prioridad: Alta",
    ],
    duration: 800,
  },
  {
    id: "slack",
    title: "Notificación - Slack",
    icon: MessageSquare,
    details: [
      "Canal: #ventas notificado",
      "Mensaje enviado con contexto completo",
      "Equipo alertado",
      "Lead disponible para seguimiento",
    ],
    duration: 800,
  },
]

export const DEMO_CODE = `// Automatización construida con Claude Code
async function procesarNuevoLead(lead) {
  // 1. Agregar a CRM
  await crm.agregarContacto({
    nombre: lead.nombre,
    email: lead.email,
    empresa: lead.empresa,
    score: calcularScore(lead)
  })

  // 2. Enviar email personalizado
  const emailContent = await claude.generarEmail({
    tipo: 'bienvenida',
    contexto: lead.interes,
    tono: 'profesional-cercano'
  })
  await email.enviar(lead.email, emailContent)

  // 3. Crear tareas de seguimiento
  await crm.crearTarea({
    asignado: 'equipo_ventas',
    fecha: Date.now() + 2*24*60*60*1000,
    tipo: 'seguimiento_lead',
    prioridad: lead.score > 70 ? 'alta' : 'media'
  })

  // 4. Notificar equipo
  await slack.notificar('#ventas',
    \`Nuevo lead: \${lead.nombre} - Score: \${lead.score}\`
  )
}

// Ejecutar
await procesarNuevoLead(nuevoLead)`

export const IMPACT_METRICS = [
  {
    id: "velocidad",
    label: "Más rápido",
    value: 99.5,
    suffix: "%",
    icon: "⚡",
  },
  {
    id: "ahorro",
    label: "Ahorro mensual",
    value: 250,
    suffix: " hrs",
    icon: "💰",
  },
  {
    id: "precision",
    label: "Leads procesados",
    value: 100,
    suffix: "%",
    icon: "📈",
  },
]
