import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

// GET: List campaigns with aggregated stats for the current tenant
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const platform = searchParams.get("platform") // optional filter
  const status = searchParams.get("status") // optional filter
  const days = Number(searchParams.get("days") ?? "7")

  // Fetch campaigns with ad_account info
  let query = supabaseAdmin
    .from("ad_campaigns")
    .select("*, ad_account:ad_accounts!inner(platform, account_name)")
    .eq("tenant_id", user.id)

  if (platform) {
    query = query.eq("ad_account.platform", platform)
  }
  if (status) {
    query = query.eq("status", status)
  }

  const { data: campaigns, error: dbError } = await query.order("name")

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({ campaigns: [], totals: { cost: 0, conversions: 0, conversionValue: 0, roas: 0 } })
  }

  // Get aggregated stats for last N days
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - days)
  const dateStr = dateFrom.toISOString().split("T")[0]

  const campaignIds = campaigns.map((c) => c.id)

  const { data: statsRaw } = await supabaseAdmin
    .from("ad_campaign_daily_stats")
    .select("campaign_id, cost, conversions, conversion_value, impressions, clicks")
    .eq("tenant_id", user.id)
    .in("campaign_id", campaignIds)
    .gte("date", dateStr)

  // Aggregate stats per campaign
  const statsMap = new Map<string, { cost: number; conversions: number; conversionValue: number; impressions: number; clicks: number }>()

  for (const s of statsRaw ?? []) {
    const existing = statsMap.get(s.campaign_id) ?? { cost: 0, conversions: 0, conversionValue: 0, impressions: 0, clicks: 0 }
    existing.cost += Number(s.cost)
    existing.conversions += Number(s.conversions)
    existing.conversionValue += Number(s.conversion_value)
    existing.impressions += Number(s.impressions)
    existing.clicks += Number(s.clicks)
    statsMap.set(s.campaign_id, existing)
  }

  // Enrich campaigns with stats
  const enriched = campaigns.map((c) => {
    const stats = statsMap.get(c.id)
    return {
      ...c,
      stats_period: {
        days,
        cost: stats?.cost ?? 0,
        conversions: stats?.conversions ?? 0,
        conversion_value: stats?.conversionValue ?? 0,
        impressions: stats?.impressions ?? 0,
        clicks: stats?.clicks ?? 0,
        roas: stats && stats.cost > 0 ? Math.round((stats.conversionValue / stats.cost) * 100) / 100 : 0,
        ctr: stats && stats.impressions > 0 ? Math.round((stats.clicks / stats.impressions) * 10000) / 100 : 0,
        cpc: stats && stats.clicks > 0 ? Math.round((stats.cost / stats.clicks) * 100) / 100 : 0,
      },
    }
  })

  // Totals
  let totalCost = 0, totalConversions = 0, totalConversionValue = 0
  statsMap.forEach((s) => {
    totalCost += s.cost
    totalConversions += s.conversions
    totalConversionValue += s.conversionValue
  })

  return NextResponse.json({
    campaigns: enriched,
    totals: {
      cost: Math.round(totalCost * 100) / 100,
      conversions: Math.round(totalConversions * 10) / 10,
      conversionValue: Math.round(totalConversionValue * 100) / 100,
      roas: totalCost > 0 ? Math.round((totalConversionValue / totalCost) * 100) / 100 : 0,
    },
  })
}
