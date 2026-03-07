import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { createSignedState } from "@/lib/oauth-state"

// GET: Redirect to TikTok Business OAuth
export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const appId = process.env.TIKTOK_APP_ID
  if (!appId) {
    return NextResponse.json({ error: "TIKTOK_APP_ID no configurado" }, { status: 500 })
  }

  const origin = new URL(req.url).origin
  const redirectUri = `${origin}/api/ads/tiktok/callback`

  const state = createSignedState({ tenantId: user.id, ts: Date.now() })

  const authUrl =
    `https://business-api.tiktok.com/portal/auth?` +
    `app_id=${appId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`

  return NextResponse.redirect(authUrl)
}
