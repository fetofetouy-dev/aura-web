"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ReferenceDot,
  ResponsiveContainer,
  ComposedChart,
} from "recharts"

interface PowerLawCurvePoint {
  cost: number
  volume: number
  volume_lower: number
  volume_upper: number
}

interface PowerLawChartProps {
  curve: PowerLawCurvePoint[]
  currentBudget: number
  suggestedBudget?: number
  campaignName: string
  w1: number
  rSquared: number
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

export function PowerLawChart({
  curve,
  currentBudget,
  suggestedBudget,
  campaignName,
  w1,
  rSquared,
}: PowerLawChartProps) {
  // Find volume at current and suggested budgets (interpolate from curve)
  const findVolume = (budget: number) => {
    const closest = curve.reduce((prev, curr) =>
      Math.abs(curr.cost - budget) < Math.abs(prev.cost - budget) ? curr : prev
    )
    return closest.volume
  }

  const currentVolume = findVolume(currentBudget)
  const suggestedVolume = suggestedBudget ? findVolume(suggestedBudget) : undefined

  return (
    <div className="bg-background-elevated border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-medium text-text-primary truncate max-w-[60%]">
          {campaignName}
        </h4>
        <div className="flex gap-3">
          <span className="text-[10px] text-text-muted">
            w₁={w1.toFixed(2)}
          </span>
          <span className={`text-[10px] ${rSquared > 0.8 ? "text-green-400" : rSquared > 0.5 ? "text-yellow-400" : "text-red-400"}`}>
            R²={rSquared.toFixed(2)}
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={curve} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="cost"
            tickFormatter={formatCompact}
            tick={{ fontSize: 10, fill: "#888" }}
            stroke="#444"
          />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fontSize: 10, fill: "#888" }}
            stroke="#444"
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
            labelFormatter={(v) => `Costo: $${formatCompact(Number(v))}`}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: number, name: string) => {
              const labels: Record<string, string> = {
                volume: "Volumen",
                volume_lower: "Mín (95%)",
                volume_upper: "Máx (95%)",
              }
              return [`$${formatCompact(value)}`, labels[name] ?? name]
            }) as any}
          />

          {/* Confidence band */}
          <Area
            type="monotone"
            dataKey="volume_upper"
            stroke="none"
            fill="#3b82f6"
            fillOpacity={0.08}
          />
          <Area
            type="monotone"
            dataKey="volume_lower"
            stroke="none"
            fill="#0a0a1a"
            fillOpacity={1}
          />

          {/* Main curve */}
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
          />

          {/* Current budget point */}
          <ReferenceDot
            x={currentBudget}
            y={currentVolume}
            r={5}
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth={2}
          />

          {/* Suggested budget point */}
          {suggestedBudget && suggestedVolume && (
            <ReferenceDot
              x={suggestedBudget}
              y={suggestedVolume}
              r={5}
              fill="#10b981"
              stroke="#10b981"
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] text-text-muted">Actual: ${formatCompact(currentBudget)}</span>
        </div>
        {suggestedBudget && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-text-muted">Sugerido: ${formatCompact(suggestedBudget)}</span>
          </div>
        )}
      </div>
    </div>
  )
}
