import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { exchangeMetaCode, exchangeForLongLivedToken } from "@/lib/meta-ads-client"

// GET: Handle Meta OAuth callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const errorParam = searchParams.get("error")

  if (errorParam) {
    return NextResponse.redirect(
      new URL(`/backoffice/media/connect?meta=error&reason=${errorParam}`, req.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/backoffice/media/connect?meta=error&reason=missing_params", req.url)
    )
  }

  // Decode tenant_id from state
  let tenantId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString())
    tenantId = decoded.tenantId
  } catch {
    return NextResponse.redirect(
      new URL("/backoffice/media/connect?meta=error&reason=invalid_state", req.url)
    )
  }

  try {
    const origin = new URL(req.url).origin
    const redirectUri = `${origin}/api/ads/meta/callback`

    // Exchange code for short-lived token
    const { accessToken: shortLived } = await exchangeMetaCode(code, redirectUri)

    // Exchange for long-lived token (60 days)
    const { accessToken, expiresIn } = await exchangeForLongLivedToken(shortLived)

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Store in connector_credentials
    await supabaseAdmin
      .from("connector_credentials")
      .upsert(
        {
          tenant_id: tenantId,
          provider: "meta_ads",
          access_token: accessToken,
          refresh_token: null, // Meta long-lived tokens don't have refresh tokens
          token_expires_at: expiresAt,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,provider" }
      )

    return NextResponse.redirect(
      new URL("/backoffice/media/connect?meta=success", req.url)
    )
  } catch (err) {
    console.error("Meta OAuth callback error:", err)
    return NextResponse.redirect(
      new URL("/backoffice/media/connect?meta=error&reason=token_exchange", req.url)
    )
  }
}
