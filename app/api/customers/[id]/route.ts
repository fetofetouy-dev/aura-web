import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id } = await params
  const { data, error: dbError } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", user.id)
    .single()

  if (dbError || !data) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
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
  const { name, email, phone, company, notes, birthday, metadata } = body

  const update: Record<string, unknown> = {}
  if (name !== undefined) update.name = name?.trim() || null
  if (email !== undefined) update.email = email?.trim().toLowerCase() || null
  if (phone !== undefined) update.phone = phone?.trim() || null
  if (company !== undefined) update.company = company?.trim() || null
  if (notes !== undefined) update.notes = notes?.trim() || null
  if (birthday !== undefined) update.birthday = birthday || null
  if (metadata !== undefined) update.metadata = metadata

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 })
  }

  // Name is required if provided
  if (update.name === null) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("customers")
    .update(update)
    .eq("id", id)
    .eq("tenant_id", user.id)
    .select("*")
    .single()

  if (dbError || !data) return NextResponse.json({ error: dbError?.message ?? "Cliente no encontrado" }, { status: 500 })
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
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("tenant_id", user.id)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
