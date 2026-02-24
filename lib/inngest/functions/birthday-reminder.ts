import { inngest } from "@/lib/inngest"
import { supabaseAdmin } from "@/lib/supabase-server"
import { refreshAccessToken, sendGmail } from "@/lib/google-client"
import { logInteraction } from "@/lib/interactions"
import { birthdayEmail } from "@/lib/email-templates"

export const birthdayReminderFunction = inngest.createFunction(
  {
    id: "birthday-reminder",
    name: "Birthday Reminder — Email de cumpleaños",
    retries: 1,
  },
  { cron: "0 8 * * *" }, // Every day at 8am UTC
  async ({ step }) => {
    // Fetch all customers with a birthday matching today (month + day)
    const customers = await step.run("fetch-birthday-customers", async () => {
      const { data } = await supabaseAdmin
        .from("customers")
        .select("id, tenant_id, name, email, birthday")
        .not("birthday", "is", null)
        .not("email", "is", null)
        .filter("birthday", "not.is", null)

      if (!data) return []

      const today = new Date()
      const todayMonth = today.getUTCMonth() + 1
      const todayDay = today.getUTCDate()

      return data.filter((c) => {
        if (!c.birthday) return false
        const [, mm, dd] = c.birthday.split("-").map(Number)
        return mm === todayMonth && dd === todayDay
      })
    })

    if (customers.length === 0) {
      return { sent: 0, message: "No birthday customers today" }
    }

    // Group by tenant to fetch credentials once per tenant
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

      // Create a single execution log for this tenant's batch
      const execution = await step.run(`create-execution-log-${tenantId}`, async () => {
        const { data } = await supabaseAdmin
          .from("automation_executions")
          .insert({
            tenant_id: tenantId,
            automation_type: "birthday-reminder",
            status: "running",
            trigger: "cron",
            trigger_source: "daily_cron",
            metadata: {
              date: new Date().toISOString().split("T")[0],
              customerCount: tenantCustomers.length,
            },
          })
          .select("id")
          .single()
        return data
      })

      // Fetch Google credentials for this tenant
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

      // Refresh access token once per tenant
      const { accessToken } = await step.run(`refresh-token-${tenantId}`, async () => {
        return refreshAccessToken(creds.refresh_token)
      })

      // Send birthday email to each customer
      const results: Array<{ customerId: string; messageId?: string; error?: string }> = []

      for (const customer of tenantCustomers) {
        const result = await step.run(`send-birthday-email-${customer.id}`, async () => {
          try {
            const { messageId } = await sendGmail(accessToken, birthdayEmail(customer.name, customer.email))

            await logInteraction({
              tenantId,
              customerId: customer.id,
              type: "email_sent",
              metadata: { automation: "birthday-reminder", messageId, to: customer.email },
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
              title: `Email a cliente ${r.customerId}`,
              status: r.messageId ? "SUCCESS" : "FAILED",
              messageId: r.messageId,
              error: r.error,
            })),
          })
          .eq("id", execution?.id ?? "")

        // Update automation stats
        if (sentCount > 0) {
          await supabaseAdmin
            .rpc("increment_automation_stats", {
              p_tenant_id: tenantId,
              p_type: "birthday-reminder",
              p_success: true,
            })
            .maybeSingle()
        }
      })
    }

    return { sent: totalSent, failed: totalFailed }
  }
)
