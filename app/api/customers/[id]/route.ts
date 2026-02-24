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
