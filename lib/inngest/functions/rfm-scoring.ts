import { inngest } from "@/lib/inngest"
import { supabaseAdmin } from "@/lib/supabase-server"
import { computeRFM, segmentLabel } from "@/lib/rfm"
import type { CustomerSegment } from "@/lib/types"

export const rfmScoringFunction = inngest.createFunction(
  {
    id: "rfm-scoring",
    name: "RFM Scoring — Segmentacion diaria de clientes",
    retries: 1,
  },
  { cron: "0 2 * * *" }, // Every day at 2am UTC (before other automations)
  async ({ step }) => {
    // Get all distinct tenant_ids that have customers
    const tenantIds = await step.run("fetch-tenants", async () => {
      const { data } = await supabaseAdmin
        .from("customers")
        .select("tenant_id")
      if (!data) return []
      return Array.from(new Set(data.map((c) => c.tenant_id)))
    })

    if (tenantIds.length === 0) {
      return { processed: 0, message: "No tenants with customers" }
    }

    let totalScored = 0
    let totalAlerts = 0

    for (const tenantId of tenantIds) {
      const result = await step.run(`score-tenant-${tenantId}`, async () => {
        // Fetch tenant profile for industry-specific thresholds
        const { data: profile } = await supabaseAdmin
          .from("tenant_profiles")
          .select("business_type")
          .eq("id", tenantId)
          .single()

        const industry = profile?.business_type ?? null

        // Fetch all customers for this tenant
        const { data: customers } = await supabaseAdmin
          .from("customers")
          .select("id, name, segment")
          .eq("tenant_id", tenantId)

        if (!customers || customers.length === 0) return { scored: 0, alerts: 0 }

        const customerIds = customers.map((c) => c.id)
        const now = new Date()
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

        // Fetch interaction aggregates for all customers in one query
        const { data: interactions } = await supabaseAdmin
          .from("interactions")
          .select("customer_id, type, value, created_at")
          .eq("tenant_id", tenantId)
          .in("customer_id", customerIds)

        // Build per-customer aggregates
        const customerData: Record<string, {
          lastInteraction: Date | null
          count90d: number
          totalPayments: number
        }> = {}

        for (const cid of customerIds) {
          customerData[cid] = { lastInteraction: null, count90d: 0, totalPayments: 0 }
        }

        for (const interaction of interactions ?? []) {
          const d = customerData[interaction.customer_id]
          if (!d) continue

          const createdAt = new Date(interaction.created_at)

          // Track most recent interaction
          if (!d.lastInteraction || createdAt > d.lastInteraction) {
            d.lastInteraction = createdAt
          }

          // Count interactions in last 90 days
          if (createdAt >= ninetyDaysAgo) {
            d.count90d++
          }

          // Sum payment values
          if (interaction.type === "payment_received" && interaction.value) {
            d.totalPayments += interaction.value
          }
        }

        // Compute RFM scores and update customers
        let scored = 0
        let alerts = 0
        const updates: Array<{
          id: string
          segment: CustomerSegment
          rfm_recency: number
          rfm_frequency: number
          rfm_monetary: number
          rfm_score: number
          rfm_updated_at: string
        }> = []

        const alertsToCreate: Array<{
          tenant_id: string
          customer_id: string
          type: string
          severity: string
          title: string
          description: string
          suggested_action: string
        }> = []

        for (const customer of customers) {
          const d = customerData[customer.id]
          const daysSince = d.lastInteraction
            ? Math.floor((now.getTime() - d.lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
            : null

          const rfm = computeRFM(
            {
              daysSinceLastInteraction: daysSince,
              interactionCount90d: d.count90d,
              totalPaymentValue: d.totalPayments,
            },
            industry
          )

          updates.push({
            id: customer.id,
            segment: rfm.segment,
            rfm_recency: rfm.recency,
            rfm_frequency: rfm.frequency,
            rfm_monetary: rfm.monetary,
            rfm_score: rfm.score,
            rfm_updated_at: now.toISOString(),
          })
          scored++

          // Check for segment downgrade → create alert
          const oldSegment = customer.segment as CustomerSegment
          if (oldSegment && oldSegment !== "unknown" && oldSegment !== rfm.segment) {
            const isDowngrade = isSegmentDowngrade(oldSegment, rfm.segment)
            if (isDowngrade) {
              const severity = rfm.segment === "lost" ? "critical"
                : rfm.segment === "at_risk" ? "high"
                : "medium"

              alertsToCreate.push({
                tenant_id: tenantId,
                customer_id: customer.id,
                type: rfm.segment === "at_risk" || rfm.segment === "lost"
                  ? "churn_risk"
                  : "segment_downgrade",
                severity,
                title: `${customer.name} paso de ${segmentLabel(oldSegment)} a ${segmentLabel(rfm.segment)}`,
                description: `Recencia: ${rfm.recency}/5, Frecuencia: ${rfm.frequency}/5, Monetario: ${rfm.monetary}/5. ${daysSince !== null ? `Ultima interaccion hace ${daysSince} dias.` : "Sin interacciones registradas."}`,
                suggested_action: rfm.segment === "at_risk"
                  ? "Enviar email de reactivacion con descuento personalizado"
                  : rfm.segment === "lost"
                  ? "Evaluar si vale la pena una campaña de recuperacion"
                  : "Revisar actividad reciente del cliente",
              })
              alerts++
            }
          }
        }

        // Batch update customers
        for (const update of updates) {
          await supabaseAdmin
            .from("customers")
            .update({
              segment: update.segment,
              rfm_recency: update.rfm_recency,
              rfm_frequency: update.rfm_frequency,
              rfm_monetary: update.rfm_monetary,
              rfm_score: update.rfm_score,
              rfm_updated_at: update.rfm_updated_at,
            })
            .eq("id", update.id)
        }

        // Create alerts
        if (alertsToCreate.length > 0) {
          await supabaseAdmin
            .from("customer_alerts")
            .insert(alertsToCreate)
        }

        return { scored, alerts }
      })

      totalScored += result.scored
      totalAlerts += result.alerts
    }

    return { totalScored, totalAlerts, tenantsProcessed: tenantIds.length }
  }
)

const SEGMENT_RANK: Record<string, number> = {
  champion: 6,
  loyal: 5,
  new: 4,
  dormant: 3,
  at_risk: 2,
  lost: 1,
  unknown: 0,
}

function isSegmentDowngrade(from: CustomerSegment, to: CustomerSegment): boolean {
  return (SEGMENT_RANK[from] ?? 0) > (SEGMENT_RANK[to] ?? 0)
}
