import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { exchangeTikTokCode } from "@/lib/tiktok-ads-client"
import { verifySignedState } from "@/lib/oauth-state"

// GET: Handle TikTok OAuth callback
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const authCode = searchParams.get("auth_code")
  const state = searchParams.get("state")

  if (!authCode || !state) {
    return NextResponse.redirect(
      new URL("/backoffice/media/connect?tiktok=error&reason=missing_params", req.url)
    )
  }

  // Verify signed state and extract tenant_id
  const decoded = verifySignedState(state)
  if (!decoded || !decoded.tenantId || typeof decoded.tenantId !== "string") {
    return NextResponse.redirect(
      new URL("/backoffice/media/connect?tiktok=error&reason=invalid_state", req.url)
    )
  }
  const tenantId = decoded.tenantId

  try {
    const { accessToken, advertiserIds } = await exchangeTikTokCode(authCode)

    // Store in connector_credentials
    await supabaseAdmin
      .from("connector_credentials")
      .upsert(
        {
          tenant_id: tenantId,
          provider: "tiktok_ads",
          access_token: accessToken,
          refresh_token: null,
          token_expires_at: null,
          provider_metadata: { advertiser_ids: advertiserIds },
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,provider" }
      )

    return NextResponse.redirect(
      new URL("/backoffice/media/connect?tiktok=success", req.url)
    )
  } catch (err) {
    console.error("TikTok OAuth callback error:", err)
    return NextResponse.redirect(
      new URL("/backoffice/media/connect?tiktok=error&reason=token_exchange", req.url)
    )
  }
}
