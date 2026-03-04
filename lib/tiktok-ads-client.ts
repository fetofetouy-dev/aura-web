/**
 * TikTok Marketing API client (v1.3)
 *
 * TikTok uses Access-Token header (not Bearer).
 * Base URL: https://business-api.tiktok.com/open_api/v1.3
 * OAuth: custom flow via TikTok for Business portal
 */

const TIKTOK_API_BASE = "https://business-api.tiktok.com/open_api/v1.3"

function getHeaders(accessToken: string) {
  return {
    "Access-Token": accessToken,
    "Content-Type": "application/json",
  }
}

interface TikTokAdAccount {
  id: string
  name: string
  currency: string
  timezone: string
}

/**
 * Get advertiser info for connected accounts.
 */
export async function getTikTokAdAccounts(
  accessToken: string,
  advertiserIds: string[]
): Promise<TikTokAdAccount[]> {
  const res = await fetch(
    `${TIKTOK_API_BASE}/advertiser/info/?` +
    `advertiser_ids=${JSON.stringify(advertiserIds)}&fields=["name","currency","timezone"]`,
    { headers: getHeaders(accessToken) }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`TikTok getAdAccounts failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.data?.list ?? []).map((a: any) => ({
    id: String(a.advertiser_id),
    name: a.name ?? `Account ${a.advertiser_id}`,
    currency: a.currency ?? "USD",
    timezone: a.timezone ?? "America/Argentina/Buenos_Aires",
  }))
}

interface TikTokCampaign {
  id: string
  name: string
  status: string
  type: string
  dailyBudget: number | null
}

/**
 * List campaigns for a TikTok advertiser.
 */
export async function getTikTokCampaigns(
  accessToken: string,
  advertiserId: string
): Promise<TikTokCampaign[]> {
  const res = await fetch(
    `${TIKTOK_API_BASE}/campaign/get/?` +
    `advertiser_id=${advertiserId}` +
    `&fields=["campaign_id","campaign_name","operation_status","objective_type","budget"]`,
    { headers: getHeaders(accessToken) }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`TikTok getCampaigns failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.data?.list ?? []).map((c: any) => ({
    id: String(c.campaign_id),
    name: c.campaign_name,
    status: mapTikTokStatus(c.operation_status),
    type: mapTikTokObjective(c.objective_type),
    dailyBudget: c.budget > 0 ? c.budget : null,
  }))
}

interface TikTokDailyStats {
  campaignId: string
  date: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversionValue: number
}

/**
 * Get daily stats for campaigns via the integrated report endpoint.
 */
export async function getTikTokCampaignStats(
  accessToken: string,
  advertiserId: string,
  campaignIds: string[],
  dateFrom: string,
  dateTo: string
): Promise<TikTokDailyStats[]> {
  const body = {
    advertiser_id: advertiserId,
    report_type: "BASIC",
    dimensions: ["campaign_id", "stat_time_day"],
    data_level: "AUCTION_CAMPAIGN",
    start_date: dateFrom,
    end_date: dateTo,
    metrics: [
      "spend",
      "impressions",
      "clicks",
      "conversion",
      "total_complete_payment_rate",
    ],
    filters: [
      {
        field_name: "campaign_ids",
        filter_type: "IN",
        filter_value: JSON.stringify(campaignIds),
      },
    ],
    page_size: 1000,
  }

  const res = await fetch(`${TIKTOK_API_BASE}/report/integrated/get/`, {
    method: "POST",
    headers: getHeaders(accessToken),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`TikTok getCampaignStats failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(`TikTok API error: ${data.message}`)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.data?.list ?? []).map((row: any) => ({
    campaignId: String(row.dimensions?.campaign_id),
    date: (row.dimensions?.stat_time_day ?? "").split(" ")[0], // "2026-03-01 00:00:00" → "2026-03-01"
    impressions: Number(row.metrics?.impressions ?? 0),
    clicks: Number(row.metrics?.clicks ?? 0),
    cost: Number(row.metrics?.spend ?? 0),
    conversions: Number(row.metrics?.conversion ?? 0),
    conversionValue: Number(row.metrics?.total_complete_payment_rate ?? 0),
  }))
}

/**
 * Exchange an authorization code for an access token.
 */
export async function exchangeTikTokCode(
  code: string
): Promise<{ accessToken: string; advertiserIds: string[] }> {
  const res = await fetch(`${TIKTOK_API_BASE}/oauth2/access_token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: process.env.TIKTOK_APP_ID,
      secret: process.env.TIKTOK_APP_SECRET,
      auth_code: code,
    }),
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`TikTok code exchange failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(`TikTok OAuth error: ${data.message}`)
  }

  return {
    accessToken: data.data.access_token,
    advertiserIds: (data.data.advertiser_ids ?? []).map(String),
  }
}

function mapTikTokStatus(status: string): string {
  const map: Record<string, string> = {
    ENABLE: "enabled",
    DISABLE: "paused",
    DELETE: "removed",
  }
  return map[status] ?? "unknown"
}

function mapTikTokObjective(objective: string | undefined): string {
  if (!objective) return "unknown"
  const map: Record<string, string> = {
    CONVERSIONS: "conversions",
    CATALOG_SALES: "shopping",
    TRAFFIC: "traffic",
    REACH: "awareness",
    VIDEO_VIEWS: "video",
    LEAD_GENERATION: "conversions",
    APP_PROMOTION: "app_promotion",
  }
  return map[objective] ?? objective.toLowerCase()
}
