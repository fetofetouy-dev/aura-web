import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("tenant_email", user.email)
    .single()

  if (error || !data) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const { error } = await supabaseAdmin
    .from("customers")
    .delete()
    .eq("id", id)
    .eq("tenant_email", user.email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
