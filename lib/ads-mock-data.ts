/**
 * Mock data for ad campaigns — used when ADS_USE_MOCK_DATA=true.
 * Allows full UI and sync flow testing without real API credentials.
 */

import type { AdPlatform } from "./types"

export function isMockMode(): boolean {
  return process.env.ADS_USE_MOCK_DATA === "true"
}

interface MockCampaign {
  platformCampaignId: string
  name: string
  platform: AdPlatform
  status: "enabled" | "paused"
  campaignType: string
  dailyBudget: number
  targetRoas: number | null
}

const MOCK_CAMPAIGNS: MockCampaign[] = [
  // Google Ads
  { platformCampaignId: "gads_001", name: "Search - Marca", platform: "google_ads", status: "enabled", campaignType: "search", dailyBudget: 5000, targetRoas: 4.5 },
  { platformCampaignId: "gads_002", name: "Search - Competencia", platform: "google_ads", status: "enabled", campaignType: "search", dailyBudget: 3000, targetRoas: 3.0 },
  { platformCampaignId: "gads_003", name: "Shopping - Productos", platform: "google_ads", status: "enabled", campaignType: "shopping", dailyBudget: 8000, targetRoas: 5.0 },
  { platformCampaignId: "gads_004", name: "Display - Retargeting", platform: "google_ads", status: "enabled", campaignType: "display", dailyBudget: 2000, targetRoas: 6.0 },
  { platformCampaignId: "gads_005", name: "Performance Max - General", platform: "google_ads", status: "paused", campaignType: "performance_max", dailyBudget: 4000, targetRoas: 3.5 },
  // Meta Ads
  { platformCampaignId: "meta_001", name: "Conversiones - Catálogo", platform: "meta_ads", status: "enabled", campaignType: "conversions", dailyBudget: 6000, targetRoas: null },
  { platformCampaignId: "meta_002", name: "Tráfico - Blog", platform: "meta_ads", status: "enabled", campaignType: "traffic", dailyBudget: 1500, targetRoas: null },
  { platformCampaignId: "meta_003", name: "Retargeting - Carrito", platform: "meta_ads", status: "enabled", campaignType: "conversions", dailyBudget: 3500, targetRoas: null },
  { platformCampaignId: "meta_004", name: "Lookalike - Compradores", platform: "meta_ads", status: "paused", campaignType: "conversions", dailyBudget: 4000, targetRoas: null },
  // TikTok Ads
  { platformCampaignId: "tiktok_001", name: "Conversiones - Producto estrella", platform: "tiktok_ads", status: "enabled", campaignType: "conversions", dailyBudget: 3000, targetRoas: null },
  { platformCampaignId: "tiktok_002", name: "Tráfico - Landing", platform: "tiktok_ads", status: "enabled", campaignType: "traffic", dailyBudget: 2000, targetRoas: null },
]

export function getMockCampaigns(platform?: AdPlatform): MockCampaign[] {
  if (platform) return MOCK_CAMPAIGNS.filter((c) => c.platform === platform)
  return MOCK_CAMPAIGNS
}

interface MockDailyStats {
  campaignId: string
  date: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversionValue: number
}

/**
 * Generate realistic daily stats with natural variance.
 * Uses seeded randomness based on campaignId + date for deterministic results.
 */
export function generateMockDailyStats(
  campaignId: string,
  campaign: MockCampaign,
  days: number = 60
): MockDailyStats[] {
  const stats: MockDailyStats[] = []
  const today = new Date()

  // Base metrics vary by campaign type and budget
  const baseCTR = campaign.campaignType === "search" ? 0.08 : campaign.campaignType === "shopping" ? 0.04 : 0.02
  const baseCVR = campaign.campaignType === "search" ? 0.05 : campaign.campaignType === "conversions" ? 0.03 : 0.01
  const avgOrderValue = 2500 + seededRandom(campaignId, 0) * 5000

  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    // Add natural variance: weekday effect + random noise
    const dayOfWeek = date.getDay()
    const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.7 : 1.0 + (dayOfWeek === 3 ? 0.1 : 0)
    const noise = 0.8 + seededRandom(campaignId, i) * 0.4 // 0.8-1.2x

    const dailySpend = campaign.dailyBudget * weekdayMultiplier * noise * (campaign.status === "paused" ? 0 : 1)
    const impressions = Math.round((dailySpend / 0.05) * noise) // ~$0.05 CPM rough estimate
    const clicks = Math.round(impressions * baseCTR * noise)
    const conversions = Math.round(clicks * baseCVR * noise * 10) / 10
    const conversionValue = Math.round(conversions * avgOrderValue * noise)

    stats.push({
      campaignId,
      date: dateStr,
      impressions,
      clicks,
      cost: Math.round(dailySpend * 100) / 100,
      conversions,
      conversionValue,
    })
  }

  return stats
}

/**
 * Get all mock data: campaigns + their stats.
 * Used by the Inngest sync function in mock mode.
 */
export function getAllMockData(platform: AdPlatform) {
  const campaigns = getMockCampaigns(platform)
  return campaigns.map((campaign) => ({
    campaign,
    stats: generateMockDailyStats(campaign.platformCampaignId, campaign),
  }))
}

export const MOCK_ACCOUNTS = {
  google_ads: {
    platformAccountId: "123-456-7890",
    accountName: "Mi Negocio - Google Ads",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
  },
  meta_ads: {
    platformAccountId: "act_1234567890",
    accountName: "Mi Negocio - Meta Ads",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
  },
  tiktok_ads: {
    platformAccountId: "7890123456",
    accountName: "Mi Negocio - TikTok Ads",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
  },
} as const

/**
 * Simple seeded random for deterministic mock data.
 */
function seededRandom(seed: string, index: number): number {
  let hash = 0
  const str = `${seed}-${index}`
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(Math.sin(hash)) // 0-1
}
