import { inngest } from "@/lib/inngest"
import { supabaseAdmin } from "@/lib/supabase-server"
import { refreshAccessToken, sendGmail } from "@/lib/google-client"
import { logInteraction } from "@/lib/interactions"
import { reactivationEmail } from "@/lib/email-templates"

/**
 * Default inactivity threshold in days.
 * Customers with no interaction for this long are considered inactive.
 * TODO: Make configurable per tenant when settings UI exists.
 */
const INACTIVITY_DAYS = 60

export const reactivationReminderFunction = inngest.createFunction(
  {
    id: "reactivation-reminder",
    name: "Reactivation Reminder — Clientes inactivos",
    retries: 1,
  },
  { cron: "0 9 * * *" }, // Every day at 9am UTC (after birthday emails at 8am)
  async ({ step }) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - INACTIVITY_DAYS)
    const cutoffISO = cutoffDate.toISOString()

    // Fetch customers whose last interaction is older than the threshold
    // and who haven't already received a reactivation email recently (within 30 days)
    const customers = await step.run("fetch-inactive-customers", async () => {
      // Get customers with old or null last_interaction_at
      const { data } = await supabaseAdmin
        .from("customers")
        .select("id, tenant_id, name, email, last_interaction_at")
        .not("email", "is", null)
        .or(`last_interaction_at.is.null,last_interaction_at.lt.${cutoffISO}`)

      if (!data) return []

      // Filter out customers who received a reactivation email in the last 30 days
      const recentCutoff = new Date()
      recentCutoff.setDate(recentCutoff.getDate() - 30)

      const customerIds = data.map((c) => c.id)
      if (customerIds.length === 0) return []

      const { data: recentEmails } = await supabaseAdmin
        .from("interactions")
        .select("customer_id")
        .in("customer_id", customerIds)
        .eq("type", "email_sent")
        .gte("created_at", recentCutoff.toISOString())
        .contains("metadata", { automation: "reactivation-reminder" })

      const recentlyEmailed = new Set(recentEmails?.map((r) => r.customer_id) ?? [])

      return data.filter((c) => !recentlyEmailed.has(c.id))
    })

    if (customers.length === 0) {
      return { sent: 0, message: "No inactive customers to reactivate" }
    }

    // Group by tenant
    const byTenant = customers.reduce<Record<string, typeof customers>>(
      (acc, c) => {
        if (!acc[c.tenant_id]) acc[c.tenant_id] = []
        acc[c.tenant_id].push(c)
        return acc
      },
      {}
    )

    let totalSent = 0
    let totalFailed = 0

    for (const [tenantId, tenantCustomers] of Object.entries(byTenant)) {
      const startedAt = Date.now()

      // Create execution log
      const execution = await step.run(`create-execution-log-${tenantId}`, async () => {
        const { data } = await supabaseAdmin
          .from("automation_executions")
          .insert({
            tenant_id: tenantId,
            automation_type: "reactivation-reminder",
            status: "running",
            trigger: "cron",
            trigger_source: "daily_cron",
            metadata: {
              date: new Date().toISOString().split("T")[0],
              customerCount: tenantCustomers.length,
              inactivityDays: INACTIVITY_DAYS,
            },
          })
          .select("id")
          .single()
        return data
      })

      // Fetch Google credentials
      const creds = await step.run(`fetch-google-credentials-${tenantId}`, async () => {
        const { data } = await supabaseAdmin
          .from("google_credentials")
          .select("refresh_token")
          .eq("tenant_id", tenantId)
          .single()
        return data
      })

      if (!creds?.refresh_token) {
        await supabaseAdmin
          .from("automation_executions")
          .update({
            status: "failed",
            error: "Gmail no conectado",
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - startedAt,
            steps: [{ title: "Verificar Gmail", status: "FAILED", duration: 100 }],
          })
          .eq("id", execution?.id ?? "")

        totalFailed += tenantCustomers.length
        continue
      }

      // Refresh access token
      const { accessToken } = await step.run(`refresh-token-${tenantId}`, async () => {
        return refreshAccessToken(creds.refresh_token)
      })

      // Send reactivation email to each inactive customer
      const results: Array<{ customerId: string; messageId?: string; error?: string }> = []

      for (const customer of tenantCustomers) {
        const result = await step.run(`send-reactivation-email-${customer.id}`, async () => {
          try {
            // Calculate days since last interaction
            const lastDate = customer.last_interaction_at
              ? new Date(customer.last_interaction_at)
              : null
            const daysSince = lastDate
              ? Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
              : INACTIVITY_DAYS

            const { messageId } = await sendGmail(
              accessToken,
              reactivationEmail(customer.name, customer.email!, daysSince)
            )

            await logInteraction({
              tenantId,
              customerId: customer.id,
              type: "email_sent",
              metadata: { automation: "reactivation-reminder", messageId, to: customer.email, daysSince },
            })

            return { customerId: customer.id, messageId }
          } catch (err) {
            return { customerId: customer.id, error: String(err) }
          }
        })

        results.push(result)
      }

      const sentCount = results.filter((r) => r.messageId).length
      const failedCount = results.filter((r) => r.error).length
      totalSent += sentCount
      totalFailed += failedCount

      // Update execution log
      await step.run(`update-execution-log-${tenantId}`, async () => {
        await supabaseAdmin
          .from("automation_executions")
          .update({
            status: failedCount === tenantCustomers.length ? "failed" : "success",
            completed_at: new Date().toISOString(),
            duration_ms: Date.now() - startedAt,
            steps: results.map((r) => ({
              title: `Email reactivación a ${r.customerId}`,
              status: r.messageId ? "SUCCESS" : "FAILED",
              messageId: r.messageId,
              error: r.error,
            })),
          })
          .eq("id", execution?.id ?? "")

        if (sentCount > 0) {
          await supabaseAdmin
            .rpc("increment_automation_stats", {
              p_tenant_id: tenantId,
              p_type: "reactivation-reminder",
              p_success: true,
            })
            .maybeSingle()
        }
      })
    }

    return { sent: totalSent, failed: totalFailed }
  }
)
