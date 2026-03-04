import { inngest } from "@/lib/inngest"
import { supabaseAdmin } from "@/lib/supabase-server"
import { refreshAccessToken } from "@/lib/google-client"
import { listCampaigns as listGoogleCampaigns, getCampaignDailyStats as getGoogleStats } from "@/lib/google-ads-client"
import { getMetaCampaigns, getMetaCampaignInsights } from "@/lib/meta-ads-client"
import { getTikTokCampaigns, getTikTokCampaignStats } from "@/lib/tiktok-ads-client"
import { isMockMode, getAllMockData } from "@/lib/ads-mock-data"
import type { AdPlatform } from "@/lib/types"

/**
 * Cron: Sync all active ad accounts daily at 3am UTC (midnight Argentina).
 */
export const adsDataSyncFunction = inngest.createFunction(
  {
    id: "ads-data-sync",
    name: "Ads Data Sync — Sincronizar campañas publicitarias",
    retries: 1,
  },
  { cron: "0 3 * * *" },
  async ({ step }) => {
    const accounts = await step.run("fetch-active-ad-accounts", async () => {
      const { data } = await supabaseAdmin
        .from("ad_accounts")
        .select("*")
        .eq("is_active", true)
      return data ?? []
    })

    if (accounts.length === 0) {
      return { synced: 0, message: "No active ad accounts" }
    }

    let totalSynced = 0

    for (const account of accounts) {
      const result = await syncAccount(step, account)
      totalSynced += result.campaignsSynced
    }

    return { totalSynced, accountsProcessed: accounts.length }
  }
)

/**
 * Event-triggered: Sync a specific tenant's ad accounts on demand.
 */
