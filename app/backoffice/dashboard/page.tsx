"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Users,
  CalendarDays,
  Zap,
  CheckCircle,
  ArrowRight,
  Upload,
  Settings,
} from "lucide-react"
import { cn } from "@/lib/cn"

interface DashboardData {
  totalCustomers: number
  upcomingAppointments: number
  totalExecutions: number
  successRate: number
  recentExecutions: Array<{
    automationType: string
    status: string
    trigger: string
    createdAt: string
    durationMs: number | null
  }>
}

const automationLabels: Record<string, string> = {
  "lead-to-crm": "Email de bienvenida",
  "birthday-reminder": "Feliz cumpleaños",
  "reactivation-reminder": "Reactivación inactivos",
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Resumen general de tu negocio en Aura. Acá ves el estado de tus clientes, citas próximas, y el rendimiento de tus automatizaciones en tiempo real.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Clientes",
                value: data.totalCustomers,
                icon: Users,
                color: "text-accent-blue",
                bg: "bg-accent-blue/10",
                href: "/backoffice/customers",
              },
              {
                label: "Citas próximas",
                value: data.upcomingAppointments,
                icon: CalendarDays,
                color: "text-green-400",
                bg: "bg-green-400/10",
                href: "/backoffice/appointments",
              },
              {
                label: "Ejecuciones totales",
                value: data.totalExecutions,
                icon: Zap,
                color: "text-accent-violet",
                bg: "bg-accent-violet/10",
                href: "/backoffice/automations",
              },
              {
                label: "Tasa de éxito",
                value: `${data.successRate}%`,
                icon: CheckCircle,
                color: "text-emerald-400",
                bg: "bg-emerald-400/10",
                href: "/backoffice/automations",
              },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <Link
                  key={stat.label}
                  href={stat.href}
                  className="bg-background-elevated border border-border rounded-xl p-4 hover:border-accent-blue/30 transition-colors"
                >
                  <div className={cn("p-2 rounded-lg w-fit mb-3", stat.bg)}>
                    <Icon className={cn("w-4 h-4", stat.color)} />
                  </div>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
                </Link>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Executions */}
            <div className="bg-background-elevated border border-border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-text-primary">Ejecuciones recientes</h2>
                <Link
                  href="/backoffice/automations"
                  className="flex items-center gap-1 text-xs text-accent-blue hover:text-accent-violet transition-colors"
                >
                  Ver todas <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {data.recentExecutions.length === 0 ? (
                <div className="p-8 text-center">
                  <Zap className="w-6 h-6 text-text-muted mx-auto mb-2" />
                  <p className="text-sm text-text-muted">Aún no hay ejecuciones</p>
                  <p className="text-xs text-text-muted mt-1">
                    Las automatizaciones se ejecutarán cuando se creen clientes o según su programación.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {data.recentExecutions.map((exec, i) => (
                    <div key={i} className="flex items-center gap-3 p-4">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          exec.status === "success"
                            ? "bg-green-400"
                            : exec.status === "failed"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {automationLabels[exec.automationType] ?? exec.automationType}
                        </p>
                        <p className="text-xs text-text-muted">
                          {exec.trigger === "cron" ? "Programada" : exec.trigger === "internal" ? "Evento" : exec.trigger}
                          {exec.durationMs ? ` · ${(exec.durationMs / 1000).toFixed(1)}s` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className={cn(
                            "text-xs font-medium px-2 py-0.5 rounded-full",
                            exec.status === "success"
                              ? "bg-green-400/10 text-green-400"
                              : exec.status === "failed"
                              ? "bg-red-400/10 text-red-400"
                              : "bg-yellow-400/10 text-yellow-400"
                          )}
                        >
                          {exec.status === "success" ? "Exitosa" : exec.status === "failed" ? "Fallida" : "Corriendo"}
                        </span>
                        <p className="text-xs text-text-muted mt-0.5">
                          {formatRelativeTime(exec.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="bg-background-elevated border border-border rounded-xl overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="text-sm font-semibold text-text-primary">Acciones rápidas</h2>
                <p className="text-xs text-text-muted mt-0.5">Atajos a las funciones más usadas</p>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { href: "/backoffice/customers/import", label: "Importar CSV", icon: Upload, color: "border-accent-blue/30 hover:border-accent-blue/60 text-accent-blue" },
                  { href: "/backoffice/appointments/new", label: "Agendar cita", icon: CalendarDays, color: "border-green-400/30 hover:border-green-400/60 text-green-400" },
                  { href: "/backoffice/automations", label: "Ver automatizaciones", icon: Zap, color: "border-accent-violet/30 hover:border-accent-violet/60 text-accent-violet" },
                  { href: "/backoffice/settings", label: "Configuración", icon: Settings, color: "border-yellow-400/30 hover:border-yellow-400/60 text-yellow-400" },
                ].map((action) => {
                  const Icon = action.icon
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border bg-background-elevated text-xs font-medium transition-all duration-150",
                        action.color
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {action.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Info box */}
          <div className="p-4 rounded-xl border border-accent-blue/20 bg-accent-blue/5">
            <p className="text-xs text-text-muted">
              <span className="font-medium text-accent-blue">Resultado esperado:</span> Los números se actualizan en tiempo real. Los clientes se suman al importar CSV o crear manualmente. Las ejecuciones se registran cada vez que una automatización corre (diariamente o por evento). La tasa de éxito refleja el porcentaje de ejecuciones que completaron el envío de email correctamente.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
