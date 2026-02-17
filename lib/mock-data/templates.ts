export type TemplateCategory = "LEADS_CRM" | "APPOINTMENTS" | "BILLING" | "INVENTORY" | "MARKETING"

export interface TemplateStep {
  icon: string
  title: { es: string; en: string; pt: string }
}

export interface MockTemplate {
  slug: string
  name: { es: string; en: string; pt: string }
  description: { es: string; en: string; pt: string }
  category: TemplateCategory
  icon: string
  emoji: string
  price: number // 0 = included in plan
  planRequired: "FREE" | "STARTER" | "PROFESSIONAL"
  steps: TemplateStep[]
  integrations: string[]
  isPopular?: boolean
  isNew?: boolean
  rating: number
  reviewCount: number
}

export const mockTemplates: MockTemplate[] = [
  {
    slug: "lead-to-crm",
    name: { es: "Lead a CRM", en: "Lead to CRM", pt: "Lead para CRM" },
    description: {
      es: "Captura leads de formularios y los agrega automáticamente a tu CRM con email de bienvenida",
      en: "Captures leads from forms and automatically adds them to your CRM with welcome email",
      pt: "Captura leads de formulários e os adiciona automaticamente ao seu CRM com email de boas-vindas",
    },
    category: "LEADS_CRM",
    icon: "user-plus",
    emoji: "🧲",
    price: 0,
    planRequired: "STARTER",
    steps: [
      { icon: "mail", title: { es: "Recibir lead del formulario", en: "Receive lead from form", pt: "Receber lead do formulário" } },
      { icon: "brain", title: { es: "Analizar con IA (score)", en: "Analyze with AI (score)", pt: "Analisar com IA (score)" } },
      { icon: "database", title: { es: "Crear contacto en CRM", en: "Create contact in CRM", pt: "Criar contato no CRM" } },
      { icon: "send", title: { es: "Enviar email de bienvenida", en: "Send welcome email", pt: "Enviar email de boas-vindas" } },
      { icon: "bell", title: { es: "Notificar al equipo", en: "Notify the team", pt: "Notificar a equipe" } },
    ],
    integrations: ["Gmail", "Pipedrive", "HubSpot", "Slack"],
    isPopular: true,
    rating: 4.8,
    reviewCount: 234,
  },
  {
    slug: "appointment-reminder",
    name: { es: "Recordatorio de Citas", en: "Appointment Reminder", pt: "Lembrete de Consultas" },
    description: {
      es: "Envía recordatorios automáticos 24h y 2h antes de cada cita por email y WhatsApp",
      en: "Sends automatic reminders 24h and 2h before each appointment via email and WhatsApp",
      pt: "Envia lembretes automáticos 24h e 2h antes de cada consulta por email e WhatsApp",
    },
    category: "APPOINTMENTS",
    icon: "calendar",
    emoji: "📅",
    price: 0,
    planRequired: "STARTER",
    steps: [
      { icon: "calendar", title: { es: "Detectar nueva cita", en: "Detect new appointment", pt: "Detectar nova consulta" } },
      { icon: "mail", title: { es: "Email confirmación inmediata", en: "Immediate confirmation email", pt: "Email de confirmação imediato" } },
      { icon: "clock", title: { es: "Recordatorio 24h antes", en: "Reminder 24h before", pt: "Lembrete 24h antes" } },
      { icon: "message-circle", title: { es: "WhatsApp 2h antes", en: "WhatsApp 2h before", pt: "WhatsApp 2h antes" } },
    ],
    integrations: ["Google Calendar", "WhatsApp", "Gmail"],
    isPopular: true,
    rating: 4.9,
    reviewCount: 189,
  },
  {
    slug: "stock-alert",
    name: { es: "Alerta de Stock Bajo", en: "Low Stock Alert", pt: "Alerta de Estoque Baixo" },
    description: {
      es: "Notifica automáticamente cuando el stock cae por debajo del umbral que configures",
      en: "Automatically notifies when stock falls below your configured threshold",
      pt: "Notifica automaticamente quando o estoque cai abaixo do limite que você configurar",
    },
    category: "INVENTORY",
    icon: "package",
    emoji: "📦",
    price: 0,
    planRequired: "FREE",
    steps: [
      { icon: "eye", title: { es: "Monitorear stock", en: "Monitor stock", pt: "Monitorar estoque" } },
      { icon: "alert-triangle", title: { es: "Detectar umbral mínimo", en: "Detect minimum threshold", pt: "Detectar limite mínimo" } },
      { icon: "mail", title: { es: "Email al equipo de compras", en: "Email to purchasing team", pt: "Email para equipe de compras" } },
      { icon: "bell", title: { es: "Notificación en Slack", en: "Slack notification", pt: "Notificação no Slack" } },
    ],
    integrations: ["Google Sheets", "Gmail", "Slack"],
    isNew: true,
    rating: 4.6,
    reviewCount: 67,
  },
  {
    slug: "recurring-billing",
    name: { es: "Facturación Recurrente", en: "Recurring Billing", pt: "Faturamento Recorrente" },
    description: {
      es: "Genera y envía facturas automáticamente a tus clientes recurrentes cada mes",
      en: "Automatically generates and sends invoices to your recurring clients every month",
      pt: "Gera e envia faturas automaticamente para seus clientes recorrentes todo mês",
    },
    category: "BILLING",
    icon: "file-text",
    emoji: "💰",
    price: 0,
    planRequired: "STARTER",
    steps: [
      { icon: "calendar", title: { es: "Trigger día 1 del mes", en: "Trigger on 1st of month", pt: "Trigger no dia 1 do mês" } },
      { icon: "file-text", title: { es: "Generar factura", en: "Generate invoice", pt: "Gerar fatura" } },
      { icon: "send", title: { es: "Enviar al cliente", en: "Send to client", pt: "Enviar ao cliente" } },
      { icon: "clock", title: { es: "Recordatorio si no paga en 10 días", en: "Reminder if unpaid after 10 days", pt: "Lembrete se não pagar em 10 dias" } },
    ],
    integrations: ["Gmail", "Google Sheets"],
    rating: 4.7,
    reviewCount: 112,
  },
  {
    slug: "win-back",
    name: { es: "Reactivar Clientes", en: "Win Back Clients", pt: "Reativar Clientes" },
    description: {
      es: "Detecta clientes inactivos y les envía una oferta personalizada para reactivarlos",
      en: "Detects inactive clients and sends them a personalized offer to win them back",
      pt: "Detecta clientes inativos e envia uma oferta personalizada para reativá-los",
    },
    category: "MARKETING",
    icon: "refresh-cw",
    emoji: "🔄",
    price: 0,
    planRequired: "STARTER",
    steps: [
      { icon: "search", title: { es: "Detectar clientes sin actividad 30 días", en: "Detect clients inactive 30 days", pt: "Detectar clientes sem atividade 30 dias" } },
      { icon: "brain", title: { es: "Generar oferta personalizada con IA", en: "Generate personalized offer with AI", pt: "Gerar oferta personalizada com IA" } },
      { icon: "mail", title: { es: "Enviar email 'Te extrañamos'", en: "Send 'We miss you' email", pt: "Enviar email 'Sentimos sua falta'" } },
    ],
    integrations: ["Gmail", "Google Sheets"],
    rating: 4.5,
    reviewCount: 45,
  },
  {
    slug: "post-sale-review",
    name: { es: "Pedir Reseña Post-Venta", en: "Post-Sale Review Request", pt: "Solicitar Avaliação Pós-Venda" },
    description: {
      es: "7 días después de una venta, pide automáticamente una reseña en Google o Mercado Libre",
      en: "7 days after a sale, automatically requests a review on Google or Mercado Libre",
      pt: "7 dias após uma venda, solicita automaticamente uma avaliação no Google ou Mercado Livre",
    },
    category: "MARKETING",
    icon: "star",
    emoji: "⭐",
    price: 0,
    planRequired: "FREE",
    steps: [
      { icon: "check-circle", title: { es: "Detectar venta completada", en: "Detect completed sale", pt: "Detectar venda concluída" } },
      { icon: "clock", title: { es: "Esperar 7 días", en: "Wait 7 days", pt: "Aguardar 7 dias" } },
      { icon: "mail", title: { es: "Enviar solicitud de reseña", en: "Send review request", pt: "Enviar solicitação de avaliação" } },
    ],
    integrations: ["Gmail"],
    isNew: true,
    rating: 4.4,
    reviewCount: 28,
  },
  {
    slug: "instagram-reservation",
    name: { es: "Reserva por Instagram DM", en: "Instagram DM Reservation", pt: "Reserva por Instagram DM" },
    description: {
      es: "Detecta solicitudes de reserva en Instagram DMs y las agrega automáticamente al calendario",
      en: "Detects reservation requests in Instagram DMs and automatically adds them to the calendar",
      pt: "Detecta solicitações de reserva no Instagram DMs e as adiciona automaticamente ao calendário",
    },
    category: "APPOINTMENTS",
    icon: "instagram",
    emoji: "📷",
    price: 0,
    planRequired: "PROFESSIONAL",
    steps: [
      { icon: "message-circle", title: { es: "Detectar DM con intención de reserva", en: "Detect DM with reservation intent", pt: "Detectar DM com intenção de reserva" } },
      { icon: "brain", title: { es: "IA extrae fecha/hora/personas", en: "AI extracts date/time/people", pt: "IA extrai data/hora/pessoas" } },
      { icon: "calendar", title: { es: "Crear en Google Calendar", en: "Create in Google Calendar", pt: "Criar no Google Calendar" } },
      { icon: "message-circle", title: { es: "Responder confirmación en Instagram", en: "Reply confirmation on Instagram", pt: "Responder confirmação no Instagram" } },
    ],
    integrations: ["Instagram", "Google Calendar"],
    isPopular: true,
    rating: 4.9,
    reviewCount: 156,
  },
  {
    slug: "abandoned-cart",
    name: { es: "Recuperar Carrito Abandonado", en: "Recover Abandoned Cart", pt: "Recuperar Carrinho Abandonado" },
    description: {
      es: "Detecta carritos abandonados y envía email + WhatsApp con descuento para recuperar la venta",
      en: "Detects abandoned carts and sends email + WhatsApp with discount to recover the sale",
      pt: "Detecta carrinhos abandonados e envia email + WhatsApp com desconto para recuperar a venda",
    },
    category: "MARKETING",
    icon: "shopping-cart",
    emoji: "🛒",
    price: 0,
    planRequired: "STARTER",
    steps: [
      { icon: "shopping-cart", title: { es: "Detectar carrito sin comprar 24h", en: "Detect cart unpurchased 24h", pt: "Detectar carrinho sem compra 24h" } },
      { icon: "mail", title: { es: "Email con descuento 10% OFF", en: "Email with 10% OFF discount", pt: "Email com desconto 10% OFF" } },
      { icon: "clock", title: { es: "Si no compra en 48h: WhatsApp", en: "If unpurchased after 48h: WhatsApp", pt: "Se não comprar em 48h: WhatsApp" } },
    ],
    integrations: ["Gmail", "WhatsApp"],
    isNew: true,
    rating: 4.7,
    reviewCount: 89,
  },
]

export const templateCategories = [
  { id: "ALL", label: { es: "Todas", en: "All", pt: "Todas" }, emoji: "🔍" },
  { id: "LEADS_CRM", label: { es: "Leads & CRM", en: "Leads & CRM", pt: "Leads & CRM" }, emoji: "🧲" },
  { id: "APPOINTMENTS", label: { es: "Citas", en: "Appointments", pt: "Consultas" }, emoji: "📅" },
  { id: "BILLING", label: { es: "Facturación", en: "Billing", pt: "Faturamento" }, emoji: "💰" },
  { id: "INVENTORY", label: { es: "Inventario", en: "Inventory", pt: "Estoque" }, emoji: "📦" },
  { id: "MARKETING", label: { es: "Marketing", en: "Marketing", pt: "Marketing" }, emoji: "📢" },
]
