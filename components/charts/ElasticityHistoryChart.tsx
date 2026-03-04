"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export interface ElasticityHistoryData {
  campaign_id: string
  campaign_name: string
  points: Array<{ date: string; w1: number; r_squared: number }>
}

interface ElasticityHistoryChartProps {
  campaigns: ElasticityHistoryData[]
}

const COLORS = ["#3b82f6", "#22c55e", "#eab308", "#ef4444", "#a855f7", "#06b6d4", "#f97316", "#ec4899"]

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
}

export function ElasticityHistoryChart({ campaigns }: ElasticityHistoryChartProps) {
  if (campaigns.length === 0) return null

  // Build unified timeline: one row per date, columns per campaign
  const allDates = new Set<string>()
  for (const c of campaigns) {
    for (const p of c.points) {
      allDates.add(p.date)
    }
  }

  const sortedDates = Array.from(allDates).sort()

  const data = sortedDates.map((date) => {
    const row: Record<string, string | number> = { date: formatDate(date) }
    for (const c of campaigns) {
      const point = c.points.find((p) => p.date === date)
      if (point) {
        const label = c.campaign_name.length > 20
          ? c.campaign_name.substring(0, 18) + "..."
          : c.campaign_name
        row[label] = Number(point.w1.toFixed(3))
      }
    }
    return row
  })

  const campaignLabels = campaigns.map((c) =>
    c.campaign_name.length > 20 ? c.campaign_name.substring(0, 18) + "..." : c.campaign_name
  )

  return (
    <div className="bg-background-elevated border border-border rounded-xl p-4">
      <h3 className="text-xs font-semibold text-text-primary mb-1">
        Historial de elasticidades (w₁)
      </h3>
      <p className="text-[10px] text-text-muted mb-4">
        Evolución de la elasticidad de cada campaña a lo largo de las optimizaciones
      </p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#888" }}
            stroke="#444"
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 10, fill: "#888" }}
            stroke="#444"
            tickFormatter={(v: number) => v.toFixed(1)}
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: "#888" }} />
          {campaignLabels.map((label, i) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
