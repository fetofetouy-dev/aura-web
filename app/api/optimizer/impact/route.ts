import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

// GET: Compare pre/post optimization metrics for the last applied solution
export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  // Find the last applied solution
  const { data: solution } = await supabaseAdmin
    .from("optimization_solutions")
    .select("*")
    .eq("tenant_id", user.id)
    .eq("is_applied", true)
    .order("applied_at", { ascending: false })
    .limit(1)
    .single()

  if (!solution || !solution.applied_at) {
    return NextResponse.json(
      { error: "No hay soluciones aplicadas para medir impacto" },
      { status: 404 }
    )
  }

  const appliedAt = new Date(solution.applied_at)
  const periodDays = 7

  // Calculate date ranges
  const beforeStart = new Date(appliedAt)
  beforeStart.setDate(beforeStart.getDate() - periodDays)
  const beforeEnd = new Date(appliedAt)
  beforeEnd.setDate(beforeEnd.getDate() - 1)

  const afterStart = new Date(appliedAt)
  const afterEnd = new Date(appliedAt)
  afterEnd.setDate(afterEnd.getDate() + periodDays - 1)

  // Check we have enough time elapsed
  const now = new Date()
  if (now < afterEnd) {
    const daysElapsed = Math.floor(
      (now.getTime() - appliedAt.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysElapsed < 3) {
      return NextResponse.json(
        {
          error: `Solo pasaron ${daysElapsed} días desde la aplicación. Se necesitan al menos 3 días para medir impacto.`,
          days_elapsed: daysElapsed,
          period_days: periodDays,
        },
        { status: 400 }
      )
    }
  }

  // Get campaign IDs from the solution allocations
  const allocations = solution.allocations as Array<{ campaign_id: string }>
  const campaignIds = allocations.map((a) => a.campaign_id)

  if (campaignIds.length === 0) {
    return NextResponse.json(
      { error: "La solución no tiene campañas asignadas" },
      { status: 400 }
    )
  }

  // Fetch stats for both periods
  const fmt = (d: Date) => d.toISOString().split("T")[0]

  const [{ data: beforeStats }, { data: afterStats }] = await Promise.all([
    supabaseAdmin
      .from("ad_campaign_daily_stats")
      .select("cost, conversions, conversion_value")
      .eq("tenant_id", user.id)
      .in("campaign_id", campaignIds)
      .gte("date", fmt(beforeStart))
      .lte("date", fmt(beforeEnd)),
    supabaseAdmin
      .from("ad_campaign_daily_stats")
      .select("cost, conversions, conversion_value")
      .eq("tenant_id", user.id)
      .in("campaign_id", campaignIds)
      .gte("date", fmt(afterStart))
      .lte("date", fmt(afterEnd)),
  ])

  // Aggregate
  function aggregate(
    rows: Array<{ cost: number; conversions: number; conversion_value: number }> | null
  ) {
    const r = rows ?? []
    const cost = r.reduce((s, row) => s + Number(row.cost), 0)
    const conversions = r.reduce((s, row) => s + Number(row.conversions), 0)
    const conversionValue = r.reduce(
      (s, row) => s + Number(row.conversion_value),
      0
    )
    const roas = cost > 0 ? conversionValue / cost : 0
    return { cost, conversions, roas }
  }

  const before = aggregate(beforeStats)
  const after = aggregate(afterStats)

  const deltaPct = {
    cost: before.cost > 0 ? (after.cost - before.cost) / before.cost : 0,
    conversions:
      before.conversions > 0
        ? (after.conversions - before.conversions) / before.conversions
        : 0,
    roas: before.roas > 0 ? (after.roas - before.roas) / before.roas : 0,
  }

  return NextResponse.json({
    solution_id: solution.id,
    strategy: solution.strategy,
    applied_at: solution.applied_at,
    period_days: periodDays,
    before,
    after,
    delta_pct: deltaPct,
  })
}
