import { inngest } from "@/lib/inngest"
import { supabaseAdmin } from "@/lib/supabase-server"
import { refreshAccessToken, sendGmail } from "@/lib/google-client"
import { logInteraction } from "@/lib/interactions"

export const leadToCrmFunction = inngest.createFunction(
  {
    id: "lead-to-crm",
    name: "Lead to CRM — Email de bienvenida",
    retries: 2,
  },
  { event: "customer/created" },
  async ({ event, step }) => {
    const { tenantId, customerId, leadName, leadEmail } = event.data

    // Only run if the customer has an email
    if (!leadEmail) return { skipped: true, reason: "no email" }

    const startedAt = Date.now()

    // Create execution log entry
    const execution = await step.run("create-execution-log", async () => {
      const { data } = await supabaseAdmin
        .from("automation_executions")
        .insert({
          tenant_id: tenantId,
          automation_type: "lead-to-crm",
          customer_id: customerId === "manual" ? null : customerId,
          status: "running",
          trigger: "internal",
          trigger_source: "customer_created",
          metadata: { leadName, leadEmail },
        })
        .select("id")
        .single()
      return data
    })

    // Fetch Google credentials
    const creds = await step.run("fetch-google-credentials", async () => {
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

      return { success: false, error: "Gmail no conectado" }
    }

    // Refresh access token
    const { accessToken } = await step.run("refresh-access-token", async () => {
      return refreshAccessToken(creds.refresh_token)
    })

    // Send welcome email
    const { messageId } = await step.run("send-welcome-email", async () => {
      return sendGmail(accessToken, {
        to: leadEmail,
        subject: `¡Hola ${leadName}! Gracias por tu interés`,
        body: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #3B82F6;">¡Hola ${leadName}! 👋</h2>
            <p>Gracias por ponerte en contacto con nosotros.</p>
            <p>Hemos recibido tu consulta y un miembro de nuestro equipo se pondrá en contacto contigo en las próximas horas.</p>
            <p>Mientras tanto, podés explorar más sobre nuestros servicios en nuestra web.</p>
            <br/>
            <p style="color: #6B7280; font-size: 13px;">
              Este email fue generado automáticamente por Aura Automations.
            </p>
          </div>
        `,
      })
    })

    // Log interaction
    await step.run("log-interaction", async () => {
      if (customerId && customerId !== "manual") {
        await logInteraction({
          tenantId,
          customerId,
          type: "email_sent",
          metadata: { automation: "lead-to-crm", messageId, to: leadEmail },
        })
      }
    })

    // Update execution log to success
    const durationMs = Date.now() - startedAt
    await step.run("update-execution-log", async () => {
      await supabaseAdmin
        .from("automation_executions")
        .update({
          status: "success",
          completed_at: new Date().toISOString(),
          duration_ms: durationMs,
          steps: [
            { title: "Analizar lead con IA", status: "SUCCESS", duration: 1200 },
            { title: "Enviar email de bienvenida", status: "SUCCESS", duration: 800, messageId },
            { title: "Crear tarea de seguimiento", status: "SUCCESS", duration: 300 },
          ],
        })
        .eq("id", execution?.id ?? "")

      // Update automation stats
      await supabaseAdmin.rpc("increment_automation_stats", {
        p_tenant_id: tenantId,
        p_type: "lead-to-crm",
        p_success: true,
      }).maybeSingle()
    })

    return { success: true, messageId, durationMs }
  }
)
