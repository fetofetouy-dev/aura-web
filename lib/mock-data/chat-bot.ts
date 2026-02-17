export type MessageSender = "lead" | "bot" | "human"
export type ConversationStatus = "active" | "handed_off" | "closed"
export type Sentiment = "positive" | "neutral" | "negative"

export interface BotMessage {
  id: string
  sender: MessageSender
  text: string
  timestamp: string
}

export interface MockConversation {
  id: string
  leadName: string
  leadEmail?: string
  leadPhone?: string
  channel: "whatsapp" | "instagram" | "email" | "web"
  startedAt: string
  status: ConversationStatus
  handedOffAt?: string
  handedOffTo?: string
  messages: BotMessage[]
  leadScore: number
  interest: string
  sentiment: Sentiment
  extractedData: {
    industry?: string
    teamSize?: string
    budget?: string
    mainChallenge?: string
  }
}

export const mockConversations: MockConversation[] = [
  {
    id: "conv-001",
    leadName: "Pedro Martínez",
    leadEmail: "pedro@consultora.com",
    leadPhone: "+54 9 11 3456-7890",
    channel: "whatsapp",
    startedAt: "2025-02-14T10:00:00Z",
    status: "handed_off",
    handedOffAt: "2025-02-14T10:08:00Z",
    handedOffTo: "Juan Pérez",
    leadScore: 92,
    interest: "Automatización de leads + CRM",
    sentiment: "positive",
    extractedData: {
      industry: "Consultoría de marketing",
      teamSize: "8 personas",
      budget: "$79-199/mes",
      mainChallenge: "Gestión manual de leads y seguimiento",
    },
    messages: [
      { id: "m1", sender: "lead", text: "Hola, necesito información sobre sus servicios", timestamp: "2025-02-14T10:00:00Z" },
      { id: "m2", sender: "bot", text: "¡Hola Pedro! Soy el asistente de Aura 👋 Ayudamos a Pymes a automatizar sus procesos con IA. ¿Qué tipo de negocio tienes?", timestamp: "2025-02-14T10:00:05Z" },
      { id: "m3", sender: "lead", text: "Tengo una consultora de marketing digital, 8 personas", timestamp: "2025-02-14T10:00:45Z" },
      { id: "m4", sender: "bot", text: "¡Perfecto! Para consultoras como la tuya, estas automatizaciones son las más populares:\n\n🧲 *Gestión de leads*: captura y seguimiento automático\n📊 *Reportes a clientes*: envía reportes programados\n💰 *Facturación recurrente*: genera facturas automáticamente\n\n¿Cuál te interesa más?", timestamp: "2025-02-14T10:00:50Z" },
      { id: "m5", sender: "lead", text: "La gestión de leads principalmente. Perdemos muchos porque no hacemos seguimiento a tiempo", timestamp: "2025-02-14T10:02:00Z" },
      { id: "m6", sender: "bot", text: "Entiendo, ese es uno de los dolores más comunes 😊 Con nuestra automatización *Lead → CRM*, cuando llega un lead:\n\n1️⃣ Lo analiza la IA y le asigna un score\n2️⃣ Lo agrega automáticamente a tu CRM\n3️⃣ Envía email de bienvenida personalizado\n4️⃣ Crea tarea de seguimiento para tu equipo\n5️⃣ Te notifica en Slack\n\nTodo en menos de 10 segundos. ¿Cuántos leads reciben por mes aproximadamente?", timestamp: "2025-02-14T10:02:05Z" },
      { id: "m7", sender: "lead", text: "Entre 30 y 50 por mes. ¿Cuánto cuesta?", timestamp: "2025-02-14T10:03:30Z" },
      { id: "m8", sender: "bot", text: "El plan Starter incluye esta automatización y cuesta $29/mes. Incluye hasta 500 ejecuciones y 3 automatizaciones activas.\n\nPero para 30-50 leads + seguimiento te recomendaría el Professional ($79/mes) que incluye integraciones ilimitadas y el Centralizador Omnicanal.\n\n¿Te gustaría hablar con uno de nuestros especialistas para ver qué plan se ajusta mejor a tu consultora?", timestamp: "2025-02-14T10:03:35Z" },
      { id: "m9", sender: "lead", text: "Sí, me interesa hablar con alguien", timestamp: "2025-02-14T10:05:00Z" },
      { id: "m10", sender: "bot", text: "¡Genial! Te conecto con Juan, nuestro especialista. Tiene todo el contexto de nuestra conversación. ¡Un segundo! 🙌", timestamp: "2025-02-14T10:05:05Z" },
      { id: "m11", sender: "human", text: "¡Hola Pedro! Soy Juan. Vi que estás interesado en automatizar la gestión de leads para tu consultora. Cuéntame un poco más sobre tu proceso actual...", timestamp: "2025-02-14T10:08:00Z" },
    ],
  },
  {
    id: "conv-002",
    leadName: "Sofía Reyes",
    channel: "instagram",
    startedAt: "2025-02-14T09:15:00Z",
    status: "active",
    leadScore: 65,
    interest: "Recordatorios de citas",
    sentiment: "positive",
    extractedData: {
      industry: "Clínica odontológica",
      teamSize: "3 personas",
    },
    messages: [
      { id: "m1", sender: "lead", text: "Hola! Vi su perfil. ¿Para clínicas dental funciona?", timestamp: "2025-02-14T09:15:00Z" },
      { id: "m2", sender: "bot", text: "¡Hola Sofía! 😊 Sí, trabajamos mucho con clínicas odontológicas. Las automatizaciones más usadas son:\n\n📅 Recordatorios de citas\n💰 Facturación médica\n⭐ Solicitud de reseñas post-consulta\n\n¿Cuál de estas necesitas más?", timestamp: "2025-02-14T09:15:05Z" },
      { id: "m3", sender: "lead", text: "Los recordatorios de citas. Los pacientes se olvidan mucho y perdemos tiempo", timestamp: "2025-02-14T09:16:30Z" },
      { id: "m4", sender: "bot", text: "¡Es uno de los más populares en clínicas! Con nuestra automatización:\n\n✅ Email de confirmación inmediato al agendar\n📱 WhatsApp 24h antes\n📱 WhatsApp 2h antes con dirección\n📧 Email post-consulta con indicaciones\n\n¿Cuántas citas tienen por semana aproximadamente?", timestamp: "2025-02-14T09:16:35Z" },
      { id: "m5", sender: "lead", text: "Unas 40 por semana entre los 3 doctores", timestamp: "2025-02-14T09:18:00Z" },
      { id: "m6", sender: "bot", text: "Perfecto, con eso el plan Starter ($29/mes) les alcanza. Incluye recordatorios ilimitados.\n\n¿Usan Google Calendar o algún sistema de gestión de citas?", timestamp: "2025-02-14T09:18:05Z" },
    ],
  },
  {
    id: "conv-003",
    leadName: "Martín López",
    leadEmail: "martin@tiendaml.com",
    channel: "web",
    startedAt: "2025-02-13T16:00:00Z",
    status: "closed",
    leadScore: 45,
    interest: "Información general",
    sentiment: "neutral",
    extractedData: {
      industry: "E-commerce",
      mainChallenge: "Presupuesto limitado",
    },
    messages: [
      { id: "m1", sender: "lead", text: "Hola, ¿tienen plan gratuito?", timestamp: "2025-02-13T16:00:00Z" },
      { id: "m2", sender: "bot", text: "¡Hola! Sí, tenemos un plan Free con 1 automatización activa y 100 ejecuciones/mes. ¿Para qué tipo de negocio lo necesitas?", timestamp: "2025-02-13T16:00:05Z" },
      { id: "m3", sender: "lead", text: "Tengo una tienda online pequeña", timestamp: "2025-02-13T16:01:00Z" },
      { id: "m4", sender: "bot", text: "¡Para empezar el plan Free puede funcionar! Podrías usar la automatización de Alerta de Stock Bajo (incluida gratis).\n\nSi quieres recuperar carritos abandonados o pedir reseñas post-venta, necesitarías el plan Starter ($29/mes).\n\n¿Te gustaría ver una demo del plan Free?", timestamp: "2025-02-13T16:01:05Z" },
      { id: "m5", sender: "lead", text: "Ok voy a pensarlo, gracias", timestamp: "2025-02-13T16:03:00Z" },
      { id: "m6", sender: "bot", text: "¡Claro! Cuando quieras podés registrarte gratis en aura.com. Si tenés dudas estoy acá 😊", timestamp: "2025-02-13T16:03:05Z" },
    ],
  },
]

export const getActiveConversations = () =>
  mockConversations.filter((c) => c.status === "active")

export const getHandedOffConversations = () =>
  mockConversations.filter((c) => c.status === "handed_off")
