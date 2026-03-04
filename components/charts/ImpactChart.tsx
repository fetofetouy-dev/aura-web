"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts"

import type { ImpactMetrics } from "@/lib/types"

interface ImpactChartProps {
  impact: ImpactMetrics
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(1)
}

export function ImpactChart({ impact }: ImpactChartProps) {
  const data = [
    {
      metric: "Gasto",
      Antes: impact.before.cost,
      Después: impact.after.cost,
      delta: impact.delta_pct.cost,
    },
    {
      metric: "Conversiones",
      Antes: impact.before.conversions,
      Después: impact.after.conversions,
      delta: impact.delta_pct.conversions,
    },
    {
      metric: "ROAS",
      Antes: impact.before.roas,
      Después: impact.after.roas,
      delta: impact.delta_pct.roas,
    },
  ]

  return (
    <div className="bg-background-elevated border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-text-primary">
          Impacto de la optimización ({impact.period_days} días)
        </h3>
        <div className="flex gap-3">
          {data.map((d) => (
            <span
              key={d.metric}
              className={`text-[10px] font-medium ${d.delta > 0 ? "text-green-400" : d.delta < 0 ? "text-red-400" : "text-text-muted"}`}
            >
              {d.metric}: {d.delta >= 0 ? "+" : ""}{(d.delta * 100).toFixed(1)}%
            </span>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="metric"
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: number, name: string) => [formatCompact(value), name]) as any}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: "#888" }} />
          <Bar dataKey="Antes" fill="#6b7280" barSize={20} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Después" barSize={20} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.delta > 0 ? "#22c55e" : entry.delta < 0 ? "#ef4444" : "#eab308"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
