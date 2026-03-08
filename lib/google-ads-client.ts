/**
 * Google Ads API client (REST, not gRPC)
 *
 * Uses Google Ads REST API v17 with GAQL (Google Ads Query Language).
 * Requires:
 * - GOOGLE_ADS_DEVELOPER_TOKEN env var (from Google Ads manager account)
 * - OAuth access token with scope: https://www.googleapis.com/auth/adwords
 * - Token refresh: reuses refreshAccessToken() from lib/google-client.ts
 */

const GOOGLE_ADS_API_BASE = "https://googleads.googleapis.com/v17"

function getHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    "Content-Type": "application/json",
  }
}

/**
 * List all Google Ads customer IDs accessible with the given token.
 * Used during account connection to let user pick which account to import.
 */
export async function listAccessibleCustomers(
  accessToken: string
): Promise<string[]> {
  const res = await fetch(
    `${GOOGLE_ADS_API_BASE}/customers:listAccessibleCustomers`,
    { headers: getHeaders(accessToken) }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Google Ads listAccessibleCustomers failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  // Returns resourceNames like "customers/1234567890"
  return (data.resourceNames ?? []).map((name: string) =>
    name.replace("customers/", "")
  )
}

/**
 * Get account display name for a customer ID.
 */
export async function getCustomerInfo(
  accessToken: string,
  customerId: string
): Promise<{ id: string; name: string; currency: string; timezone: string }> {
  const cleanId = customerId.replace(/-/g, "")

  const res = await fetch(
    `${GOOGLE_ADS_API_BASE}/customers/${cleanId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: getHeaders(accessToken),
      body: JSON.stringify({
        query: `SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone FROM customer LIMIT 1`,
      }),
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Google Ads getCustomerInfo failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  const customer = data[0]?.results?.[0]?.customer
  return {
    id: customer?.id ?? cleanId,
    name: customer?.descriptiveName ?? `Account ${cleanId}`,
    currency: customer?.currencyCode ?? "USD",
    timezone: customer?.timeZone ?? "America/Argentina/Buenos_Aires",
  }
}

interface GoogleAdsCampaign {
  id: string
  name: string
  status: string
  type: string
  dailyBudget: number | null
  targetRoas: number | null
}

/**
 * List active campaigns for a Google Ads customer.
 */
export async function listCampaigns(
  accessToken: string,
  customerId: string
): Promise<GoogleAdsCampaign[]> {
  const cleanId = customerId.replace(/-/g, "")

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      campaign.target_roas.target_roas
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY campaign.name
  `

  const res = await fetch(
    `${GOOGLE_ADS_API_BASE}/customers/${cleanId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: getHeaders(accessToken),
      body: JSON.stringify({ query }),
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Google Ads listCampaigns failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  const results = data[0]?.results ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return results.map((r: any) => {
    const c = r.campaign
    const budgetMicros = r.campaignBudget?.amountMicros
    return {
      id: String(c.id),
      name: c.name,
      status: mapGoogleStatus(c.status),
      type: mapGoogleType(c.advertisingChannelType),
      dailyBudget: budgetMicros ? Number(budgetMicros) / 1_000_000 : null,
      targetRoas: c.targetRoas?.targetRoas ?? null,
    }
  })
}

interface GoogleAdsDailyStats {
  campaignId: string
  date: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversionValue: number
}

/**
 * Get daily performance stats for all campaigns.
 */
export async function getCampaignDailyStats(
  accessToken: string,
  customerId: string,
  dateFrom: string,
  dateTo: string
): Promise<GoogleAdsDailyStats[]> {
  const cleanId = customerId.replace(/-/g, "")

  // Validate date format to prevent GAQL injection
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateFrom) || !dateRegex.test(dateTo)) {
    throw new Error("Invalid date format — expected YYYY-MM-DD")
  }

  const query = `
    SELECT
      campaign.id,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
      AND campaign.status != 'REMOVED'
    ORDER BY segments.date DESC
  `

  const res = await fetch(
    `${GOOGLE_ADS_API_BASE}/customers/${cleanId}/googleAds:searchStream`,
    {
      method: "POST",
      headers: getHeaders(accessToken),
      body: JSON.stringify({ query }),
    }
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Google Ads getCampaignDailyStats failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  const results = data[0]?.results ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return results.map((r: any) => ({
    campaignId: String(r.campaign.id),
    date: r.segments.date,
    impressions: Number(r.metrics.impressions ?? 0),
    clicks: Number(r.metrics.clicks ?? 0),
    cost: Number(r.metrics.costMicros ?? 0) / 1_000_000,
    conversions: Number(r.metrics.conversions ?? 0),
    conversionValue: Number(r.metrics.conversionsValue ?? 0),
  }))
}

function mapGoogleStatus(status: string): string {
  const map: Record<string, string> = {
    ENABLED: "enabled",
    PAUSED: "paused",
    REMOVED: "removed",
  }
  return map[status] ?? "unknown"
}

function mapGoogleType(type: string): string {
  const map: Record<string, string> = {
    SEARCH: "search",
    DISPLAY: "display",
    SHOPPING: "shopping",
    VIDEO: "video",
    PERFORMANCE_MAX: "performance_max",
    MULTI_CHANNEL: "multi_channel",
  }
  return map[type] ?? type?.toLowerCase() ?? "unknown"
}
