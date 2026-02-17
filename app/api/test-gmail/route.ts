import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase"
import { refreshAccessToken, sendGmail } from "@/lib/google-client"

/**
 * POST /api/test-gmail
 * Sends a test email to the authenticated user's own inbox.
 * Validates that the Gmail integration is working end-to-end.
 */
export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch stored credentials from Supabase
  const { data: creds, error } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token")
    .eq("user_email", session.user.email)
    .single()

  if (error || !creds?.refresh_token) {
    return NextResponse.json(
      { error: "Gmail not connected. Please sign in again to grant access." },
      { status: 400 }
    )
  }

  try {
    // Refresh the access token
    const { accessToken } = await refreshAccessToken(creds.refresh_token)

    // Send the test email
    const { messageId } = await sendGmail(accessToken, {
      to: session.user.email,
      subject: "✅ Test de Gmail — Aura funciona!",
      body: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #3B82F6;">¡La integración de Gmail funciona! 🎉</h2>
          <p>Este email fue enviado automáticamente por <strong>Aura</strong> usando tu cuenta de Gmail.</p>
          <p>Tus automatizaciones ya pueden:</p>
          <ul>
            <li>Enviar emails de bienvenida a leads</li>
            <li>Enviar recordatorios de citas</li>
            <li>Enviar facturas automáticamente</li>
            <li>Y mucho más...</li>
          </ul>
          <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">
            Aura Automations · Enviado desde tu backoffice
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true, messageId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("[test-gmail] Error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
