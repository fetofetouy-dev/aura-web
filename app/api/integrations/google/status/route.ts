import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"

export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  const { data, error: dbError } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token, expires_at")
    .eq("tenant_id", user.id)
    .single()

  if (dbError || !data) return NextResponse.json({ gmail: false, calendar: false })

  return NextResponse.json({
    gmail: !!data.refresh_token,
    calendar: !!data.refresh_token,
    connectedAt: data.expires_at,
  })
}
