import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { createSignedState } from "@/lib/oauth-state"

// GET: Redirect to Facebook Login for Meta Ads OAuth
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const appId = process.env.META_APP_ID
  if (!appId) {
    return NextResponse.json({ error: "META_APP_ID no configurado" }, { status: 500 })
  }

  const origin = new URL(req.url).origin
  const redirectUri = `${origin}/api/ads/meta/callback`

  const state = createSignedState({ tenantId: user.id, ts: Date.now() })

  const authUrl =
    `https://www.facebook.com/v19.0/dialog/oauth?` +
    `client_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=ads_read` +
    `&state=${state}` +
    `&response_type=code`

  return NextResponse.redirect(authUrl)
}
