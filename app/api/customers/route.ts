import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase"
import { runLeadToCrm } from "@/lib/automations/lead-to-crm"

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from("customers")
    .select("*")
    .eq("tenant_email", user.email)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, email, phone, company, notes } = body

  if (!name?.trim()) return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })

  const { data: customer, error } = await supabaseAdmin
    .from("customers")
    .insert({
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

  let automationResult = null
  if (email?.trim()) {
    automationResult = await runLeadToCrm({
      tenantEmail: user.email,
      leadName: name.trim(),
      leadEmail: email.trim(),
    })
  }

  return NextResponse.json({ customer, automationResult }, { status: 201 })
}
