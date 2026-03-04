import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  // Fetch Google credentials
  const { data: googleCreds } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token, updated_at")
    .eq("tenant_id", user.id)
    .single()

  // Fetch non-Google connector credentials
  const { data: connectors } = await supabaseAdmin
    .from("connector_credentials")
    .select("provider, is_active, created_at, updated_at")
    .eq("tenant_id", user.id)

  // Fetch latest sync log per connector
  const { data: syncLogs } = await supabaseAdmin
    .from("sync_logs")
    .select("connector, status, records_created, records_updated, started_at, completed_at, error")
    .eq("tenant_id", user.id)
    .order("started_at", { ascending: false })
    .limit(10)

  // Build latest sync per connector
  const logList = syncLogs ?? []
  const latestSync: Record<string, (typeof logList)[number]> = {}
  for (const log of logList) {
    if (!latestSync[log.connector]) {
      latestSync[log.connector] = log
    }
  }

  const connectorMap = (connectors ?? []).reduce<Record<string, { is_active: boolean; created_at: string }>>((acc, c) => {
    acc[c.provider] = { is_active: c.is_active, created_at: c.created_at }
    return acc
  }, {})

  // Fetch ad accounts for ads platforms status
  const { data: adAccounts } = await supabaseAdmin
    .from("ad_accounts")
    .select("platform, is_active, last_synced_at")
    .eq("tenant_id", user.id)

  const activeAds = (adAccounts ?? []).filter((a) => a.is_active)
  const googleAdsAccount = activeAds.find((a) => a.platform === "google_ads")
  const metaAdsAccount = activeAds.find((a) => a.platform === "meta_ads")
  const tiktokAdsAccount = activeAds.find((a) => a.platform === "tiktok_ads")

  return NextResponse.json({
    google: {
      gmail: !!googleCreds?.refresh_token,
      calendar: !!googleCreds?.refresh_token,
      connectedAt: googleCreds?.updated_at ?? null,
      lastSync: latestSync["google-calendar"] ?? null,
    },
    mercadopago: {
      connected: !!connectorMap.mercadopago?.is_active,
      connectedAt: connectorMap.mercadopago?.created_at ?? null,
      lastSync: latestSync["mercadopago"] ?? null,
    },
    instagram: {
      connected: !!connectorMap.instagram?.is_active,
      connectedAt: connectorMap.instagram?.created_at ?? null,
      lastSync: latestSync["instagram"] ?? null,
    },
    whatsapp: {
      connected: !!connectorMap.whatsapp?.is_active,
      connectedAt: connectorMap.whatsapp?.created_at ?? null,
      lastSync: latestSync["whatsapp"] ?? null,
    },
    google_ads: {
      connected: !!googleAdsAccount,
      lastSync: latestSync["ads-google_ads"] ?? null,
    },
    meta_ads: {
      connected: !!metaAdsAccount,
      lastSync: latestSync["ads-meta_ads"] ?? null,
    },
    tiktok_ads: {
      connected: !!tiktokAdsAccount,
      lastSync: latestSync["ads-tiktok_ads"] ?? null,
    },
  })
}
