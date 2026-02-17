"use client"

import Link from "next/link"
import { Zap, Plus, Play, Pause, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { mockAutomations, MockAutomation } from "@/lib/mock-data/automations"
import { cn } from "@/lib/cn"

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

function StatusBadge({ status }: { status: MockAutomation["lastExecutionStatus"] }) {
  if (status === "SUCCESS") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400">
        <CheckCircle2 className="w-3.5 h-3.5" /> Exitosa
      </span>
    )
  }
  if (status === "FAILED") {
    return (
      <span className="flex items-center gap-1 text-xs text-red-400">
        <XCircle className="w-3.5 h-3.5" /> Fallida
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-yellow-400">
      <Clock className="w-3.5 h-3.5" /> Corriendo
    </span>
  )
}

function AutomationRow({ automation }: { automation: MockAutomation }) {
  const lastExec = new Date(automation.lastExecution).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Link
      href={`/backoffice/automations/${automation.id}`}
      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background-elevated hover:border-accent-blue/40 hover:bg-white/[0.02] transition-all duration-150 group"
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
          <p className="font-medium text-text-primary text-sm group-hover:text-accent-blue transition-colors truncate">
            {automation.name}
          </p>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", categoryColors[automation.category])}>
            {categoryLabels[automation.category]}
          </span>
        </div>
        <p className="text-xs text-text-muted truncate">{automation.description}</p>
      </div>

      {/* Integrations */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        {automation.integrations.slice(0, 3).map((integration) => (
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
          <p className="text-xs text-text-muted mt-0.5">{lastExec}</p>
        </div>
      </div>

      {/* Toggle */}
      <div className="shrink-0 ml-2" onClick={(e) => e.preventDefault()}>
        <button
          className={cn(
            "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
            automation.isActive
              ? "border-text-muted/30 text-text-muted hover:border-red-400/50 hover:text-red-400"
              : "border-green-500/30 text-green-400 hover:bg-green-500/5"
          )}
        >
          {automation.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {automation.isActive ? "Pausar" : "Activar"}
        </button>
      </div>
    </Link>
  )
}

export default function AutomationsPage() {
  const active = mockAutomations.filter((a) => a.isActive)
  const inactive = mockAutomations.filter((a) => !a.isActive)
  const errors = mockAutomations.filter((a) => a.lastExecutionStatus === "FAILED")

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Automatizaciones" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Mis Automatizaciones</h1>
            <p className="text-text-muted text-sm mt-1">
              {active.length} activas · {inactive.length} pausadas · {errors.length} con errores
            </p>
          </div>
          <Link
            href="/backoffice/marketplace"
            className="flex items-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva automatización
          </Link>
        </div>

        {/* Alert: automation with error */}
        {errors.length > 0 && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-400">
                {errors.length} automatización{errors.length > 1 ? "es" : ""} con errores
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {errors.map((e) => e.name).join(", ")} — Hacé click para ver el detalle y reintentar.
              </p>
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total ejecuciones", value: mockAutomations.reduce((s, a) => s + a.executionCount, 0).toLocaleString(), icon: Zap, color: "text-accent-blue" },
            { label: "Tasa de éxito global", value: `${Math.round(mockAutomations.reduce((s, a) => s + a.successRate, 0) / mockAutomations.length)}%`, icon: CheckCircle2, color: "text-green-400" },
            { label: "Automatizaciones activas", value: active.length, icon: Play, color: "text-accent-violet" },
            { label: "Horas ahorradas (est.)", value: "48h", icon: Clock, color: "text-yellow-400" },
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

        {/* Automations list */}
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Todas las automatizaciones</h2>
          <div className="space-y-2">
            {mockAutomations.map((automation) => (
              <AutomationRow key={automation.id} automation={automation} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
