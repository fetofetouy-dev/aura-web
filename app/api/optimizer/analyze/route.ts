import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

const OPTIMIZER_URL = process.env.OPTIMIZER_SERVICE_URL || "http://localhost:8000"

// POST: Analyze campaigns — proxy to Python /analyze endpoint
export async function POST(request: Request) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body = await request.json().catch(() => ({}))

  // Fetch active campaigns + last 60 days of stats
  const dateFrom = new Date()
  dateFrom.setDate(dateFrom.getDate() - 60)
  const dateFromStr = dateFrom.toISOString().split("T")[0]

  const { data: campaigns } = await supabaseAdmin
    .from("ad_campaigns")
    .select("*, ad_account:ad_accounts!inner(platform)")
    .eq("tenant_id", user.id)
    .eq("status", "enabled")

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json(
      { error: "No hay campañas activas para analizar" },
      { status: 400 }
    )
  }

  const campaignIds = campaigns.map((c) => c.id)
  const { data: stats } = await supabaseAdmin
    .from("ad_campaign_daily_stats")
    .select("*")
    .eq("tenant_id", user.id)
    .in("campaign_id", campaignIds)
    .gte("date", dateFromStr)
    .order("date", { ascending: true })

  // Group stats by campaign
  const allStats = stats ?? []
  const statsByCampaign: Record<string, typeof allStats> = {}
  for (const s of allStats) {
    if (!statsByCampaign[s.campaign_id]) {
      statsByCampaign[s.campaign_id] = []
    }
    statsByCampaign[s.campaign_id].push(s)
  }

  // Build request for Python service
  const analyzeRequest = {
    campaigns: campaigns
      .filter((c) => (statsByCampaign[c.id]?.length ?? 0) > 0)
      .map((c) => ({
        campaign_id: c.id,
        campaign_name: c.name,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        platform: (c.ad_account as any).platform as string,
        daily_data: (statsByCampaign[c.id] ?? []).map((s) => ({
          date: s.date,
          cost: Number(s.cost),
          conversions: Number(s.conversions),
          conversion_value: Number(s.conversion_value),
          impressions: Number(s.impressions),
          clicks: Number(s.clicks),
          target_roas: c.target_roas ? Number(c.target_roas) : null,
          campaign_budget: c.daily_budget ? Number(c.daily_budget) : null,
        })),
      })),
    config: {
      total_budget: 0, // Not used for /analyze but required by schema
      objective: "conversion_value" as const,
      dataset_length: 60,
      minimum_dates: 15,
      max_change_pct: 0.35,
      budget_min_pct: 0.1,
      budget_max_pct: 3.0,
      error_dist: "student" as const,
      sampling_method: "MEDIAN" as const,
      harmonics: 2,
      trend_days: 15,
      lags: [1, 2, 7],
      exclude_dates: [],
    },
    budget_range: body.budget_range ?? null,
  }

  try {
    const response = await fetch(`${OPTIMIZER_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(analyzeRequest),
      signal: AbortSignal.timeout(60_000),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json(
        { error: `Error del servicio de análisis: ${text}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      return NextResponse.json(
        { error: "Timeout al analizar campañas" },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { error: "Error al conectar con el servicio de análisis" },
      { status: 502 }
    )
  }
}
