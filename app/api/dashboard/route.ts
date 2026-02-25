import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  const tenantId = user.id

  // Fetch all stats in parallel
  const [customersRes, appointmentsRes, executionsRes, recentExecsRes] = await Promise.all([
    supabaseAdmin
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId),
    supabaseAdmin
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("date", new Date().toISOString().split("T")[0]),
    supabaseAdmin
      .from("automation_executions")
      .select("status")
      .eq("tenant_id", tenantId),
    supabaseAdmin
      .from("automation_executions")
      .select("automation_type, status, trigger, created_at, duration_ms")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  const totalCustomers = customersRes.count ?? 0
  const upcomingAppointments = appointmentsRes.count ?? 0

  const allExecs = executionsRes.data ?? []
  const totalExecutions = allExecs.length
  const successExecs = allExecs.filter((e) => e.status === "success").length
  const successRate = totalExecutions > 0 ? Math.round((successExecs / totalExecutions) * 100) : 0

  const recentExecutions = (recentExecsRes.data ?? []).map((e) => ({
    automationType: e.automation_type,
    status: e.status,
    trigger: e.trigger,
    createdAt: e.created_at,
    durationMs: e.duration_ms,
  }))

  return NextResponse.json({
    totalCustomers,
    upcomingAppointments,
    totalExecutions,
    successRate,
    recentExecutions,
  })
}
