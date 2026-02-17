export interface ExecutionStep {
  id: string
  title: string
  status: "SUCCESS" | "FAILED" | "RUNNING" | "PENDING"
  timestamp: string
  duration: number // ms
  details: string[]
}

export interface MockExecution {
  id: string
  automationId: string
  automationName: string
  status: "SUCCESS" | "FAILED" | "RUNNING"
  trigger: "MANUAL" | "WEBHOOK" | "SCHEDULED"
  startedAt: string
  duration: number // seconds
  steps: ExecutionStep[]
}

export const mockExecutions: MockExecution[] = [
  {
    id: "exec-001",
    automationId: "1",
    automationName: "Nuevo Lead → CRM + Email",
    status: "SUCCESS",
    trigger: "WEBHOOK",
    startedAt: "2025-02-14T10:30:00Z",
    duration: 8,
    steps: [
      {
        id: "s1",
        title: "Analizar lead con IA",
        status: "SUCCESS",
        timestamp: "2025-02-14T10:30:01Z",
        duration: 1200,
        details: ["Lead: María Rodríguez (maria@consultora.com)", "Score: 85/100 (Lead calificado)", "Interés detectado: Automatización de marketing"],
      },
      {
        id: "s2",
        title: "Crear contacto en CRM",
        status: "SUCCESS",
        timestamp: "2025-02-14T10:30:03Z",
        duration: 800,
        details: ["Pipedrive: Contacto creado (ID: #12847)", "Deal abierto: 'María R. - Automatización'", "Etapa: Nuevo Lead"],
      },
      {
        id: "s3",
        title: "Enviar email de bienvenida",
        status: "SUCCESS",
        timestamp: "2025-02-14T10:30:05Z",
        duration: 600,
        details: ["Gmail: Email enviado a maria@consultora.com", "Asunto: '¡Bienvenida a Consultora MR!'", "Estado: Entregado"],
      },
      {
        id: "s4",
        title: "Crear tarea de seguimiento",
        status: "SUCCESS",
        timestamp: "2025-02-14T10:30:07Z",
        duration: 400,
        details: ["Tarea creada para el equipo de ventas", "Fecha: 16 Feb 2025", "Prioridad: Alta"],
      },
      {
        id: "s5",
        title: "Notificar en Slack",
        status: "SUCCESS",
        timestamp: "2025-02-14T10:30:08Z",
        duration: 300,
        details: ["Canal #ventas notificado", "Mensaje: 'Nuevo lead: María R. (Score 85)'"],
      },
    ],
  },
  {
    id: "exec-002",
    automationId: "1",
    automationName: "Nuevo Lead → CRM + Email",
    status: "SUCCESS",
    trigger: "MANUAL",
    startedAt: "2025-02-14T08:15:00Z",
    duration: 7,
    steps: [
      {
        id: "s1",
        title: "Analizar lead con IA",
        status: "SUCCESS",
        timestamp: "2025-02-14T08:15:01Z",
        duration: 1100,
        details: ["Lead: Carlos Ruiz (carlos@empresa.com)", "Score: 72/100 (Lead tibio)", "Interés detectado: Software de gestión"],
      },
      {
        id: "s2",
        title: "Crear contacto en CRM",
        status: "SUCCESS",
        timestamp: "2025-02-14T08:15:02Z",
        duration: 750,
        details: ["Pipedrive: Contacto creado (ID: #12846)", "Deal abierto: 'Carlos R. - Software'"],
      },
      {
        id: "s3",
        title: "Enviar email de bienvenida",
        status: "SUCCESS",
        timestamp: "2025-02-14T08:15:04Z",
        duration: 550,
        details: ["Gmail: Email enviado a carlos@empresa.com", "Estado: Entregado"],
      },
      {
        id: "s4",
        title: "Crear tarea de seguimiento",
        status: "SUCCESS",
        timestamp: "2025-02-14T08:15:06Z",
        duration: 350,
        details: ["Tarea creada", "Fecha: 17 Feb 2025", "Prioridad: Media"],
      },
      {
        id: "s5",
        title: "Notificar en Slack",
        status: "SUCCESS",
        timestamp: "2025-02-14T08:15:07Z",
        duration: 280,
        details: ["Canal #ventas notificado"],
      },
    ],
  },
  {
    id: "exec-003",
    automationId: "5",
    automationName: "Reactivación Clientes Inactivos",
    status: "FAILED",
    trigger: "SCHEDULED",
    startedAt: "2025-02-14T08:00:00Z",
    duration: 3,
    steps: [
      {
        id: "s1",
        title: "Obtener lista de clientes inactivos",
        status: "SUCCESS",
        timestamp: "2025-02-14T08:00:01Z",
        duration: 800,
        details: ["Google Sheets: 12 clientes inactivos encontrados", "Criterio: Sin actividad en 30+ días"],
      },
      {
        id: "s2",
        title: "Generar email personalizado con IA",
        status: "FAILED",
        timestamp: "2025-02-14T08:00:03Z",
        duration: 2100,
        details: ["Error: Rate limit de API alcanzado", "Código: 429 Too Many Requests", "Acción: Reintento programado en 1h"],
      },
    ],
  },
]

export const getExecutionsByAutomation = (automationId: string) =>
  mockExecutions.filter((e) => e.automationId === automationId)
