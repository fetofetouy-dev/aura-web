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
} from "recharts"
import type { CampaignAllocation, OptimizationSolution } from "@/lib/types"

interface StrategyComparisonChartProps {
  solutions: OptimizationSolution[]
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`
  return value.toFixed(0)
}

const strategyLabels: Record<string, string> = {
  conservative: "Conservadora",
  moderate: "Moderada",
  aggressive: "Agresiva",
}

const strategyColors: Record<string, string> = {
  current: "#6b7280",
  conservative: "#22c55e",
  moderate: "#eab308",
  aggressive: "#ef4444",
}

export function StrategyComparisonChart({ solutions }: StrategyComparisonChartProps) {
  // Get all campaign names from the first solution
  const sorted = [...solutions].sort((a, b) => {
    const order = { conservative: 0, moderate: 1, aggressive: 2 }
    return (order[a.strategy] ?? 0) - (order[b.strategy] ?? 0)
  })

  if (sorted.length === 0 || !sorted[0].allocations?.length) return null

  // Build chart data: one row per campaign
  const campaigns = sorted[0].allocations as CampaignAllocation[]
  const data = campaigns.map((alloc) => {
    const row: Record<string, string | number> = {
      name: alloc.campaign_name.length > 20
        ? alloc.campaign_name.substring(0, 18) + "..."
        : alloc.campaign_name,
      Actual: alloc.current_budget,
    }

    for (const sol of sorted) {
      const matching = (sol.allocations as CampaignAllocation[]).find(
        (a) => a.campaign_id === alloc.campaign_id
      )
      if (matching) {
        row[strategyLabels[sol.strategy] ?? sol.strategy] = matching.recommended_budget
      }
    }

    return row
  })

  return (
    <div className="bg-background-elevated border border-border rounded-xl p-4">
      <h3 className="text-xs font-semibold text-text-primary mb-4">
        Comparación de estrategias por campaña
      </h3>
      <ResponsiveContainer width="100%" height={Math.max(200, campaigns.length * 50)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            type="number"
            tickFormatter={formatCompact}
            tick={{ fontSize: 10, fill: "#888" }}
            stroke="#444"
          />
          <YAxis
            dataKey="name"
            type="category"
            tick={{ fontSize: 10, fill: "#888" }}
            stroke="#444"
            width={120}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: number) => [`$${formatCompact(value)}`, ""]) as any}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, color: "#888" }}
          />
          <Bar dataKey="Actual" fill={strategyColors.current} barSize={8} radius={[0, 2, 2, 0]} />
          <Bar dataKey="Conservadora" fill={strategyColors.conservative} barSize={8} radius={[0, 2, 2, 0]} />
          <Bar dataKey="Moderada" fill={strategyColors.moderate} barSize={8} radius={[0, 2, 2, 0]} />
          <Bar dataKey="Agresiva" fill={strategyColors.aggressive} barSize={8} radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
