import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

// GET: Elasticity (w₁) and R² history per campaign across optimization runs
export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  // Fetch completed runs with their solutions (last 20 runs)
  const { data: runs, error: dbError } = await supabaseAdmin
    .from("optimization_runs")
    .select("id, started_at, solutions:optimization_solutions(strategy, allocations)")
    .eq("tenant_id", user.id)
    .eq("status", "completed")
    .order("started_at", { ascending: true })
    .limit(20)

  if (dbError) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }

  if (!runs || runs.length === 0) {
    return NextResponse.json({ campaigns: [] })
  }

  // Extract elasticity data from moderate solutions (most representative)
  // Fallback to conservative, then aggressive
  const campaignHistory: Record<
    string,
    {
      campaign_id: string
      campaign_name: string
      points: Array<{ date: string; w1: number; r_squared: number }>
    }
  > = {}

  for (const run of runs) {
    const solutions = (run.solutions ?? []) as Array<{
      strategy: string
      allocations: Array<{
        campaign_id: string
        campaign_name: string
        elasticity?: number
        r_squared?: number
      }>
    }>

    // Pick best solution for parameters (moderate > conservative > aggressive)
    const solution =
      solutions.find((s) => s.strategy === "moderate") ??
      solutions.find((s) => s.strategy === "conservative") ??
      solutions[0]

    if (!solution?.allocations) continue

    for (const alloc of solution.allocations) {
      if (alloc.elasticity == null) continue

      if (!campaignHistory[alloc.campaign_id]) {
        campaignHistory[alloc.campaign_id] = {
          campaign_id: alloc.campaign_id,
          campaign_name: alloc.campaign_name,
          points: [],
        }
      }

      campaignHistory[alloc.campaign_id].points.push({
        date: run.started_at,
        w1: alloc.elasticity,
        r_squared: alloc.r_squared ?? 0,
      })
    }
  }

  return NextResponse.json({
    campaigns: Object.values(campaignHistory).filter((c) => c.points.length > 0),
  })
}
