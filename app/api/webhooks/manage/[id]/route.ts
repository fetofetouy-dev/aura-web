import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { is_active, name, event_mapping } = body

  const update: Record<string, unknown> = {}
  if (is_active !== undefined) update.is_active = is_active
  if (name !== undefined) update.name = name
  if (event_mapping !== undefined) update.event_mapping = event_mapping

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("webhook_endpoints")
    .update(update)
    .eq("id", id)
    .eq("tenant_id", user.id)
    .select()
    .single()

  if (dbError || !data) return NextResponse.json({ error: "Webhook no encontrado" }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { error: dbError } = await supabaseAdmin
    .from("webhook_endpoints")
    .delete()
    .eq("id", id)
    .eq("tenant_id", user.id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
