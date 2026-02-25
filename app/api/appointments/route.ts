import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"
import { logInteraction } from "@/lib/interactions"

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")))
  const offset = (page - 1) * limit
  const dateFrom = searchParams.get("from") // YYYY-MM-DD
  const dateTo = searchParams.get("to")     // YYYY-MM-DD
  const status = searchParams.get("status")

  // Count query
  let countQuery = supabaseAdmin
    .from("appointments")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", user.id)

  if (dateFrom) countQuery = countQuery.gte("date", dateFrom)
  if (dateTo) countQuery = countQuery.lte("date", dateTo)
  if (status) countQuery = countQuery.eq("status", status)

  const { count } = await countQuery

  // Data query with customer join
  let query = supabaseAdmin
    .from("appointments")
    .select("*, customer:customers(id, name, email, phone)")
    .eq("tenant_id", user.id)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .range(offset, offset + limit - 1)

  if (dateFrom) query = query.gte("date", dateFrom)
  if (dateTo) query = query.lte("date", dateTo)
  if (status) query = query.eq("status", status)

  const { data, error: dbError } = await query

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data, total: count ?? 0, page, limit })
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const { customer_id, title, date, start_time, end_time, notes } = body

  if (!customer_id) return NextResponse.json({ error: "El cliente es requerido" }, { status: 400 })
  if (!title?.trim()) return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
  if (!date) return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 })
  if (!start_time) return NextResponse.json({ error: "La hora de inicio es requerida" }, { status: 400 })
  if (!end_time) return NextResponse.json({ error: "La hora de fin es requerida" }, { status: 400 })

  // Verify the customer belongs to this tenant
  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id")
    .eq("id", customer_id)
    .eq("tenant_id", user.id)
    .single()

  if (!customer) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })

  const { data: appointment, error: dbError } = await supabaseAdmin
    .from("appointments")
    .insert({
      tenant_id: user.id,
      customer_id,
      title: title.trim(),
      date,
      start_time,
      end_time,
      notes: notes?.trim() || null,
      status: "scheduled",
    })
    .select("*, customer:customers(id, name, email, phone)")
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Log interaction
  await logInteraction({
    tenantId: user.id,
    customerId: customer_id,
    type: "appointment_scheduled",
    metadata: { appointmentId: appointment.id, title, date, start_time },
  })

  return NextResponse.json({ appointment }, { status: 201 })
}
