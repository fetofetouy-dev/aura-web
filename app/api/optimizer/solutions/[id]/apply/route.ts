import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

// POST: Apply an optimization solution (update campaign budgets in DB)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id: solutionId } = await params

  // Fetch the solution and verify ownership
  const { data: solution, error: fetchError } = await supabaseAdmin
    .from("optimization_solutions")
    .select("*")
    .eq("id", solutionId)
    .eq("tenant_id", user.id)
    .single()

  if (fetchError || !solution) {
    return NextResponse.json({ error: "Solución no encontrada" }, { status: 404 })
  }

  if (solution.is_applied) {
    return NextResponse.json({ error: "Esta solución ya fue aplicada" }, { status: 400 })
  }

  // Parse allocations and update campaign budgets
  const allocations = solution.allocations as Array<{
    campaign_id: string
    recommended_budget: number
  }>

  for (const allocation of allocations) {
    await supabaseAdmin
      .from("ad_campaigns")
      .update({ daily_budget: allocation.recommended_budget })
      .eq("id", allocation.campaign_id)
      .eq("tenant_id", user.id)
  }

  // Mark solution as applied
  const appliedAt = new Date().toISOString()
  await supabaseAdmin
    .from("optimization_solutions")
    .update({
      is_applied: true,
      applied_at: appliedAt,
    })
    .eq("id", solutionId)

  return NextResponse.json({ applied: true, appliedAt })
}
