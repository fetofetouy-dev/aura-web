import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"
import { refreshAccessToken } from "@/lib/google-client"
import { listAccessibleCustomers, getCustomerInfo } from "@/lib/google-ads-client"
import { isMockMode, MOCK_ACCOUNTS } from "@/lib/ads-mock-data"

// GET: Discover Google Ads accounts accessible with the tenant's Google OAuth token
export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  // Mock mode
  if (isMockMode()) {
    return NextResponse.json({
      accounts: [
        {
          id: MOCK_ACCOUNTS.google_ads.platformAccountId,
          name: MOCK_ACCOUNTS.google_ads.accountName,
          currency: MOCK_ACCOUNTS.google_ads.currency,
          timezone: MOCK_ACCOUNTS.google_ads.timezone,
        },
      ],
    })
  }

  // Get Google credentials
  const { data: creds } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token")
    .eq("tenant_id", user.id)
    .single()

  if (!creds?.refresh_token) {
    return NextResponse.json(
      { error: "Google no está conectado. Conectá tu cuenta de Google primero en Configuración." },
      { status: 400 }
    )
  }

  try {
    const { accessToken } = await refreshAccessToken(creds.refresh_token)
    const customerIds = await listAccessibleCustomers(accessToken)

    // Get details for each customer
    const accounts = await Promise.all(
      customerIds.map((id) => getCustomerInfo(accessToken, id))
    )

    return NextResponse.json({ accounts })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
