import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"
import type { CustomerSegment } from "@/lib/types"

const ALL_SEGMENTS: CustomerSegment[] = ["champion", "loyal", "at_risk", "dormant", "new", "lost", "unknown"]

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  // Segment distribution
  const { data: customers } = await supabaseAdmin
    .from("customers")
    .select("id, segment")
    .eq("tenant_id", user.id)

  const segments: Record<CustomerSegment, number> = {
    champion: 0, loyal: 0, at_risk: 0, dormant: 0, new: 0, lost: 0, unknown: 0,
  }

  for (const c of customers ?? []) {
    const seg = (c.segment || "unknown") as CustomerSegment
    if (ALL_SEGMENTS.includes(seg)) {
      segments[seg]++
    } else {
      segments.unknown++
    }
  }

  const totalCustomers = customers?.length ?? 0

  // Active alerts (pending, top 5)
  const { data: alerts } = await supabaseAdmin
    .from("customer_alerts")
    .select("*, customer:customers(id, name, email, segment)")
    .eq("tenant_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(5)

  // Churn/retention rates
  const atRiskAndLost = segments.at_risk + segments.lost + segments.dormant
  const churnRate = totalCustomers > 0
    ? Math.round((atRiskAndLost / totalCustomers) * 100)
    : 0
  const retentionRate = 100 - churnRate

  return NextResponse.json({
    segments,
    alerts: alerts ?? [],
    churnRate,
    retentionRate,
    totalCustomers,
  })
}
