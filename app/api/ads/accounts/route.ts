import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"

// GET: List ad accounts for the current tenant
export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  const { data, error: dbError } = await supabaseAdmin
    .from("ad_accounts")
    .select("*")
    .eq("tenant_id", user.id)
    .order("created_at", { ascending: false })

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ accounts: data ?? [] })
}

// POST: Create a new ad account
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body = await req.json()
  const { platform, platform_account_id, account_name, currency, timezone, credentials_source } = body

  if (!platform || !platform_account_id || !credentials_source) {
    return NextResponse.json(
      { error: "platform, platform_account_id, and credentials_source are required" },
      { status: 400 }
    )
  }

  const { data, error: dbError } = await supabaseAdmin
    .from("ad_accounts")
    .upsert(
      {
        tenant_id: user.id,
        platform,
        platform_account_id,
        account_name: account_name ?? null,
        currency: currency ?? "ARS",
        timezone: timezone ?? "America/Argentina/Buenos_Aires",
        credentials_source,
        is_active: true,
      },
      { onConflict: "tenant_id,platform,platform_account_id" }
    )
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ account: data }, { status: 201 })
}

// DELETE: Deactivate an ad account
export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(req.url)
  const accountId = searchParams.get("id")

  if (!accountId) {
    return NextResponse.json({ error: "id is required" }, { status: 400 })
  }

  const { error: dbError } = await supabaseAdmin
    .from("ad_accounts")
    .update({ is_active: false })
    .eq("id", accountId)
    .eq("tenant_id", user.id)

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
