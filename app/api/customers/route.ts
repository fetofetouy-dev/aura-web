import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase"
import { runLeadToCrm } from "@/lib/automations/lead-to-crm"

/**
 * GET /api/customers
 * Returns all customers for the current tenant.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("tenant_email", session.user.email)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

/**
 * POST /api/customers
 * Creates a new customer for the current tenant.
 * If the customer has an email, triggers the lead-to-crm automation automatically.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { name, email, phone, company, notes } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
  }

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .insert({
      tenant_email: session.user.email,
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger lead-to-crm automation if customer has email
  let automationResult = null
  if (email?.trim()) {
    automationResult = await runLeadToCrm({
      tenantEmail: session.user.email,
      leadName: name.trim(),
      leadEmail: email.trim(),
    })
  }

  return NextResponse.json({ customer, automationResult }, { status: 201 })
}
