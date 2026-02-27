import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"
import { randomBytes } from "crypto"

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  const { data, error: dbError } = await supabaseAdmin
    .from("webhook_endpoints")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const { source, name } = body

  if (!source?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "source y name son requeridos" }, { status: 400 })
  }

  // Validate source: only lowercase, numbers, hyphens
  const cleanSource = source.trim().toLowerCase().replace(/[^a-z0-9-]/g, "")
  if (!cleanSource) {
    return NextResponse.json({ error: "source debe contener solo letras, números y guiones" }, { status: 400 })
  }

  // Check for duplicate source for this tenant
  const { data: existing } = await supabaseAdmin
    .from("webhook_endpoints")
    .select("id")
    .eq("tenant_id", user.id)
    .eq("source", cleanSource)
    .single()

  if (existing) {
    return NextResponse.json({ error: `Ya existe un webhook con source "${cleanSource}"` }, { status: 409 })
  }

  // Generate a secret key
  const secretKey = `aura_wh_${randomBytes(24).toString("hex")}`

  const { data, error: dbError } = await supabaseAdmin
    .from("webhook_endpoints")
    .insert({
      tenant_id: user.id,
      source: cleanSource,
      name: name.trim(),
      secret_key: secretKey,
      automation_type: "customer_sync",
      event_mapping: {},
      is_active: true,
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
