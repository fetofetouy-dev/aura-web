import { supabaseAdmin } from "@/lib/supabase-server"

export type InteractionType =
  | "customer_created"
  | "customer_updated"
  | "appointment_scheduled"
  | "appointment_completed"
  | "appointment_noshow"
  | "payment_received"
  | "invoice_sent"
  | "invoice_overdue"
  | "email_sent"
  | "email_opened"
  | "email_clicked"
  | "whatsapp_sent"
  | "whatsapp_replied"
  | "nps_sent"
  | "nps_responded"
  | "review_requested"
  | "review_left"

interface LogInteractionOptions {
  tenantId: string
  customerId: string
  type: InteractionType
  value?: number
  metadata?: Record<string, unknown>
}

/**
 * Logs a customer interaction event.
 * Used as the data foundation for RFM scoring and AI recommendations.
 */
export async function logInteraction({
  tenantId,
  customerId,
  type,
  value,
  metadata = {},
}: LogInteractionOptions): Promise<void> {
  const { error } = await supabaseAdmin.from("interactions").insert({
    tenant_id: tenantId,
    customer_id: customerId,
    type,
    value: value ?? null,
    metadata,
  })

  if (error) {
    console.error("[logInteraction] failed:", error.message, { tenantId, customerId, type })
  }
}
