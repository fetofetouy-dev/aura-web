import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { runLeadToCrm } from "@/lib/automations/lead-to-crm"
import { logInteraction } from "@/lib/interactions"

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, email, phone, company, notes } = body

  if (!name?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .insert({
      tenant_id: user.id,
      tenant_email: user.email,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Log the customer_created interaction
  await logInteraction({
    tenantId: user.id,
    customerId: customer.id,
    type: "customer_created",
    metadata: { source: "manual", hasEmail: !!email?.trim() },
  })

  let automationResult = null
  if (email?.trim()) {
    automationResult = await runLeadToCrm({
      tenantId: user.id,
      leadName: name.trim(),
      leadEmail: email.trim(),
      customerId: customer.id,
    })
  }

  return NextResponse.json({ customer, automationResult }, { status: 201 })
}
