import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"
import { inngest } from "@/lib/inngest"
import { logInteraction } from "@/lib/interactions"

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { searchParams } = req.nextUrl
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50")))
  const offset = (page - 1) * limit

  const { count } = await supabaseAdmin
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("tenant_id", user.id)

  const { data, error: dbError } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })
  return NextResponse.json({ data, total: count ?? 0, page, limit })
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body = await req.json().catch(() => ({}))
  const { name, email, phone, company, notes, birthday } = body

  if (!name?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })

  const { data: customer, error: dbError } = await supabaseAdmin
    .from("customers")
    .insert({
      tenant_id: user.id,
      tenant_email: user.email,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
      birthday: birthday || null,
      source: "manual",
    })
    .select()
    .single()

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  // Log the customer_created interaction
  await logInteraction({
    tenantId: user.id,
    customerId: customer.id,
    type: "customer_created",
    metadata: { source: "manual", hasEmail: !!email?.trim() },
  })

  // Emit event to Inngest — lead-to-crm runs in background
  if (email?.trim()) {
    await inngest.send({
      name: "customer/created",
      data: {
        tenantId: user.id,
        customerId: customer.id,
        leadName: name.trim(),
        leadEmail: email.trim(),
      },
    })
  }

  return NextResponse.json({ customer, automationQueued: !!email?.trim() }, { status: 201 })
}
