import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { exchangeTikTokCode } from "@/lib/tiktok-ads-client"

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

  let tenantId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString())
    tenantId = decoded.tenantId
  } catch {
    return NextResponse.redirect(
      new URL("/backoffice/media/connect?tiktok=error&reason=invalid_state", req.url)
    )
  }

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
          token_expires_at: null, // TikTok tokens don't expire but can be revoked
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
