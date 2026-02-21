import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token, expires_at")
    .eq("tenant_id", user.id)
    .single()

  if (error || !data) return NextResponse.json({ gmail: false, calendar: false })

  return NextResponse.json({
    gmail: !!data.refresh_token,
    calendar: !!data.refresh_token,
    connectedAt: data.expires_at,
  })
}
