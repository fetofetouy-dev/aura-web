import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { refreshAccessToken, sendGmail } from "@/lib/google-client"

/**
 * POST /api/test-gmail
 * Sends a test email to the authenticated user's own inbox.
 */
export async function POST() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: creds, error } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token")
    .eq("user_email", user.email)
    .single()

  if (error || !creds?.refresh_token) {
    return NextResponse.json({ error: "Gmail no conectado. Conectá Gmail desde Configuración." }, { status: 400 })
  }

  try {
    const { accessToken } = await refreshAccessToken(creds.refresh_token)
    const { messageId } = await sendGmail(accessToken, {
      to: user.email,
      subject: "✅ Test de Gmail — Aura funciona!",
      body: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #3B82F6;">¡La integración de Gmail funciona! 🎉</h2>
          <p>Este email fue enviado automáticamente por <strong>Aura</strong> usando tu cuenta de Gmail.</p>
          <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">Aura Automations · Enviado desde tu backoffice</p>
        </div>
      `,
    })
    return NextResponse.json({ success: true, messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
