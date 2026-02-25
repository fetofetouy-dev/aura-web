"use client"

import { useEffect, useState } from "react"
import { Zap, CheckCircle2, XCircle, Clock, AlertCircle, Play } from "lucide-react"
import { cn } from "@/lib/cn"

interface AutomationData {
  id: string
  name: string
  description: string
  category: string
  trigger: string
  integrations: string[]
  isActive: boolean
  executionCount: number
  successRate: number
  failedCount: number
  lastExecution: string | null
  lastExecutionStatus: string | null
}

interface StatsData {
  totalExecutions: number
  globalSuccessRate: number
  activeCount: number
  withErrors: number
}

const categoryLabels: Record<string, string> = {
  LEADS_CRM: "Leads & CRM",
  APPOINTMENTS: "Citas",
  BILLING: "Facturación",
  INVENTORY: "Inventario",
  MARKETING: "Marketing",
}

const categoryColors: Record<string, string> = {
  LEADS_CRM: "bg-accent-blue/10 text-accent-blue",
  APPOINTMENTS: "bg-green-500/10 text-green-400",
  BILLING: "bg-yellow-500/10 text-yellow-400",
  INVENTORY: "bg-orange-500/10 text-orange-400",
  MARKETING: "bg-accent-violet/10 text-accent-violet",
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 1) return "Hace segundos"
  if (minutes < 60) return `Hace ${minutes}min`
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${days}d`
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "success") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5" /> Exitosa
      </span>
    )
  }
  if (status === "failed") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <XCircle className="w-3.5 h-3.5" /> Fallida
      </span>
    )
  }
  if (status === "running") {
    return (
      <span className="flex items-center gap-1 text-xs text-yellow-400">
        <Clock className="w-3.5 h-3.5" /> Corriendo
      </span>
    )
  }
  return (
    <span className="text-xs text-text-muted">Sin ejecuciones</span>
  )
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<AutomationData[]>([])
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/automations")
      .then((r) => r.json())
      .then((data) => {
        setAutomations(data.automations ?? [])
        setStats(data.stats ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const errors = automations.filter((a) => a.lastExecutionStatus === "failed")

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Automatizaciones</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Tus automatizaciones activas que trabajan en segundo plano. Cada una se ejecuta automáticamente según su trigger (evento o cron) y envía emails a tus clientes vía Gmail.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <>
          {/* Alert: automation with error */}
          {errors.length > 0 && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">
                  {errors.length} automatización{errors.length > 1 ? "es" : ""} con errores en su última ejecución
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  {errors.map((e) => e.name).join(", ")} — Revisá que Gmail esté conectado en Configuración.
                </p>
              </div>
            </div>
          )}

          {/* Stats row */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total ejecuciones", value: stats.totalExecutions.toLocaleString(), icon: Zap, color: "text-accent-blue" },
                { label: "Tasa de éxito global", value: `${stats.globalSuccessRate}%`, icon: CheckCircle2, color: "text-green-400" },
                { label: "Automatizaciones activas", value: stats.activeCount, icon: Play, color: "text-accent-violet" },
                { label: "Con errores recientes", value: stats.withErrors, icon: AlertCircle, color: stats.withErrors > 0 ? "text-red-400" : "text-text-muted" },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-background-elevated border border-border rounded-xl p-4">
                    <div className={cn("mb-2", stat.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                    <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
                  </div>
                )
              })}
            </div>
          )}

          {/* Automations list */}
          <div>
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Todas las automatizaciones</h2>
            <div className="space-y-2">
              {automations.map((automation) => (
                <div
                  key={automation.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background-elevated hover:border-accent-blue/40 transition-all duration-150"
                >
                  {/* Status indicator */}
                  <div className="shrink-0">
                    {automation.isActive ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-text-muted" />
                    )}
                  </div>

                  {/* Name + description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-text-primary text-sm truncate">
                        {automation.name}
                      </p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", categoryColors[automation.category] ?? "bg-white/5 text-text-muted")}>
                        {categoryLabels[automation.category] ?? automation.category}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted truncate">{automation.description}</p>
                    <p className="text-xs text-text-muted/60 mt-0.5">{automation.trigger}</p>
                  </div>

                  {/* Integrations */}
                  <div className="hidden md:flex items-center gap-1 shrink-0">
                    {automation.integrations.map((integration) => (
                      <span key={integration} className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded-full text-text-muted">
                        {integration}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="hidden lg:flex items-center gap-6 shrink-0 text-right">
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{automation.executionCount}</p>
                      <p className="text-xs text-text-muted">ejecuciones</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{automation.successRate}%</p>
                      <p className="text-xs text-text-muted">éxito</p>
                    </div>
                    <div>
                      <StatusBadge status={automation.lastExecutionStatus} />
                      {automation.lastExecution && (
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatRelativeTime(automation.lastExecution)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl border border-accent-blue/20 bg-accent-blue/5">
            <p className="text-xs text-text-muted">
              <span className="font-medium text-accent-blue">Resultado esperado:</span> Cada automatización se ejecuta según su trigger. Las de tipo cron corren diariamente a la hora configurada. Las de tipo evento se disparan cuando ocurre la acción (ej: crear un cliente). Todas envían emails vía tu Gmail conectado y registran cada ejecución con su resultado.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
