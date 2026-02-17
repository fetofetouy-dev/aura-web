export type InboxChannel = "whatsapp" | "instagram" | "email" | "facebook" | "phone" | "form"
export type InboxStatus = "unread" | "in_progress" | "resolved"
export type Sentiment = "positive" | "neutral" | "negative"

export interface MockInboxMessage {
  id: string
  channel: InboxChannel
  from: string
  handle?: string // @username for social
  phone?: string
  email?: string
  subject?: string // for email
  message: string
  timestamp: string
  status: InboxStatus
  assignedTo?: string
  leadScore: number
  sentiment: Sentiment
  tags: string[]
}

export const mockInboxMessages: MockInboxMessage[] = [
  {
    id: "msg-001",
    channel: "whatsapp",
    from: "María González",
    phone: "+54 9 11 2345-6789",
    message: "Hola! Quisiera saber los precios del servicio de contabilidad mensual. Tenemos una empresa de 5 personas.",
    timestamp: "2025-02-14T11:45:00Z",
    status: "unread",
    leadScore: 75,
    sentiment: "positive",
    tags: ["lead", "consulta-precio"],
  },
  {
    id: "msg-002",
    channel: "instagram",
    from: "Carlos Technik",
    handle: "@carlos_tech",
    message: "Me interesa el paquete para e-commerce. ¿Tienen demo disponible? Vi su post y me parece muy interesante.",
    timestamp: "2025-02-14T11:30:00Z",
    status: "in_progress",
    assignedTo: "Juan Pérez",
    leadScore: 82,
    sentiment: "positive",
    tags: ["lead-caliente", "demo"],
  },
  {
    id: "msg-003",
    channel: "email",
    from: "Ana Silva",
    email: "ana.silva@empresa.com",
    subject: "Consulta sobre automatizaciones para clínica",
    message: "Buenos días, estoy buscando una solución para automatizar la facturación de nuestra clínica. Tenemos 3 médicos y alrededor de 200 pacientes activos.",
    timestamp: "2025-02-14T10:15:00Z",
    status: "resolved",
    leadScore: 90,
    sentiment: "neutral",
    tags: ["lead-caliente", "clinica", "facturacion"],
  },
  {
    id: "msg-004",
    channel: "facebook",
    from: "Roberto Martínez",
    handle: "Roberto Martínez",
    message: "Buenas! Vi su publicidad en Facebook. ¿Funciona para restaurantes? Necesito organizar las reservas que me llegan por diferentes canales.",
    timestamp: "2025-02-14T09:50:00Z",
    status: "unread",
    leadScore: 68,
    sentiment: "positive",
    tags: ["lead", "restaurante", "reservas"],
  },
  {
    id: "msg-005",
    channel: "whatsapp",
    from: "Lucía Fernández",
    phone: "+54 9 351 456-7890",
    message: "Hola, tengo una consultora de RR.HH y necesito automatizar el proceso de onboarding de empleados. ¿Pueden ayudarme?",
    timestamp: "2025-02-14T09:20:00Z",
    status: "in_progress",
    assignedTo: "María López",
    leadScore: 88,
    sentiment: "positive",
    tags: ["lead-caliente", "rrhh", "onboarding"],
  },
  {
    id: "msg-006",
    channel: "form",
    from: "Diego Ramírez",
    email: "diego@tiendaonline.com",
    message: "Completé el formulario de contacto. Tengo una tienda online con Tiendanube y quiero automatizar los emails post-venta y las alertas de stock.",
    timestamp: "2025-02-14T08:45:00Z",
    status: "resolved",
    leadScore: 85,
    sentiment: "neutral",
    tags: ["lead-caliente", "ecommerce", "tiendanube"],
  },
  {
    id: "msg-007",
    channel: "phone",
    from: "Patricia Gómez",
    phone: "+54 9 11 8765-4321",
    message: "Llamó consultando por precios del plan Professional. Interesada en el Centralizador Omnicanal. Dejó mensaje de voz.",
    timestamp: "2025-02-14T08:10:00Z",
    status: "unread",
    leadScore: 78,
    sentiment: "positive",
    tags: ["lead", "professional-plan"],
  },
  {
    id: "msg-008",
    channel: "instagram",
    from: "Tienda Moda BA",
    handle: "@tiendamodaba",
    message: "Hola! ¿Pueden integrar con Mercado Libre? Necesito actualizar stock automáticamente cuando hago una venta.",
    timestamp: "2025-02-13T16:30:00Z",
    status: "resolved",
    leadScore: 71,
    sentiment: "neutral",
    tags: ["lead", "ecommerce", "mercadolibre"],
  },
  {
    id: "msg-009",
    channel: "email",
    from: "Sebastián Torres",
    email: "sebastian@abogados.com",
    subject: "Reclamo - Automatización falló",
    message: "La automatización de recordatorio de citas falló ayer y varios pacientes no recibieron el recordatorio. Necesito que lo solucionen urgente.",
    timestamp: "2025-02-13T15:00:00Z",
    status: "resolved",
    leadScore: 0,
    sentiment: "negative",
    tags: ["reclamo", "urgente"],
  },
  {
    id: "msg-010",
    channel: "whatsapp",
    from: "Valentina Cruz",
    phone: "+54 9 221 234-5678",
    message: "Soy de un gym. ¿Pueden automatizar los recordatorios de pago de cuotas mensuales? Tenemos 150 socios.",
    timestamp: "2025-02-13T11:30:00Z",
    status: "unread",
    leadScore: 79,
    sentiment: "positive",
    tags: ["lead", "gym", "pagos"],
  },
]

export const getUnreadCount = () =>
  mockInboxMessages.filter((m) => m.status === "unread").length

export const getByChannel = (channel: InboxChannel) =>
  mockInboxMessages.filter((m) => m.channel === channel)

export const getByStatus = (status: InboxStatus) =>
  mockInboxMessages.filter((m) => m.status === status)
