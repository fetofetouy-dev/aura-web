"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  Shield,
  Flame,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  BarChart3,
  Activity,
} from "lucide-react"
import { cn } from "@/lib/cn"
import { listContainer, listItem } from "@/lib/animations"
import { PowerLawChart } from "@/components/charts/PowerLawChart"
import { StrategyComparisonChart } from "@/components/charts/StrategyComparisonChart"
import { ImpactChart } from "@/components/charts/ImpactChart"
import { ElasticityHistoryChart, type ElasticityHistoryData } from "@/components/charts/ElasticityHistoryChart"
import type {
  OptimizationRun,
  OptimizationSolution,
  CampaignAllocation,
  CampaignCurve,
  AnalyzeResponse,
  ImpactMetrics,
} from "@/lib/types"

const strategyConfig = {
  conservative: {
    label: "Conservadora",
    description: "Cambios pequeños (±15%). Bajo riesgo.",
    icon: Shield,
    color: "text-green-400",
    borderColor: "border-green-500/20",
    bgColor: "bg-green-500/5",
    buttonColor: "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/30",
  },
  moderate: {
    label: "Moderada",
    description: "Cambios moderados (±25%). Riesgo medio.",
    icon: TrendingUp,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/20",
    bgColor: "bg-yellow-500/5",
    buttonColor: "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  aggressive: {
    label: "Agresiva",
    description: "Cambios significativos (±35%). Mayor potencial.",
    icon: Flame,
    color: "text-red-400",
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
    buttonColor: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/30",
  },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(amount)
}

