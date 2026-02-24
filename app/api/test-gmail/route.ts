import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"
import { refreshAccessToken, sendGmail } from "@/lib/google-client"
import { testEmail } from "@/lib/email-templates"

/**
 * POST /api/test-gmail
 * Sends a test email to the authenticated user's own inbox.
 */
export async function POST() {
  const { user, error } = await requireAuth()
  if (error) return error

  const { data: creds, error: dbError } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token")
    .eq("tenant_id", user.id)
    .single()

  if (dbError || !creds?.refresh_token) {
    return NextResponse.json({ error: "Gmail no conectado. Conectá Gmail desde Configuración." }, { status: 400 })
  }

  try {
    const { accessToken } = await refreshAccessToken(creds.refresh_token)
    const { messageId } = await sendGmail(accessToken, testEmail(user.email!))
    return NextResponse.json({ success: true, messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
