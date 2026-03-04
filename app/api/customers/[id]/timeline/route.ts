import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { id: customerId } = params
  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100)
  const offset = parseInt(searchParams.get("offset") || "0")

  // Verify the customer belongs to this tenant
  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("id", customerId)
    .eq("tenant_id", user.id)
    .single()

  if (!customer) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })
  }

  const { data, error: dbError, count } = await supabaseAdmin
    .from("interactions")
    .select("*", { count: "exact" })
    .eq("customer_id", customerId)
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({
    entries: data ?? [],
    total: count ?? 0,
    limit,
    offset,
  })
}
