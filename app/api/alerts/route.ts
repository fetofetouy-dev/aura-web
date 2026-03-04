import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get("status") || "pending"
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)

  const { data, error: dbError } = await supabaseAdmin
    .from("customer_alerts")
    .select("*, customer:customers(id, name, email, segment)")
    .eq("tenant_id", user.id)
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const { id, status: newStatus } = body

  if (!id || !["dismissed", "acted"].includes(newStatus)) {
    return NextResponse.json({ error: "id y status (dismissed|acted) requeridos" }, { status: 400 })
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("customer_alerts")
    .update({
      status: newStatus,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("tenant_id", user.id)
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