function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)}%`
}

export default function MediaOptimizerPage() {
  const [runs, setRuns] = useState<OptimizationRun[]>([])
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [applying, setApplying] = useState<string | null>(null)
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Analysis state
  const [analyzing, setAnalyzing] = useState(false)
  const [curves, setCurves] = useState<CampaignCurve[] | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  // Impact state
  const [impact, setImpact] = useState<ImpactMetrics | null>(null)
  const [impactLoading, setImpactLoading] = useState(false)

  // Elasticity history state
  const [elasticityHistory, setElasticityHistory] = useState<ElasticityHistoryData[] | null>(null)

  const loadRuns = useCallback(async () => {
    try {
      const res = await fetch("/api/optimizer/runs")
      if (res.ok) {
        const data = await res.json()
        setRuns(data.runs ?? [])
      }
    } catch {
      // Silently fail on polling
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    loadRuns().finally(() => setLoading(false))
  }, [loadRuns])

  // Load impact on mount
  useEffect(() => {
    async function loadImpact() {
      setImpactLoading(true)
      try {
        const res = await fetch("/api/optimizer/impact")
        if (res.ok) {
          const data = await res.json()
          setImpact(data)
        }
      } catch {
        // No impact data available
      } finally {
        setImpactLoading(false)
      }
    }
    loadImpact()
  }, [])

  // Load elasticity history on mount
  useEffect(() => {
    async function loadElasticityHistory() {
      try {
        const res = await fetch("/api/optimizer/elasticity-history")
        if (res.ok) {
          const data = await res.json()
          setElasticityHistory(data.campaigns ?? [])
        }
      } catch {
        // No history available
      }
    }
    loadElasticityHistory()
  }, [])

  // Poll while a run is in progress
  const latestRun = runs[0]
  const isRunning = latestRun?.status === "running" || latestRun?.status === "pending"

  useEffect(() => {
    if (isRunning) {
      pollRef.current = setInterval(loadRuns, 3000)
      return () => {
        if (pollRef.current) clearInterval(pollRef.current)
      }
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      if (optimizing && latestRun && !isRunning) {
        setOptimizing(false)
      }
    }
  }, [isRunning, loadRuns, optimizing, latestRun])

  async function handleOptimize() {
    setOptimizing(true)
    setError(null)
    try {
      const res = await fetch("/api/optimizer/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objective: "conversion_value" }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Error al iniciar optimización")
        setOptimizing(false)
        return
      }
      setTimeout(loadRuns, 1000)
    } catch {
      setError("Error de conexión")
      setOptimizing(false)
    }
  }

  async function handleApply(solutionId: string) {
    if (!confirm("¿Aplicar esta redistribución de presupuesto? Se actualizarán los budgets de las campañas.")) {
      return
    }

    setApplying(solutionId)
    try {
      const res = await fetch(`/api/optimizer/solutions/${solutionId}/apply`, {
        method: "POST",
      })
      if (res.ok) {
        await loadRuns()
      } else {
        const data = await res.json()
        alert(data.error ?? "Error al aplicar solución")
      }
    } catch {
      alert("Error de conexión")
    } finally {
      setApplying(null)
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true)
    setAnalyzeError(null)
    try {
      const res = await fetch("/api/optimizer/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const data = await res.json()
        setAnalyzeError(data.error ?? "Error al analizar")
        return
      }
      const data: AnalyzeResponse = await res.json()
      if (data.status === "error") {
        setAnalyzeError(data.error ?? "Error en el análisis")
        return
      }
      setCurves(data.curves ?? null)
    } catch {
      setAnalyzeError("Error de conexión con el servicio de análisis")
    } finally {
      setAnalyzing(false)
    }
  }

  const hasCompletedRun = latestRun?.status === "completed" && latestRun.solutions
  const hasAppliedSolution = latestRun?.solutions?.some((s) => s.is_applied)

  return (
    <div className="flex-1 flex flex-col min-h-screen">

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* How it works */}
        <div className="bg-background-elevated border border-border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">¿Cómo funciona?</h2>
          <motion.div
            variants={listContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {[
              { step: "1", title: "Datos", desc: "Aura analiza el rendimiento histórico de cada campaña" },
              { step: "2", title: "Modelo", desc: "Calcula la curva de respuesta (costo → volumen) por campaña" },
              { step: "3", title: "Optimización", desc: "Redistribuye el presupuesto para maximizar el volumen total" },
              { step: "4", title: "Aplicar", desc: "Elegís una estrategia y Aura ajusta las campañas" },
            ].map((item) => (
              <motion.div key={item.step} variants={listItem} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-accent-blue/10 text-accent-blue flex items-center justify-center text-xs font-bold shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-xs font-medium text-text-primary">{item.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Optimize button / Running state */}
        {!hasCompletedRun && (
          <div className="bg-background-elevated border border-border rounded-xl p-10 text-center">
            {isRunning ? (
              <>
                <Loader2 className="w-10 h-10 mx-auto text-accent-blue mb-3 animate-spin" />
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Optimizando campañas...
                </h3>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  El modelo está analizando tus campañas y calculando la redistribución óptima.
                  Esto puede tomar unos minutos.
                </p>
              </>
            ) : (
              <>
                <Zap className="w-10 h-10 mx-auto text-accent-blue mb-3" />
                <h3 className="text-sm font-semibold text-text-primary mb-2">
                  Optimizá tu presupuesto publicitario
                </h3>
                <p className="text-xs text-text-muted max-w-md mx-auto mb-4">
                  Aura analiza el rendimiento de tus campañas y te sugiere cómo redistribuir el
                  presupuesto para maximizar conversiones.
                </p>
                {error && (
                  <p className="text-xs text-red-400 mb-4">{error}</p>
                )}
                <button
                  onClick={handleOptimize}
                  disabled={optimizing || loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-accent-amber text-white hover:bg-accent-amber/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {optimizing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Optimizar ahora
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Solutions (if completed run exists) */}
        {hasCompletedRun && latestRun.solutions && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">
                Resultados de la última optimización
              </h2>
              <button
                onClick={handleOptimize}
                disabled={optimizing || isRunning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 disabled:opacity-50 transition-colors"
              >
                {optimizing || isRunning ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                Re-optimizar
              </button>
            </div>
            <motion.div
              variants={listContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {latestRun.solutions
                .sort((a, b) => {
                  const order = { conservative: 0, moderate: 1, aggressive: 2 }
                  return (order[a.strategy] ?? 0) - (order[b.strategy] ?? 0)
                })
                .map((solution) => (
                  <motion.div key={solution.id} variants={listItem}>
                    <SolutionCard
                      solution={solution}
                      expanded={expandedSolution === solution.id}
                      onToggleExpand={() =>
                        setExpandedSolution(expandedSolution === solution.id ? null : solution.id)
                      }
                      onApply={() => handleApply(solution.id)}
                      applying={applying === solution.id}
                    />
                  </motion.div>
                ))}
            </motion.div>

            {/* Strategy Comparison Chart */}
            <div className="mt-4">
              <StrategyComparisonChart solutions={latestRun.solutions} />
            </div>
          </div>
        )}

        {/* Impact Section (only if there's an applied solution) */}
        {hasAppliedSolution && (
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-blue" />
              Impacto de la última optimización
            </h2>
            {impactLoading ? (
              <div className="bg-background-elevated border border-border rounded-xl p-8 text-center">
                <Loader2 className="w-6 h-6 mx-auto text-text-muted animate-spin mb-2" />
                <p className="text-xs text-text-muted">Calculando impacto...</p>
              </div>
            ) : impact ? (
              <ImpactChart impact={impact} />
            ) : (
              <div className="bg-background-elevated border border-border rounded-xl p-6 text-center">
                <p className="text-xs text-text-muted">
                  El impacto estará disponible unos días después de aplicar la optimización.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Section */}
        {hasCompletedRun && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent-blue" />
                Curvas de respuesta por campaña
              </h2>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 disabled:opacity-50 transition-colors"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-3 h-3" />
                    {curves ? "Re-analizar" : "Analizar curvas"}
                  </>
                )}
              </button>
            </div>

            {analyzeError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-4">
                <p className="text-xs text-red-400">{analyzeError}</p>
              </div>
            )}

            {curves && curves.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {curves.map((curve) => {
                  // Find suggested budget from moderate solution
                  const moderateSolution = latestRun.solutions?.find(
                    (s) => s.strategy === "moderate"
                  )
                  const suggestedAlloc = (
                    moderateSolution?.allocations as CampaignAllocation[] | undefined
                  )?.find((a) => a.campaign_id === curve.campaign_id)

                  return (
                    <PowerLawChart
                      key={curve.campaign_id}
                      curve={curve.curve}
                      currentBudget={curve.current_budget}
                      suggestedBudget={suggestedAlloc?.recommended_budget}
                      campaignName={curve.campaign_name}
                      w1={curve.w1}
                      rSquared={curve.r_squared}
                    />
                  )
                })}
              </div>
            )}

            {!curves && !analyzing && !analyzeError && (
              <div className="bg-background-elevated border border-border rounded-xl p-8 text-center">
                <BarChart3 className="w-8 h-8 mx-auto text-text-muted mb-2" />
                <p className="text-xs text-text-muted">
                  Hacé clic en &quot;Analizar curvas&quot; para ver las curvas de respuesta de cada campaña.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Elasticity History */}
        {elasticityHistory && elasticityHistory.length > 0 && (
          <ElasticityHistoryChart campaigns={elasticityHistory} />
        )}

        {/* Run history */}
        {runs.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3">Historial de optimizaciones</h2>
            <div className="bg-background-elevated border border-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Fecha</th>
                    <th className="text-left text-xs font-medium text-text-muted px-5 py-3">Estado</th>
                    <th className="text-right text-xs font-medium text-text-muted px-5 py-3">Presupuesto</th>
                    <th className="text-right text-xs font-medium text-text-muted px-5 py-3">Campañas</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-border/50">
                      <td className="px-5 py-3 text-sm text-text-primary">
                        {new Date(run.started_at).toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3">
                        <RunStatusBadge status={run.status} />
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-text-primary">
                        {run.total_budget ? formatCurrency(run.total_budget) : "—"}
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-text-muted">
                        {run.campaigns_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function SolutionCard({
  solution,
  expanded,
  onToggleExpand,
  onApply,
  applying,
}: {
  solution: OptimizationSolution
  expanded: boolean
  onToggleExpand: () => void
  onApply: () => void
  applying: boolean
}) {
  const config = strategyConfig[solution.strategy]
  const Icon = config.icon
  const allocations = (solution.allocations ?? []) as CampaignAllocation[]

  return (
    <div
      className={cn(
        "border rounded-xl p-5",
        config.borderColor,
        config.bgColor
      )}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-5 h-5", config.color)} />
        <h3 className={cn("text-sm font-semibold", config.color)}>
          {config.label}
        </h3>
        {solution.is_applied && (
          <span className="ml-auto text-[10px] font-medium bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
            Aplicada
          </span>
        )}
      </div>
      <p className="text-xs text-text-muted mb-4">{config.description}</p>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-text-muted">Presupuesto total</span>
          <span className="text-text-primary font-medium">
            {formatCurrency(solution.total_budget)}
          </span>
        </div>
        {solution.expected_roas != null && (
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">ROAS esperado</span>
            <span className="text-text-primary font-medium">
              {solution.expected_roas.toFixed(2)}x
            </span>
          </div>
        )}
        {solution.expected_conversion_value != null && (
          <div className="flex justify-between text-xs">
            <span className="text-text-muted">Valor esperado</span>
            <span className="text-text-primary font-medium">
              {formatCurrency(solution.expected_conversion_value)}
            </span>
          </div>
        )}
      </div>

      {/* Allocations toggle */}
      {allocations.length > 0 && (
        <button
          onClick={onToggleExpand}
          className="w-full mt-3 flex items-center justify-center gap-1 text-[10px] text-text-muted hover:text-text-secondary transition-colors"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Ocultar" : "Ver"} {allocations.length} campañas
        </button>
      )}

      {/* Expanded allocations with model diagnostics */}
      {expanded && allocations.length > 0 && (
        <div className="mt-3 space-y-2">
          {allocations.map((a) => (
            <div key={a.campaign_id} className="bg-black/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-medium text-text-primary truncate max-w-[60%]">
                  {a.campaign_name}
                </span>
                <span className={cn(
                  "text-[10px] font-medium",
                  a.change_percent > 0 ? "text-green-400" : a.change_percent < 0 ? "text-red-400" : "text-text-muted"
                )}>
                  {formatPercent(a.change_percent)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-text-muted">
                <span>{formatCurrency(a.current_budget)}</span>
                <ArrowRight className="w-2.5 h-2.5" />
                <span className="text-text-primary font-medium">{formatCurrency(a.recommended_budget)}</span>
              </div>
              {/* Model diagnostics */}
              {(a.elasticity != null || a.r_squared != null) && (
                <div className="flex gap-3 mt-1.5">
                  {a.elasticity != null && (
                    <span className="text-[9px] text-text-muted" title="Elasticidad: por cada 1% más de presupuesto, se espera este % más de volumen">
                      w₁={a.elasticity.toFixed(2)}
                    </span>
                  )}
                  {a.r_squared != null && (
                    <span className={cn(
                      "text-[9px]",
                      a.r_squared > 0.8 ? "text-green-400" : a.r_squared > 0.5 ? "text-yellow-400" : "text-red-400"
                    )} title="Bondad de ajuste del modelo">
                      R²={a.r_squared.toFixed(2)}
                    </span>
                  )}
                  {a.fit_method && (
                    <span className="text-[9px] text-text-muted">
                      {a.fit_method === "ols" ? "OLS" : "Bayesian"}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Apply button */}
      {solution.is_applied ? (
        <div className="w-full mt-4 py-2 rounded-lg text-xs font-medium text-center text-green-400/60">
          Aplicada el {new Date(solution.applied_at!).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
        </div>
      ) : (
        <button
          onClick={onApply}
          disabled={applying}
          className={cn(
            "w-full mt-4 py-2 rounded-lg text-xs font-medium border transition-colors",
            config.buttonColor,
            applying && "opacity-50 cursor-not-allowed"
          )}
        >
          {applying ? (
            <span className="flex items-center justify-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Aplicando...
            </span>
          ) : (
            "Aplicar esta estrategia"
          )}
        </button>
      )}
    </div>
  )
}

function RunStatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: typeof Clock; label: string; className: string }> = {
    pending: { icon: Clock, label: "Pendiente", className: "text-text-muted" },
    running: { icon: Loader2, label: "Ejecutando", className: "text-accent-blue" },
    completed: { icon: CheckCircle2, label: "Completado", className: "text-green-400" },
    failed: { icon: XCircle, label: "Fallido", className: "text-red-400" },
  }
  const c = config[status] ?? config.pending
  const StatusIcon = c.icon
  return (
    <span className={cn("flex items-center gap-1 text-xs", c.className)}>
      <StatusIcon className={cn("w-3.5 h-3.5", status === "running" && "animate-spin")} />
      {c.label}
    </span>
  )
}
