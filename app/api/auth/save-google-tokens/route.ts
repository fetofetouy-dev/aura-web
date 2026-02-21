import { NextResponse } from "next/server"
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { access_token, refresh_token } = await request.json()

  if (access_token) {
    const { error } = await supabaseAdmin.from("google_credentials").upsert(
      {
        tenant_id: user.id,
        user_email: user.email,
        access_token,
        refresh_token: refresh_token ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "tenant_id" }
    )
    if (error) console.error("[save-google-tokens] upsert error:", error)
  }

  return NextResponse.json({ ok: true })
}
