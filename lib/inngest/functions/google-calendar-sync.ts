import { inngest } from "@/lib/inngest"
import { supabaseAdmin } from "@/lib/supabase-server"
import { refreshAccessToken, getCalendarEvents } from "@/lib/google-client"
import { logInteraction } from "@/lib/interactions"

export const googleCalendarSyncFunction = inngest.createFunction(
  {
    id: "google-calendar-sync",
    name: "Google Calendar Sync — Importar citas y clientes",
    retries: 1,
  },
  { cron: "*/15 * * * *" }, // Every 15 minutes
  async ({ step }) => {
    // Fetch all tenants with Google credentials
    const tenants = await step.run("fetch-tenants-with-google", async () => {
      const { data } = await supabaseAdmin
        .from("google_credentials")
        .select("tenant_id, refresh_token, user_email")
        .not("refresh_token", "is", null)
      return data ?? []
    })

    if (tenants.length === 0) {
      return { synced: 0, message: "No tenants with Google credentials" }
    }

    let totalCreated = 0
    let totalUpdated = 0

    for (const tenant of tenants) {
      const syncLogId = await step.run(`create-sync-log-${tenant.tenant_id}`, async () => {
        const { data } = await supabaseAdmin
          .from("sync_logs")
          .insert({
            tenant_id: tenant.tenant_id,
            connector: "google-calendar",
            status: "running",
          })
          .select("id")
          .single()
        return data?.id
      })

      try {
        // Refresh access token
        const { accessToken } = await step.run(`refresh-token-${tenant.tenant_id}`, async () => {
          return refreshAccessToken(tenant.refresh_token)
        })

        // Fetch events for next 7 days
        const events = await step.run(`fetch-events-${tenant.tenant_id}`, async () => {
          const now = new Date()
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          return getCalendarEvents(accessToken, {
            timeMin: now.toISOString(),
            timeMax: weekFromNow.toISOString(),
            maxResults: 100,
          })
        })

        // Process events: create/update customers and appointments
        const result = await step.run(`process-events-${tenant.tenant_id}`, async () => {
          let created = 0
          let updated = 0
          const tenantEmail = tenant.user_email?.toLowerCase()

          for (const event of events) {
            // Skip events without attendees (personal blocks, reminders)
            if (!event.attendees || event.attendees.length === 0) continue
            // Skip cancelled events
            if (event.status === "cancelled") continue

            // Find attendees that are NOT the tenant
            const externalAttendees = event.attendees.filter(
              (a) => a.email.toLowerCase() !== tenantEmail
            )
            if (externalAttendees.length === 0) continue

            // Process each external attendee
            for (const attendee of externalAttendees) {
              // Upsert customer
              const { data: customer, status: httpStatus } = await supabaseAdmin
                .from("customers")
                .upsert(
                  {
                    tenant_id: tenant.tenant_id,
                    name: attendee.displayName || attendee.email.split("@")[0],
                    email: attendee.email.toLowerCase(),
                    source: "connector:google-calendar",
                  },
                  { onConflict: "tenant_id,email", ignoreDuplicates: false }
                )
                .select("id")
                .single()

              if (!customer) continue

              if (httpStatus === 201) created++
              else updated++

              // Parse event date/time
              const startDT = new Date(event.start)
              const endDT = new Date(event.end)
              const date = startDT.toISOString().split("T")[0]
              const startTime = startDT.toTimeString().slice(0, 5)
              const endTime = endDT.toTimeString().slice(0, 5)

              // Upsert appointment (dedup by external_id)
              const { status: apptStatus } = await supabaseAdmin
                .from("appointments")
                .upsert(
                  {
                    tenant_id: tenant.tenant_id,
                    customer_id: customer.id,
                    title: event.summary || "Cita de Google Calendar",
                    date,
                    start_time: startTime,
                    end_time: endTime,
                    external_id: event.id,
                    external_source: "google-calendar",
                    status: "scheduled",
                  },
                  { onConflict: "tenant_id,external_source,external_id" }
                )

              // Log interaction for new appointments (feeds RFM)
              if (apptStatus === 201) {
                await logInteraction({
                  tenantId: tenant.tenant_id,
                  customerId: customer.id,
                  type: "appointment_scheduled",
                  metadata: {
                    source: "google-calendar",
                    eventId: event.id,
                    title: event.summary,
                    date,
                  },
                })
              }
            }
          }

          return { created, updated, eventsProcessed: events.length }
        })

        totalCreated += result.created
        totalUpdated += result.updated

        // Update sync log as success
        await step.run(`complete-sync-log-${tenant.tenant_id}`, async () => {
          await supabaseAdmin
            .from("sync_logs")
            .update({
              status: "success",
              records_created: result.created,
              records_updated: result.updated,
              completed_at: new Date().toISOString(),
            })
            .eq("id", syncLogId)
        })
      } catch (err) {
        // Update sync log as failed
        await step.run(`fail-sync-log-${tenant.tenant_id}`, async () => {
          await supabaseAdmin
            .from("sync_logs")
            .update({
              status: "failed",
              error: err instanceof Error ? err.message : String(err),
              completed_at: new Date().toISOString(),
            })
            .eq("id", syncLogId)
        })
      }
    }

    return { totalCreated, totalUpdated, tenantsProcessed: tenants.length }
  }
)
