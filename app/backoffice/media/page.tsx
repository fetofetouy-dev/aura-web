"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Megaphone,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Target,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import type { AdAccount, AdPlatform } from "@/lib/types"

const platformLabels: Record<AdPlatform, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  tiktok_ads: "TikTok Ads",
}

const platformColors: Record<AdPlatform, string> = {
  google_ads: "text-blue-400",
  meta_ads: "text-indigo-400",
  tiktok_ads: "text-pink-400",
}

interface CampaignWithStats {
  id: string
  name: string
  status: string
  ad_account: { platform: AdPlatform; account_name: string }
  stats_period: {
    cost: number
    conversions: number
    conversion_value: number
    roas: number
  }
}

interface CampaignsResponse {
  campaigns: CampaignWithStats[]
  totals: { cost: number; conversions: number; conversionValue: number; roas: number }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)
}

export default function MediaPage() {
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [campaignsData, setCampaignsData] = useState<CampaignsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [accountsRes, campaignsRes] = await Promise.all([
        fetch("/api/ads/accounts"),
        fetch("/api/ads/campaigns?days=7"),
      ])

      if (accountsRes.ok) {
        const data = await accountsRes.json()
        setAccounts(data.accounts ?? [])
      }
      if (campaignsRes.ok) {
        const data = await campaignsRes.json()
        setCampaignsData(data)
      }
    } catch (err) {
      console.error("Error loading media data:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      await fetch("/api/ads/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      // Wait a bit then reload
      setTimeout(() => {
        loadData()
        setSyncing(false)
      }, 3000)
    } catch {
      setSyncing(false)
    }
  }

  const connectedPlatforms = new Set(accounts.filter((a) => a.is_active).map((a) => a.platform))
  const allPlatforms: AdPlatform[] = ["google_ads", "meta_ads", "tiktok_ads"]
  const totals = campaignsData?.totals ?? { cost: 0, conversions: 0, conversionValue: 0, roas: 0 }
  const topCampaigns = (campaignsData?.campaigns ?? [])
    .filter((c) => c.status === "enabled")
    .sort((a, b) => b.stats_period.cost - a.stats_period.cost)
    .slice(0, 8)

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Publicidad" subtitle="Gestión de campañas y optimización de presupuesto" />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Connection status cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allPlatforms.map((platform) => {
            const connected = connectedPlatforms.has(platform)
            return (
              <div key={platform} className="bg-background-elevated border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-medium ${platformColors[platform]}`}>
                    {platformLabels[platform]}
                  </span>
                  {connected ? (
                    <span className="flex items-center gap-1 text-xs text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <AlertCircle className="w-3.5 h-3.5" /> Sin conectar
                    </span>
                  )}
                </div>
                {connected ? (
                  <p className="text-xs text-text-muted">
                    {accounts.filter((a) => a.platform === platform && a.is_active).length} cuenta(s) activa(s)
                  </p>
                ) : (
                  <Link
                    href="/backoffice/media/connect"
                    className="text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                  >
                    Conectar cuenta →
                  </Link>
                )}
              </div>
            )
          })}
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background-elevated border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted">Gasto (7 días)</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {loading ? "—" : formatCurrency(totals.cost)}
            </p>
          </div>

          <div className="bg-background-elevated border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted">Conversiones (7 días)</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {loading ? "—" : totals.conversions.toLocaleString("es-AR")}
            </p>
          </div>

          <div className="bg-background-elevated border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted">ROAS promedio</span>
            </div>
            <p className="text-2xl font-bold text-text-primary">
              {loading ? "—" : `${totals.roas.toFixed(2)}x`}
            </p>
          </div>
        </div>

        {/* Sync bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-text-primary">Top Campañas</h2>
            {accounts.length > 0 && accounts[0].last_synced_at && (
              <span className="text-xs text-text-muted">
                Última sync: {new Date(accounts[0].last_synced_at).toLocaleString("es-AR")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSync}
              disabled={syncing || accounts.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 transition-colors disabled:opacity-50"
            >
              {syncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </button>
            <Link
              href="/backoffice/media/campaigns"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Campaign table */}
        {loading ? (
          <div className="bg-background-elevated border border-border rounded-xl p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
          </div>
        ) : topCampaigns.length === 0 ? (
          <div className="bg-background-elevated border border-border rounded-xl p-10 text-center">
            <Megaphone className="w-10 h-10 mx-auto text-text-muted mb-3" />
            <p className="text-sm text-text-primary font-medium mb-1">Sin campañas todavía</p>
            <p className="text-xs text-text-muted mb-4">Conectá tu cuenta de Google Ads, Meta o TikTok para empezar.</p>
            <Link
              href="/backoffice/media/connect"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-white transition-colors"
            >
              Conectar cuenta
            </Link>
          </div>
        ) : (
          <div className="bg-background-elevated border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Campaña</th>
                  <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Plataforma</th>
                  <th className="text-right text-xs font-medium text-text-muted px-5 py-3">Gasto 7d</th>
                  <th className="text-right text-xs font-medium text-text-muted px-5 py-3">Conv.</th>
                  <th className="text-right text-xs font-medium text-text-muted px-5 py-3">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm text-text-primary">{c.name}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${platformColors[c.ad_account.platform]}`}>
                        {platformLabels[c.ad_account.platform]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-text-primary">
                      {formatCurrency(c.stats_period.cost)}
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-text-primary">
                      {c.stats_period.conversions.toLocaleString("es-AR")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <RoasBadge roas={c.stats_period.roas} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Optimizer CTA */}
        <div className="bg-gradient-to-r from-accent-blue/5 to-accent-violet/5 border border-accent-blue/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">Optimizador de Presupuesto</h3>
              <p className="text-xs text-text-muted max-w-md">
                Redistribuí tu presupuesto entre campañas para maximizar conversiones usando modelos estadísticos avanzados.
              </p>
            </div>
            <Link
              href="/backoffice/media/optimizer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-white transition-colors shrink-0"
            >
              <TrendingUp className="w-4 h-4" /> Optimizar
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

function RoasBadge({ roas }: { roas: number }) {
  let color = "text-text-muted"
  if (roas >= 4) color = "text-green-400"
  else if (roas >= 2) color = "text-yellow-400"
  else if (roas > 0) color = "text-red-400"

  return <span className={`text-sm font-medium ${color}`}>{roas > 0 ? `${roas.toFixed(2)}x` : "—"}</span>
}
