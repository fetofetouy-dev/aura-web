import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabaseAdmin } from "@/lib/supabase"

/**
 * GET /api/integrations/google/status
 * Returns whether the current user has a stored Google refresh_token in DB.
 */
export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from("google_credentials")
    .select("refresh_token, expires_at")
    .eq("user_email", session.user.email)
    .single()

  if (error || !data) {
    return NextResponse.json({ gmail: false, calendar: false })
  }

  return NextResponse.json({
    gmail: !!data.refresh_token,
    calendar: !!data.refresh_token, // Same token grants both scopes
    connectedAt: data.expires_at,
  })
}
