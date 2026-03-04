/**
 * Meta (Facebook/Instagram) Marketing API client
 *
 * REST API v19.0. Access token passed as query param or header.
 * OAuth: custom flow (not Supabase OAuth) → Facebook Login → exchange code → long-lived token
 */

const META_API_BASE = "https://graph.facebook.com/v19.0"

interface MetaAdAccount {
  id: string           // "act_XXXXX"
  name: string
  currency: string
  timezone: string
}

/**
 * List ad accounts accessible with the given token.
 */
export async function getMetaAdAccounts(
  accessToken: string
): Promise<MetaAdAccount[]> {
  const res = await fetch(
    `${META_API_BASE}/me/adaccounts?fields=id,name,currency,timezone_name&access_token=${accessToken}`
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Meta getAdAccounts failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.data ?? []).map((a: any) => ({
    id: a.id,
    name: a.name ?? `Account ${a.id}`,
    currency: a.currency ?? "USD",
    timezone: a.timezone_name ?? "America/Argentina/Buenos_Aires",
  }))
}

interface MetaCampaign {
  id: string
  name: string
  status: string
  type: string
  dailyBudget: number | null
}

/**
 * List campaigns for a Meta ad account.
 */
export async function getMetaCampaigns(
  accessToken: string,
  adAccountId: string
): Promise<MetaCampaign[]> {
  const res = await fetch(
    `${META_API_BASE}/${adAccountId}/campaigns?fields=id,name,status,daily_budget,objective&access_token=${accessToken}`
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Meta getCampaigns failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.data ?? []).map((c: any) => ({
    id: c.id,
    name: c.name,
    status: mapMetaStatus(c.status),
    type: mapMetaObjective(c.objective),
    dailyBudget: c.daily_budget ? Number(c.daily_budget) / 100 : null, // Meta returns cents
  }))
}

interface MetaDailyStats {
  campaignId: string
  date: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversionValue: number
}

/**
 * Get daily insights for a specific campaign.
 */
export async function getMetaCampaignInsights(
  accessToken: string,
  campaignId: string,
  dateFrom: string,
  dateTo: string
): Promise<MetaDailyStats[]> {
  const timeRange = JSON.stringify({ since: dateFrom, until: dateTo })
  const res = await fetch(
    `${META_API_BASE}/${campaignId}/insights?` +
    `fields=impressions,clicks,spend,actions,action_values` +
    `&time_range=${encodeURIComponent(timeRange)}` +
    `&time_increment=1` +
    `&access_token=${accessToken}`
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Meta getCampaignInsights failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.data ?? []).map((day: any) => ({
    campaignId,
    date: day.date_start,
    impressions: Number(day.impressions ?? 0),
    clicks: Number(day.clicks ?? 0),
    cost: Number(day.spend ?? 0),
    conversions: extractMetaConversions(day.actions),
    conversionValue: extractMetaConversionValue(day.action_values),
  }))
}

/**
 * Exchange an authorization code for an access token.
 */
export async function exchangeMetaCode(
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch(
    `${META_API_BASE}/oauth/access_token?` +
    `client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code=${code}`
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Meta code exchange failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  return { accessToken: data.access_token, expiresIn: data.expires_in ?? 3600 }
}

/**
 * Exchange short-lived token for a long-lived token (60 days).
 */
export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch(
    `${META_API_BASE}/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&fb_exchange_token=${shortLivedToken}`
  )

  if (!res.ok) {
    const error = await res.json()
    throw new Error(`Meta long-lived token exchange failed: ${JSON.stringify(error)}`)
  }

  const data = await res.json()
  return { accessToken: data.access_token, expiresIn: data.expires_in ?? 5184000 }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMetaConversions(actions: any[] | undefined): number {
  if (!actions) return 0
  const purchase = actions.find(
    (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
  )
  if (purchase) return Number(purchase.value ?? 0)
  // Fallback: sum all conversion-type actions
  const conversionTypes = ["lead", "complete_registration", "purchase", "add_to_cart"]
  return actions
    .filter((a) => conversionTypes.includes(a.action_type))
    .reduce((sum, a) => sum + Number(a.value ?? 0), 0)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractMetaConversionValue(actionValues: any[] | undefined): number {
  if (!actionValues) return 0
  const purchase = actionValues.find(
    (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
  )
  return purchase ? Number(purchase.value ?? 0) : 0
}

function mapMetaStatus(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "enabled",
    PAUSED: "paused",
    DELETED: "removed",
    ARCHIVED: "removed",
  }
  return map[status] ?? "unknown"
}

function mapMetaObjective(objective: string | undefined): string {
  if (!objective) return "unknown"
  const map: Record<string, string> = {
    OUTCOME_SALES: "conversions",
    OUTCOME_LEADS: "conversions",
    OUTCOME_TRAFFIC: "traffic",
    OUTCOME_AWARENESS: "awareness",
    OUTCOME_ENGAGEMENT: "engagement",
    CONVERSIONS: "conversions",
    LINK_CLICKS: "traffic",
    BRAND_AWARENESS: "awareness",
  }
  return map[objective] ?? objective.toLowerCase()
}