export const adsManualSyncFunction = inngest.createFunction(
  {
    id: "ads-manual-sync",
    name: "Ads Manual Sync",
    retries: 0,
  },
  { event: "ads/sync.requested" },
  async ({ event, step }) => {
    const { tenantId, accountId } = event.data

    let query = supabaseAdmin
      .from("ad_accounts")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)

    if (accountId) {
      query = query.eq("id", accountId)
    }

    const accounts = await step.run("fetch-tenant-accounts", async () => {
      const { data } = await query
      return data ?? []
    })

    let totalSynced = 0

    for (const account of accounts) {
      const result = await syncAccount(step, account)
      totalSynced += result.campaignsSynced
    }

    return { totalSynced, accountsProcessed: accounts.length }
  }
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncAccount(step: any, account: any) {
  const syncLogId = await step.run(`create-sync-log-${account.id}`, async () => {
    const { data } = await supabaseAdmin
      .from("sync_logs")
      .insert({
        tenant_id: account.tenant_id,
        connector: `ads-${account.platform}`,
        status: "running",
      })
      .select("id")
      .single()
    return data?.id
  })

  try {
    let campaignsSynced = 0
    let statsSynced = 0

    if (isMockMode()) {
      // Use mock data
      const result = await step.run(`sync-mock-${account.id}`, async () => {
        return syncMockData(account)
      })
      campaignsSynced = result.campaigns
      statsSynced = result.stats
    } else {
      // Real API sync
      const result = await step.run(`sync-real-${account.id}`, async () => {
        return syncRealData(account)
      })
      campaignsSynced = result.campaigns
      statsSynced = result.stats
    }

    // Update sync log & last_synced_at
    await step.run(`complete-sync-${account.id}`, async () => {
      await supabaseAdmin
        .from("sync_logs")
        .update({
          status: "success",
          records_created: campaignsSynced,
          records_updated: statsSynced,
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncLogId)

      await supabaseAdmin
        .from("ad_accounts")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("id", account.id)
    })

    return { campaignsSynced }
  } catch (err) {
    await step.run(`fail-sync-${account.id}`, async () => {
      await supabaseAdmin
        .from("sync_logs")
        .update({
          status: "failed",
          error: err instanceof Error ? err.message : String(err),
          completed_at: new Date().toISOString(),
        })
        .eq("id", syncLogId)
    })
    return { campaignsSynced: 0 }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncMockData(account: any) {
  const platform = account.platform as AdPlatform
  const mockData = getAllMockData(platform)

  let campaignCount = 0
  let statsCount = 0

  for (const { campaign, stats } of mockData) {
    // Upsert campaign
    const { data: dbCampaign } = await supabaseAdmin
      .from("ad_campaigns")
      .upsert(
        {
          tenant_id: account.tenant_id,
          ad_account_id: account.id,
          platform_campaign_id: campaign.platformCampaignId,
          name: campaign.name,
          status: campaign.status,
          campaign_type: campaign.campaignType,
          daily_budget: campaign.dailyBudget,
          target_roas: campaign.targetRoas,
          currency: account.currency,
        },
        { onConflict: "tenant_id,ad_account_id,platform_campaign_id" }
      )
      .select("id")
      .single()

    if (!dbCampaign) continue
    campaignCount++

    // Upsert daily stats (last 7 days only)
    const recentStats = stats.slice(0, 7)
    for (const s of recentStats) {
      await supabaseAdmin
        .from("ad_campaign_daily_stats")
        .upsert(
          {
            tenant_id: account.tenant_id,
            campaign_id: dbCampaign.id,
            date: s.date,
            impressions: s.impressions,
            clicks: s.clicks,
            cost: s.cost,
            conversions: s.conversions,
            conversion_value: s.conversionValue,
          },
          { onConflict: "campaign_id,date" }
        )
      statsCount++
    }
  }

  return { campaigns: campaignCount, stats: statsCount }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncRealData(account: any) {
  const platform = account.platform as AdPlatform

  // Date range: last 7 days
  const dateTo = new Date()
  const dateFrom = new Date(dateTo)
  dateFrom.setDate(dateFrom.getDate() - 7)
  const dateFromStr = dateFrom.toISOString().split("T")[0]
  const dateToStr = dateTo.toISOString().split("T")[0]

  // Get access token
  const accessToken = await getAccessToken(account)

  let campaignCount = 0
  let statsCount = 0

  if (platform === "google_ads") {
    const campaigns = await listGoogleCampaigns(accessToken, account.platform_account_id)
    for (const c of campaigns) {
      const { data: dbCampaign } = await supabaseAdmin
        .from("ad_campaigns")
        .upsert(
          {
            tenant_id: account.tenant_id,
            ad_account_id: account.id,
            platform_campaign_id: c.id,
            name: c.name,
            status: c.status,
            campaign_type: c.type,
            daily_budget: c.dailyBudget,
            target_roas: c.targetRoas,
            currency: account.currency,
          },
          { onConflict: "tenant_id,ad_account_id,platform_campaign_id" }
        )
        .select("id")
        .single()

      if (dbCampaign) campaignCount++
    }

    const stats = await getGoogleStats(accessToken, account.platform_account_id, dateFromStr, dateToStr)
    for (const s of stats) {
      // Find internal campaign ID
      const { data: cam } = await supabaseAdmin
        .from("ad_campaigns")
        .select("id")
        .eq("ad_account_id", account.id)
        .eq("platform_campaign_id", s.campaignId)
        .single()

      if (!cam) continue

      await supabaseAdmin
        .from("ad_campaign_daily_stats")
        .upsert(
          {
            tenant_id: account.tenant_id,
            campaign_id: cam.id,
            date: s.date,
            impressions: s.impressions,
            clicks: s.clicks,
            cost: s.cost,
            conversions: s.conversions,
            conversion_value: s.conversionValue,
          },
          { onConflict: "campaign_id,date" }
        )
      statsCount++
    }
  } else if (platform === "meta_ads") {
    const campaigns = await getMetaCampaigns(accessToken, account.platform_account_id)
    for (const c of campaigns) {
      const { data: dbCampaign } = await supabaseAdmin
        .from("ad_campaigns")
        .upsert(
          {
            tenant_id: account.tenant_id,
            ad_account_id: account.id,
            platform_campaign_id: c.id,
            name: c.name,
            status: c.status,
            campaign_type: c.type,
            daily_budget: c.dailyBudget,
            target_roas: null,
            currency: account.currency,
          },
          { onConflict: "tenant_id,ad_account_id,platform_campaign_id" }
        )
        .select("id")
        .single()

      if (!dbCampaign) continue
      campaignCount++

      // Meta insights are per-campaign
      const insights = await getMetaCampaignInsights(accessToken, c.id, dateFromStr, dateToStr)
      for (const s of insights) {
        await supabaseAdmin
          .from("ad_campaign_daily_stats")
          .upsert(
            {
              tenant_id: account.tenant_id,
              campaign_id: dbCampaign.id,
              date: s.date,
              impressions: s.impressions,
              clicks: s.clicks,
              cost: s.cost,
              conversions: s.conversions,
              conversion_value: s.conversionValue,
            },
            { onConflict: "campaign_id,date" }
          )
        statsCount++
      }
    }
  } else if (platform === "tiktok_ads") {
    const { getTikTokCampaigns: listTTCampaigns, getTikTokCampaignStats: getTTStats } = await import("@/lib/tiktok-ads-client")
    const campaigns = await listTTCampaigns(accessToken, account.platform_account_id)

    const campaignIds: string[] = []
    for (const c of campaigns) {
      const { data: dbCampaign } = await supabaseAdmin
        .from("ad_campaigns")
        .upsert(
          {
            tenant_id: account.tenant_id,
            ad_account_id: account.id,
            platform_campaign_id: c.id,
            name: c.name,
            status: c.status,
            campaign_type: c.type,
            daily_budget: c.dailyBudget,
            target_roas: null,
            currency: account.currency,
          },
          { onConflict: "tenant_id,ad_account_id,platform_campaign_id" }
        )
        .select("id")
        .single()

      if (dbCampaign) {
        campaignCount++
        campaignIds.push(c.id)
      }
    }

    if (campaignIds.length > 0) {
      const stats = await getTTStats(accessToken, account.platform_account_id, campaignIds, dateFromStr, dateToStr)
      for (const s of stats) {
        const { data: cam } = await supabaseAdmin
          .from("ad_campaigns")
          .select("id")
          .eq("ad_account_id", account.id)
          .eq("platform_campaign_id", s.campaignId)
          .single()

        if (!cam) continue

        await supabaseAdmin
          .from("ad_campaign_daily_stats")
          .upsert(
            {
              tenant_id: account.tenant_id,
              campaign_id: cam.id,
              date: s.date,
              impressions: s.impressions,
              clicks: s.clicks,
              cost: s.cost,
              conversions: s.conversions,
              conversion_value: s.conversionValue,
            },
            { onConflict: "campaign_id,date" }
          )
        statsCount++
      }
    }
  }

  return { campaigns: campaignCount, stats: statsCount }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAccessToken(account: any): Promise<string> {
  if (account.credentials_source === "google_credentials") {
    const { data: creds } = await supabaseAdmin
      .from("google_credentials")
      .select("refresh_token")
      .eq("tenant_id", account.tenant_id)
      .single()

    if (!creds?.refresh_token) throw new Error("No Google refresh token found")

    const { accessToken } = await refreshAccessToken(creds.refresh_token)
    return accessToken
  }

  // connector_credentials (Meta, TikTok)
  const provider = account.platform === "meta_ads" ? "meta_ads" : "tiktok_ads"
  const { data: creds } = await supabaseAdmin
    .from("connector_credentials")
    .select("access_token")
    .eq("tenant_id", account.tenant_id)
    .eq("provider", provider)
    .eq("is_active", true)
    .single()

  if (!creds?.access_token) throw new Error(`No ${provider} access token found`)

  return creds.access_token
}
