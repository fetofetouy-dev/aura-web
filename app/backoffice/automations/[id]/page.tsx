"use client"

import Link from "next/link"
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  RefreshCw,
  Webhook,
  Calendar,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { mockAutomations } from "@/lib/mock-data/automations"
import { getExecutionsByAutomation, MockExecution, ExecutionStep } from "@/lib/mock-data/executions"
import { cn } from "@/lib/cn"
import { useState } from "react"

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatMs(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// ─── Step component ──────────────────────────────────────────────────────────

function StepItem({ step, isLast }: { step: ExecutionStep; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)

  const statusConfig = {
    SUCCESS: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10", line: "bg-green-400/30" },
    FAILED: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", line: "bg-red-400/30" },
    RUNNING: { icon: RefreshCw, color: "text-yellow-400", bg: "bg-yellow-400/10", line: "bg-yellow-400/30" },
    PENDING: { icon: Clock, color: "text-text-muted", bg: "bg-white/5", line: "bg-border" },
  }

  const config = statusConfig[step.status]
  const Icon = config.icon

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", config.bg)}>
          <Icon className={cn("w-4 h-4", config.color, step.status === "RUNNING" && "animate-spin")} />
        </div>
        {!isLast && <div className={cn("w-0.5 flex-1 mt-1", config.line)} />}
      </div>

      {/* Content */}
      <div className={cn("flex-1 pb-6", isLast && "pb-0")}>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-left hover:text-text-primary transition-colors group"
        >
          <div>
            <span className="text-sm font-medium text-text-primary">{step.title}</span>
            <span className="ml-2 text-xs text-text-muted">{formatMs(step.duration)}</span>
          </div>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          )}
        </button>

        {expanded && (
          <div className="mt-2 p-3 rounded-lg bg-background border border-border">
            {step.details.map((detail, i) => (
              <p key={i} className="text-xs text-text-muted font-mono py-0.5">
                › {detail}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Execution card ──────────────────────────────────────────────────────────

function ExecutionCard({ execution }: { execution: MockExecution }) {
  const [expanded, setExpanded] = useState(false)

  const triggerIcons = {
    MANUAL: Play,
    WEBHOOK: Webhook,
    SCHEDULED: Calendar,
  }
  const TriggerIcon = triggerIcons[execution.trigger]

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 bg-background-elevated hover:bg-white/[0.02] transition-colors text-left"
      >
        {/* Status */}
        <div>
          {execution.status === "SUCCESS" ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : execution.status === "FAILED" ? (
            <XCircle className="w-5 h-5 text-red-400" />
          ) : (
            <RefreshCw className="w-5 h-5 text-yellow-400 animate-spin" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-sm font-medium",
                execution.status === "SUCCESS"
                  ? "text-green-400"
                  : execution.status === "FAILED"
                  ? "text-red-400"
                  : "text-yellow-400"
              )}
            >
              {execution.status === "SUCCESS" ? "Exitosa" : execution.status === "FAILED" ? "Fallida" : "Corriendo"}
            </span>
            <span className="text-xs text-text-muted">{formatDate(execution.startedAt)}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <TriggerIcon className="w-3 h-3" />
              {execution.trigger === "MANUAL"
                ? "Manual"
                : execution.trigger === "WEBHOOK"
                ? "Webhook"
                : "Programada"}
            </span>
            <span className="text-xs text-text-muted">
              {execution.duration}s · {execution.steps.length} pasos
            </span>
          </div>
        </div>

        <ChevronDown
          className={cn("w-4 h-4 text-text-muted transition-transform shrink-0", expanded && "rotate-180")}
        />
      </button>

      {expanded && (
        <div className="p-4 border-t border-border bg-background">
          <div className="space-y-0">
            {execution.steps.map((step, i) => (
              <StepItem key={step.id} step={step} isLast={i === execution.steps.length - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AutomationDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const automation = mockAutomations.find((a) => a.id === id) ?? mockAutomations[0]
  const executions = getExecutionsByAutomation(automation.id)

  const successRate = automation.successRate
  const barColor =
    successRate >= 90 ? "bg-green-400" : successRate >= 70 ? "bg-yellow-400" : "bg-red-400"

  // ── Run modal state ──
  const [showRunModal, setShowRunModal] = useState(false)
  const [leadName, setLeadName] = useState("")
  const [leadEmail, setLeadEmail] = useState("")
  const [running, setRunning] = useState(false)
  const [runResult, setRunResult] = useState<{ success: boolean; message?: string; error?: string; steps?: { title: string; status: string; duration: number }[] } | null>(null)

  async function handleRun() {
    setRunning(true)
    setRunResult(null)
    try {
      const res = await fetch(`/api/automations/${id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadName, leadEmail }),
      })
      const data = await res.json()
      setRunResult(data)
    } catch {
      setRunResult({ success: false, message: "Error de red" })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title={automation.name} />

      <main className="flex-1 p-6 space-y-6">
        {/* Back + header */}
        <div>
          <Link
            href="/backoffice/automations"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a automatizaciones
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-text-primary">{automation.name}</h1>
                <span
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-full font-medium",
                    automation.isActive
                      ? "bg-green-400/10 text-green-400"
                      : "bg-text-muted/20 text-text-muted"
                  )}
                >
                  {automation.isActive ? "Activa" : "Pausada"}
                </span>
              </div>
              <p className="text-text-muted text-sm">{automation.description}</p>
              <div className="flex items-center gap-2 mt-2">
                {automation.integrations.map((i) => (
                  <span
                    key={i}
                    className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded-full text-text-muted"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => { setShowRunModal(true); setRunResult(null) }}
                className="flex items-center gap-2 text-sm border border-border text-text-muted hover:text-text-primary px-4 py-2 rounded-xl transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                Ejecutar ahora
              </button>
              <button
                className={cn(
                  "flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-colors",
                  automation.isActive
                    ? "border border-red-500/30 text-red-400 hover:bg-red-500/5"
                    : "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
                )}
              >
                {automation.isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" /> Activar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total ejecuciones", value: automation.executionCount },
            { label: "Creada el", value: new Date(automation.createdAt).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) },
            { label: "Última ejecución", value: new Date(automation.lastExecution).toLocaleDateString("es-AR", { day: "numeric", month: "short" }) },
            { label: "Estado último run", value: automation.lastExecutionStatus === "SUCCESS" ? "Exitosa" : automation.lastExecutionStatus === "FAILED" ? "Fallida" : "Corriendo" },
          ].map((stat) => (
            <div key={stat.label} className="bg-background-elevated border border-border rounded-xl p-4">
              <p className="text-xl font-bold text-text-primary">{stat.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Success rate bar */}
        <div className="bg-background-elevated border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent-blue" />
              <span className="text-sm font-medium text-text-primary">Tasa de éxito</span>
            </div>
            <span className="text-sm font-bold text-text-primary">{successRate}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", barColor)}
              style={{ width: `${successRate}%` }}
            />
          </div>
          <p className="text-xs text-text-muted mt-2">
            {Math.round((automation.executionCount * successRate) / 100)} exitosas de {automation.executionCount} ejecuciones
          </p>
        </div>

        {/* Execution history */}
        <div>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Historial de ejecuciones
          </h2>
          {executions.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Sin ejecuciones aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {executions.map((exec) => (
                <ExecutionCard key={exec.id} execution={exec} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Run Modal ── */}
      {showRunModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-background-elevated border border-border rounded-2xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-base font-semibold text-text-primary">Ejecutar: {automation.name}</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-text-muted mb-1 block">Nombre del lead</label>
                <input
                  type="text"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="Ej: María García"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
                />
              </div>
              <div>
                <label className="text-xs text-text-muted mb-1 block">Email del lead</label>
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  placeholder="lead@ejemplo.com"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue"
                />
              </div>
            </div>

            {runResult && (
              <div className={cn("rounded-xl p-3 text-sm", runResult.success ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
                {runResult.success ? (
                  <div className="space-y-1">
                    <p className="font-medium">¡Ejecutado con éxito!</p>
                    {runResult.steps?.map((s) => (
                      <p key={s.title} className="text-xs opacity-80">✓ {s.title}</p>
                    ))}
                  </div>
                ) : (
                  <p>{runResult.error ?? runResult.message ?? "Error al ejecutar"}</p>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRunModal(false)}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRun}
                disabled={running || !leadEmail}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-accent-blue text-white rounded-xl hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {running ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                {running ? "Ejecutando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
