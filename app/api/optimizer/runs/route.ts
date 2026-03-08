import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"
import { inngest } from "@/lib/inngest"
import { rateLimit } from "@/lib/rate-limit"

// GET: List optimization runs with their solutions
export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  const { data: runs, error: dbError } = await supabaseAdmin
    .from("optimization_runs")
    .select("*, solutions:optimization_solutions(*)")
    .eq("tenant_id", user.id)
    .order("started_at", { ascending: false })
    .limit(20)

  if (dbError) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }

  return NextResponse.json({ runs: runs ?? [] })
}

// POST: Trigger a new optimization run via Inngest
export async function POST(request: Request) {
  const { user, error } = await requireAuth()
  if (error) return error

  const limited = rateLimit(`optimizer-run:${user.id}`, 3, 120_000)
  if (limited) return limited

  const body = await request.json().catch(() => ({}))

  // Validate there are active campaigns to optimize
  const { count } = await supabaseAdmin
    .from("ad_campaigns")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", user.id)
    .eq("status", "enabled")

  if (!count || count === 0) {
    return NextResponse.json(
      { error: "No hay campañas activas para optimizar. Conectá y sincronizá tus cuentas de ads primero." },
      { status: 400 }
    )
  }

  await inngest.send({
    name: "optimizer/run.requested",
    data: {
      tenantId: user.id,
      totalBudget: body.totalBudget ?? undefined,
      objective: body.objective ?? "conversion_value",
    },
  })

  return NextResponse.json({ triggered: true, message: "Optimización en cola" })
}
