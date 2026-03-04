import type { CustomerSegment } from "@/lib/types"

/**
 * Industry-specific thresholds for Recency scoring.
 * "days" array maps to scores 5,4,3,2,1 (e.g. for 'clinica', <30 days = 5, <60 = 4, etc.)
 */
const RECENCY_THRESHOLDS: Record<string, number[]> = {
  clinica:     [30, 60, 90, 150],   // visits every ~3 months
  peluqueria:  [15, 30, 60, 90],    // visits every ~month
  comercio:    [20, 45, 75, 120],   // moderate frequency
  estudio:     [30, 60, 90, 150],   // similar to clinica
  default:     [20, 45, 75, 120],
}

/**
 * Frequency thresholds: interactions in last 90 days → score 1-5
 */
const FREQUENCY_THRESHOLDS = [1, 3, 6, 10] // >=10→5, >=6→4, >=3→3, >=1→2, 0→1

/**
 * Monetary thresholds: total payment value → score 1-5
 * These are generic; in the future, calibrate per-industry.
 */
const MONETARY_THRESHOLDS = [1000, 5000, 15000, 50000] // ARS

function scoreFromThresholds(value: number, thresholds: number[], inverted = false): number {
  if (inverted) {
    // Lower value = higher score (for recency: fewer days since last visit = better)
    for (let i = 0; i < thresholds.length; i++) {
      if (value <= thresholds[i]) return 5 - i
    }
    return 1
  }
  // Higher value = higher score
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) return 5 - (thresholds.length - 1 - i)
  }
  return 1
}

export interface RFMInput {
  daysSinceLastInteraction: number | null
  interactionCount90d: number
  totalPaymentValue: number
}

export interface RFMResult {
  recency: number
  frequency: number
  monetary: number
  score: number       // R*100 + F*10 + M
  segment: CustomerSegment
}

export function computeRFM(input: RFMInput, industry: string | null): RFMResult {
  const thresholds = RECENCY_THRESHOLDS[industry ?? "default"] ?? RECENCY_THRESHOLDS.default

  const recency = input.daysSinceLastInteraction === null
    ? 1
    : scoreFromThresholds(input.daysSinceLastInteraction, thresholds, true)

  const frequency = scoreFromThresholds(input.interactionCount90d, FREQUENCY_THRESHOLDS)
  const monetary = scoreFromThresholds(input.totalPaymentValue, MONETARY_THRESHOLDS)

  const score = recency * 100 + frequency * 10 + monetary
  const segment = classifySegment(recency, frequency, monetary)

  return { recency, frequency, monetary, score, segment }
}

function classifySegment(r: number, f: number, m: number): CustomerSegment {
  // Champion: high across the board
  if (r >= 4 && f >= 4 && m >= 4) return "champion"

  // Loyal: good frequency and monetary, regardless of recency
  if (f >= 3 && m >= 3) {
    // But if recency is low, they're at risk
    if (r <= 2) return "at_risk"
    return "loyal"
  }

  // At Risk: was active (good F), but hasn't come recently
  if (r <= 2 && f >= 3) return "at_risk"

  // New: recent but low frequency (first-timers)
  if (r >= 4 && f <= 1) return "new"

  // Dormant: low recency, low frequency
  if (r <= 2 && f <= 2) {
    // Lost if truly gone
    if (r === 1 && f <= 1) return "lost"
    return "dormant"
  }

  // Default for middle-ground cases
  if (r >= 3) return "loyal"
  return "dormant"
}

export function segmentLabel(segment: CustomerSegment): string {
  const labels: Record<CustomerSegment, string> = {
    champion: "Champion",
    loyal: "Leal",
    at_risk: "En riesgo",
    dormant: "Dormido",
    new: "Nuevo",
    lost: "Perdido",
    unknown: "Sin datos",
  }
  return labels[segment] ?? segment
}

export function segmentColor(segment: CustomerSegment): string {
  const colors: Record<CustomerSegment, string> = {
    champion: "bg-emerald-400/10 text-emerald-400",
    loyal: "bg-accent-blue/10 text-accent-blue",
    at_risk: "bg-amber-400/10 text-amber-400",
    dormant: "bg-orange-400/10 text-orange-400",
    new: "bg-violet-400/10 text-violet-400",
    lost: "bg-red-400/10 text-red-400",
    unknown: "bg-white/5 text-text-muted",
  }
  return colors[segment] ?? colors.unknown
}
