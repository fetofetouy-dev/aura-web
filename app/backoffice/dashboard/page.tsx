"use client"

import Link from "next/link"
import { Zap, CheckCircle, TrendingUp, Clock, ArrowRight, AlertCircle } from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { Card } from "@/components/ui/Card"
import { mockAutomations } from "@/lib/mock-data/automations"
import { mockExecutions } from "@/lib/mock-data/executions"
import { getUnreadCount } from "@/lib/mock-data/inbox-messages"

const stats = [
  {
    label: "Automatizaciones activas",
    value: mockAutomations.filter((a) => a.isActive).length,
    total: 10,
    icon: Zap,
    color: "text-accent-blue",
    bg: "bg-accent-blue/10",
    suffix: `/ 10`,
  },
  {
    label: "Ejecuciones este mes",
    value: 247,
    total: 2000,
    icon: TrendingUp,
    color: "text-accent-violet",
    bg: "bg-accent-violet/10",
    suffix: "/ 2,000",
  },
  {
    label: "Tasa de éxito",
    value: 96,
    total: 100,
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-400/10",
    suffix: "%",
  },
  {
    label: "Mensajes sin responder",
    value: getUnreadCount(),
    total: null,
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    suffix: " pendientes",
  },
]

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (hours < 1) return "Hace menos de 1h"
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${days}d`
}

export default function DashboardPage() {
  const activeAutomations = mockAutomations.filter((a) => a.isActive)
  const recentExecutions = mockExecutions.slice(0, 3)

  return (
    <>
      <DemoTopBar title="Dashboard" subtitle="Consultora MR · Plan Professional" />

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-text-primary">
                  {stat.value}
                  <span className="text-sm font-normal text-text-muted ml-1">{stat.suffix}</span>
                </p>
                <p className="text-xs text-text-muted mt-1">{stat.label}</p>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Automations */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Automatizaciones Activas</h2>
              <Link
                href="/backoffice/automations"
                className="flex items-center gap-1 text-xs text-accent-blue hover:text-accent-violet transition-colors"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {activeAutomations.map((auto) => (
                <Link
                  key={auto.id}
                  href={`/backoffice/automations/${auto.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-accent-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{auto.name}</p>
                    <p className="text-xs text-text-muted">
                      {auto.executionCount} ejecuciones · {auto.successRate}% éxito
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {auto.lastExecutionStatus === "SUCCESS" ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span className="text-xs text-text-muted">
                      {formatRelativeTime(auto.lastExecution)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Executions */}
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-sm font-semibold text-text-primary">Ejecuciones Recientes</h2>
              <Link
                href="/backoffice/automations"
                className="flex items-center gap-1 text-xs text-accent-blue hover:text-accent-violet transition-colors"
              >
                Ver todas <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentExecutions.map((exec) => (
                <div key={exec.id} className="flex items-center gap-3 p-4">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      exec.status === "SUCCESS"
                        ? "bg-green-400"
                        : exec.status === "FAILED"
                        ? "bg-red-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {exec.automationName}
                    </p>
                    <p className="text-xs text-text-muted">
                      {exec.trigger === "WEBHOOK" ? "Webhook" : exec.trigger === "MANUAL" ? "Manual" : "Programada"} ·{" "}
                      {exec.duration}s · {exec.steps.length} pasos
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      exec.status === "SUCCESS"
                        ? "bg-green-400/10 text-green-400"
                        : exec.status === "FAILED"
                        ? "bg-red-400/10 text-red-400"
                        : "bg-yellow-400/10 text-yellow-400"
                    }`}
                  >
                    {exec.status === "SUCCESS" ? "Exitosa" : exec.status === "FAILED" ? "Fallida" : "Ejecutando"}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-3">Acciones rápidas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href: "/backoffice/marketplace", label: "+ Agregar automatización", color: "border-accent-blue/30 hover:border-accent-blue/60 text-accent-blue" },
              { href: "/backoffice/inbox", label: `📬 Ver mensajes (${getUnreadCount()} nuevos)`, color: "border-yellow-400/30 hover:border-yellow-400/60 text-yellow-400" },
              { href: "/backoffice/assistant", label: "🤖 Revisar Bot IA", color: "border-accent-violet/30 hover:border-accent-violet/60 text-accent-violet" },
              { href: "/backoffice/automations", label: "⚡ Ver automatizaciones", color: "border-green-400/30 hover:border-green-400/60 text-green-400" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`p-3 rounded-lg border bg-background-elevated text-xs font-medium text-center transition-all duration-150 ${action.color}`}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
