import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  const { data, error: dbError } = await supabaseAdmin
    .from("tenant_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (dbError && dbError.code === "PGRST116") {
    // No profile yet — return empty defaults
    return NextResponse.json({
      id: user.id,
      business_name: null,
      business_type: null,
      phone: null,
      settings: {},
      created_at: null,
      updated_at: null,
    })
  }

  if (dbError) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body = await request.json()
  const { business_name, business_type, phone, settings } = body

  const { data, error: dbError } = await supabaseAdmin
    .from("tenant_profiles")
    .upsert(
      {
        id: user.id,
        business_name: business_name ?? null,
        business_type: business_type ?? null,
        phone: phone ?? null,
        settings: settings ?? {},
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }

  return NextResponse.json(data)
}
