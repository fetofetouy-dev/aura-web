"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Loader2, ArrowUpDown } from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { cn } from "@/lib/cn"
import type { AdPlatform } from "@/lib/types"

const platformLabels: Record<AdPlatform, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  tiktok_ads: "TikTok Ads",
}

const platformColors: Record<AdPlatform, string> = {
  google_ads: "bg-blue-500/10 text-blue-400",
  meta_ads: "bg-indigo-500/10 text-indigo-400",
  tiktok_ads: "bg-pink-500/10 text-pink-400",
}

interface CampaignRow {
  id: string
  name: string
  status: string
  campaign_type: string | null
  daily_budget: number | null
  ad_account: { platform: AdPlatform; account_name: string }
  stats_period: {
    days: number
    cost: number
    conversions: number
    conversion_value: number
    roas: number
    ctr: number
    cpc: number
    impressions: number
    clicks: number
  }
}

type SortField = "name" | "cost" | "conversions" | "roas" | "ctr"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)
}

export default function MediaCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [platformFilter, setPlatformFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("cost")
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [])

  async function loadCampaigns() {
    setLoading(true)
    try {
      const res = await fetch("/api/ads/campaigns?days=7")
      if (res.ok) {
        const data = await res.json()
        setCampaigns(data.campaigns ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  // Filter & sort
  const filtered = campaigns
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (platformFilter !== "all" && c.ad_account.platform !== platformFilter) return false
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      let aVal: number | string, bVal: number | string
      switch (sortField) {
        case "name": aVal = a.name; bVal = b.name; break
        case "cost": aVal = a.stats_period.cost; bVal = b.stats_period.cost; break
        case "conversions": aVal = a.stats_period.conversions; bVal = b.stats_period.conversions; break
        case "roas": aVal = a.stats_period.roas; bVal = b.stats_period.roas; break
        case "ctr": aVal = a.stats_period.ctr; bVal = b.stats_period.ctr; break
        default: aVal = 0; bVal = 0
      }
      if (typeof aVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Campañas" subtitle="Rendimiento de todas tus campañas publicitarias" />

      <main className="flex-1 p-6 space-y-4 overflow-auto">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Buscar campaña..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-background-elevated border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent-blue"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="bg-background-elevated border border-border rounded-lg text-sm text-text-primary px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent-blue"
            >
              <option value="all">Todas las plataformas</option>
              <option value="google_ads">Google Ads</option>
              <option value="meta_ads">Meta Ads</option>
              <option value="tiktok_ads">TikTok Ads</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-background-elevated border border-border rounded-lg text-sm text-text-primary px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent-blue"
            >
              <option value="all">Todos los estados</option>
              <option value="enabled">Activas</option>
              <option value="paused">Pausadas</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="bg-background-elevated border border-border rounded-xl p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-background-elevated border border-border rounded-xl p-10 text-center">
            <p className="text-sm text-text-muted">No se encontraron campañas con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="bg-background-elevated border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <SortableHeader label="Campaña" field="name" currentField={sortField} asc={sortAsc} onSort={handleSort} />
                    <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Plataforma</th>
                    <th className="text-left text-xs font-medium text-text-muted px-4 py-3">Estado</th>
                    <th className="text-right text-xs font-medium text-text-muted px-4 py-3">Budget</th>
                    <SortableHeader label="Gasto 7d" field="cost" currentField={sortField} asc={sortAsc} onSort={handleSort} align="right" />
                    <SortableHeader label="Conv." field="conversions" currentField={sortField} asc={sortAsc} onSort={handleSort} align="right" />
                    <SortableHeader label="ROAS" field="roas" currentField={sortField} asc={sortAsc} onSort={handleSort} align="right" />
                    <SortableHeader label="CTR" field="ctr" currentField={sortField} asc={sortAsc} onSort={handleSort} align="right" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-border/50 hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-primary font-medium">{c.name}</p>
                        {c.campaign_type && (
                          <p className="text-xs text-text-muted capitalize">{c.campaign_type}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", platformColors[c.ad_account.platform])}>
                          {platformLabels[c.ad_account.platform]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-muted">
                        {c.daily_budget ? formatCurrency(c.daily_budget) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-primary">
                        {formatCurrency(c.stats_period.cost)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-primary">
                        {c.stats_period.conversions.toLocaleString("es-AR")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <RoasBadge roas={c.stats_period.roas} />
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-text-muted">
                        {c.stats_period.ctr > 0 ? `${c.stats_period.ctr.toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-xs text-text-muted text-center">
          {filtered.length} campaña{filtered.length !== 1 ? "s" : ""} · Datos de los últimos 7 días
        </p>
      </main>
    </div>
  )
}

function SortableHeader({
  label,
  field,
  currentField,
  asc,
  onSort,
  align = "left",
}: {
  label: string
  field: SortField
  currentField: SortField
  asc: boolean
  onSort: (f: SortField) => void
  align?: "left" | "right"
}) {
  const isActive = currentField === field
  return (
    <th
      className={cn(
        "text-xs font-medium text-text-muted px-4 py-3 cursor-pointer select-none hover:text-text-primary transition-colors",
        align === "right" ? "text-right" : "text-left"
      )}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className={cn("w-3 h-3", isActive ? "text-accent-blue" : "text-text-muted/50")} />
      </span>
    </th>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    enabled: "bg-green-500/10 text-green-400",
    paused: "bg-yellow-500/10 text-yellow-400",
    removed: "bg-red-500/10 text-red-400",
  }
  const labels: Record<string, string> = {
    enabled: "Activa",
    paused: "Pausada",
    removed: "Eliminada",
  }
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", styles[status] ?? "bg-white/5 text-text-muted")}>
      {labels[status] ?? status}
    </span>
  )
}

function RoasBadge({ roas }: { roas: number }) {
  let color = "text-text-muted"
  if (roas >= 4) color = "text-green-400"
  else if (roas >= 2) color = "text-yellow-400"
  else if (roas > 0) color = "text-red-400"
  return <span className={`text-sm font-medium ${color}`}>{roas > 0 ? `${roas.toFixed(2)}x` : "—"}</span>
}
