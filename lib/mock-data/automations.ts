export type AutomationStatus = "active" | "inactive" | "error"
export type AutomationCategory = "LEADS_CRM" | "APPOINTMENTS" | "BILLING" | "INVENTORY" | "MARKETING"

export interface MockAutomation {
  id: string
  name: string
  template: string
  category: AutomationCategory
  isActive: boolean
  lastExecution: string
  lastExecutionStatus: "SUCCESS" | "FAILED" | "RUNNING"
  executionCount: number
  successRate: number
  createdAt: string
  description: string
  integrations: string[]
}

export const mockAutomations: MockAutomation[] = [
  {
    id: "1",
    name: "Nuevo Lead → CRM + Email",
    template: "lead-to-crm",
    category: "LEADS_CRM",
    isActive: true,
    lastExecution: "2025-02-14T10:30:00Z",
    lastExecutionStatus: "SUCCESS",
    executionCount: 127,
    successRate: 98,
    createdAt: "2025-01-15T08:00:00Z",
    description: "Captura leads del formulario web y los agrega al CRM con email de bienvenida",
    integrations: ["Gmail", "Pipedrive", "Slack"],
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
    successRate: 100,
    createdAt: "2025-01-20T10:00:00Z",
    description: "Envía recordatorio automático 24h antes de cada cita agendada",
    integrations: ["Google Calendar", "WhatsApp"],
  },
  {
    id: "3",
    name: "Alerta Stock Bajo",
    template: "stock-alert",
    category: "INVENTORY",
    isActive: true,
    lastExecution: "2025-02-13T18:00:00Z",
    lastExecutionStatus: "SUCCESS",
    executionCount: 34,
    successRate: 97,
    createdAt: "2025-01-25T12:00:00Z",
    description: "Notifica al equipo cuando el stock de un producto baja del umbral configurado",
    integrations: ["Gmail", "Slack"],
  },
  {
    id: "4",
    name: "Facturación Mensual Recurrente",
    template: "recurring-billing",
    category: "BILLING",
    isActive: false,
    lastExecution: "2025-02-01T00:00:00Z",
    lastExecutionStatus: "SUCCESS",
    executionCount: 12,
    successRate: 100,
    createdAt: "2025-01-01T00:00:00Z",
    description: "Genera y envía facturas automáticamente el primer día de cada mes",
    integrations: ["Gmail", "Google Sheets"],
  },
  {
    id: "5",
    name: "Reactivación Clientes Inactivos",
    template: "win-back",
    category: "MARKETING",
    isActive: true,
    lastExecution: "2025-02-14T08:00:00Z",
    lastExecutionStatus: "FAILED",
    executionCount: 8,
    successRate: 75,
    createdAt: "2025-02-01T00:00:00Z",
    description: "Envía email personalizado a clientes que no compraron en los últimos 30 días",
    integrations: ["Gmail"],
  },
]
