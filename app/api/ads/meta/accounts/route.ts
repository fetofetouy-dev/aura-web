import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { supabaseAdmin } from "@/lib/supabase-server"
import { getMetaAdAccounts } from "@/lib/meta-ads-client"
import { isMockMode, MOCK_ACCOUNTS } from "@/lib/ads-mock-data"

// GET: Discover Meta ad accounts accessible with the tenant's Meta token
export async function GET() {
  const { user, error } = await requireAuth()
  if (error) return error

  if (isMockMode()) {
    return NextResponse.json({
      accounts: [
        {
          id: MOCK_ACCOUNTS.meta_ads.platformAccountId,
          name: MOCK_ACCOUNTS.meta_ads.accountName,
          currency: MOCK_ACCOUNTS.meta_ads.currency,
          timezone: MOCK_ACCOUNTS.meta_ads.timezone,
        },
      ],
    })
  }

  const { data: creds } = await supabaseAdmin
    .from("connector_credentials")
    .select("access_token")
    .eq("tenant_id", user.id)
    .eq("provider", "meta_ads")
    .eq("is_active", true)
    .single()

  if (!creds?.access_token) {
    return NextResponse.json(
      { error: "Meta Ads no está conectado." },
      { status: 400 }
    )
  }

  try {
    const accounts = await getMetaAdAccounts(creds.access_token)
    return NextResponse.json({ accounts })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
