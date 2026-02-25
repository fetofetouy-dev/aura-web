import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"

// Real automations registered in the system
const AUTOMATION_DEFINITIONS = [
  {
    id: "lead-to-crm",
    name: "Nuevo Lead → Email de bienvenida",
    description: "Cuando se crea un cliente con email, envía automáticamente un email de bienvenida vía Gmail.",
    category: "LEADS_CRM",
    trigger: "Evento: cliente creado",
    integrations: ["Gmail"],
  },
  {
    id: "birthday-reminder",
    name: "Feliz cumpleaños",
    description: "Todos los días a las 8am revisa si algún cliente cumple años y le envía un email de felicitación.",
    category: "MARKETING",
    trigger: "Cron: diario 8:00 UTC",
    integrations: ["Gmail"],
  },
  {
    id: "reactivation-reminder",
    name: "Reactivación de inactivos",
    description: "Detecta clientes sin interacción en los últimos 60 días y les envía un email personalizado para reactivarlos.",
    category: "MARKETING",
    trigger: "Cron: diario 9:00 UTC",
    integrations: ["Gmail"],
  },
]

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  // Fetch execution stats per automation type
  const { data: executions } = await supabaseAdmin
    .from("automation_executions")
    .select("automation_type, status, created_at")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })

  // Group stats per automation
  const automations = AUTOMATION_DEFINITIONS.map((def) => {
    const typeExecs = (executions ?? []).filter((e) => e.automation_type === def.id)
    const total = typeExecs.length
    const successCount = typeExecs.filter((e) => e.status === "success").length
    const failedCount = typeExecs.filter((e) => e.status === "failed").length
    const lastExec = typeExecs[0] ?? null

    return {
      ...def,
      isActive: true, // All registered automations are active
      executionCount: total,
      successRate: total > 0 ? Math.round((successCount / total) * 100) : 0,
      failedCount,
      lastExecution: lastExec?.created_at ?? null,
      lastExecutionStatus: lastExec?.status ?? null,
    }
  })

  // Global stats
  const totalExecutions = (executions ?? []).length
  const totalSuccess = (executions ?? []).filter((e) => e.status === "success").length
  const globalSuccessRate = totalExecutions > 0 ? Math.round((totalSuccess / totalExecutions) * 100) : 0

  return NextResponse.json({
    automations,
    stats: {
      totalExecutions,
      globalSuccessRate,
      activeCount: automations.filter((a) => a.isActive).length,
      withErrors: automations.filter((a) => a.lastExecutionStatus === "failed").length,
    },
  })
}
