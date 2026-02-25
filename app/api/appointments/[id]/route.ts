import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"
import { logInteraction } from "@/lib/interactions"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { data, error: dbError } = await supabaseAdmin
    .from("appointments")
    .select("*, customer:customers(id, name, email, phone)")
    .eq("id", id)
    .eq("tenant_id", user.id)
    .single()

  if (dbError || !data) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const { title, date, start_time, end_time, status, notes } = body

  // Build update object with only provided fields
  const update: Record<string, unknown> = {}
  if (title !== undefined) update.title = title.trim()
  if (date !== undefined) update.date = date
  if (start_time !== undefined) update.start_time = start_time
  if (end_time !== undefined) update.end_time = end_time
  if (status !== undefined) update.status = status
  if (notes !== undefined) update.notes = notes?.trim() || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
  }

  // Get current appointment to check ownership and log status changes
  const { data: existing } = await supabaseAdmin
    .from("appointments")
    .select("status, customer_id")
    .eq("id", id)
    .eq("tenant_id", user.id)
    .single()

  if (!existing) return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 })

  const { data: appointment, error: dbError } = await supabaseAdmin
    .from("appointments")
    .update(update)
    .eq("id", id)
    .eq("tenant_id", user.id)
    .select("*, customer:customers(id, name, email, phone)")
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Log status change interactions
  if (status && status !== existing.status) {
    if (status === "completed") {
      await logInteraction({
        tenantId: user.id,
        customerId: existing.customer_id,
        type: "appointment_completed",
        metadata: { appointmentId: id },
      })
    } else if (status === "noshow") {
      await logInteraction({
        tenantId: user.id,
        customerId: existing.customer_id,
        type: "appointment_noshow",
        metadata: { appointmentId: id },
      })
    }
  }

  return NextResponse.json({ appointment })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { error: dbError } = await supabaseAdmin
    .from("appointments")
    .delete()
    .eq("id", id)
    .eq("tenant_id", user.id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
