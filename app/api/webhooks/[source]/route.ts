import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { inngest } from "@/lib/inngest"
import { rateLimit } from "@/lib/rate-limit"

const MAX_PAYLOAD_SIZE = 1_000_000 // 1MB
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

/**
 * Generic webhook receiver.
 * External systems (MercadoPago, Calendly, WhatsApp, etc.) POST here.
 *
 * URL format: /api/webhooks/[source]
 * Auth: x-aura-secret header (must match secret_key in webhook_endpoints table)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params

  // Rate limit per source (100 req/min)
  const limited = rateLimit(`webhook:${source}`, 100, 60_000)
  if (limited) return limited

  const secretKey = req.headers.get("x-aura-secret")

  if (!secretKey) {
    return NextResponse.json({ error: "Missing x-aura-secret header" }, { status: 401 })
  }

  // Reject oversized payloads
  const contentLength = parseInt(req.headers.get("content-length") || "0", 10)
  if (contentLength > MAX_PAYLOAD_SIZE) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 })
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
  const mappedData: Record<string, unknown> = {}
  const mapping = endpoint.event_mapping as Record<string, string>
  for (const [auraField, externalPath] of Object.entries(mapping)) {
    if (typeof externalPath !== "string") continue
    const value = externalPath.split(".").reduce<unknown>((obj, key) => {
      if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key]
      return undefined
    }, payload)
    // Only allow string/number/boolean values, not objects
    if (value !== null && value !== undefined && typeof value !== "object") {
      mappedData[auraField] = String(value).slice(0, 1000)
    }
  }

  // If mapping includes customer fields, upsert the customer
  const customerName = mappedData.leadName as string | undefined
  const customerEmail = mappedData.leadEmail as string | undefined
  if (customerName && customerEmail && EMAIL_REGEX.test(customerEmail)) {
    await supabaseAdmin
      .from("customers")
      .upsert({
        tenant_id: endpoint.tenant_id,
        name: customerName.slice(0, 200),
        email: customerEmail.toLowerCase().slice(0, 320),
        phone: ((mappedData.leadPhone as string) || "").slice(0, 30) || null,
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
