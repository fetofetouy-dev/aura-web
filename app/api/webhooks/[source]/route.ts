import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { inngest } from "@/lib/inngest"

/**
 * Generic webhook receiver.
 * External systems (MercadoPago, Calendly, WhatsApp, etc.) POST here.
 *
 * URL format: /api/webhooks/[source]
 * Auth: x-aura-secret header (must match secret_key in webhook_endpoints table)
 *
 * Example: POST /api/webhooks/mercadopago
 *          x-aura-secret: <secret_key>
 *          body: { ...mercadopago payload }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params
  const secretKey = req.headers.get("x-aura-secret")

  if (!secretKey) {
    return NextResponse.json({ error: "Missing x-aura-secret header" }, { status: 401 })
  }

  // Look up the webhook endpoint config by secret key and source
  const { data: endpoint, error } = await supabaseAdmin
    .from("webhook_endpoints")
    .select("tenant_id, automation_type, event_mapping, is_active")
    .eq("source", source)
    .eq("secret_key", secretKey)
    .eq("is_active", true)
    .single()

  if (error || !endpoint) {
    return NextResponse.json({ error: "Invalid secret or unknown source" }, { status: 401 })
  }

  // Parse the incoming payload
  let payload: Record<string, unknown> = {}
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  // Apply event mapping if configured (maps external fields to Aura fields)
  // e.g. { "customerId": "data.buyer.id", "leadEmail": "data.buyer.email" }
  const mappedData: Record<string, unknown> = {}
  const mapping = endpoint.event_mapping as Record<string, string>
  for (const [auraField, externalPath] of Object.entries(mapping)) {
    const value = externalPath.split(".").reduce<unknown>((obj, key) => {
      if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key]
      return undefined
    }, payload)
    mappedData[auraField] = value
  }

  // If mapping includes customer fields, upsert the customer
  const customerName = mappedData.leadName as string | undefined
  const customerEmail = mappedData.leadEmail as string | undefined
  if (customerName && customerEmail) {
    await supabaseAdmin
      .from("customers")
      .upsert({
        tenant_id: endpoint.tenant_id,
        name: customerName,
        email: customerEmail.toLowerCase(),
        phone: (mappedData.leadPhone as string) || null,
        source: `webhook:${source}`,
      }, { onConflict: "tenant_id,email", ignoreDuplicates: false })
  }

  // Emit event to Inngest
  await inngest.send({
    name: "webhook/received",
    data: {
      tenantId: endpoint.tenant_id,
      source,
      automationType: endpoint.automation_type,
      payload,
      ...mappedData,
    },
  })

  return NextResponse.json({ received: true })
}
