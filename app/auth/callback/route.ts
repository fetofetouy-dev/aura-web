import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

/**
 * GET /auth/callback
 * Supabase redirects here after OAuth (Google login or Gmail connect).
 * Exchanges the code for a session and saves Google provider tokens
 * to google_credentials so automations can use them server-side.
 *
 * Security measures:
 * - `next` param is validated to be a relative path (prevents open redirects)
 * - Session cookies are written directly onto the redirect response
 * - getUser() is called server-side to verify user identity (not just trusting the cookie)
 * - Error redirects use the same trusted domain as success redirects
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // Validate `next` to prevent open redirects.
  // Must be a relative path starting with "/" but not "//" (protocol-relative URL).
  const rawNext = searchParams.get("next") ?? "/backoffice/dashboard"
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//")
    ? rawNext
    : "/backoffice/dashboard"

  // Determine trusted base URL (Vercel production vs local)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const baseUrl = (process.env.NODE_ENV === "development" || !forwardedHost)
    ? origin
    : `https://${forwardedHost}`

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
  }

  // Create the redirect response upfront so Supabase can write session cookies directly onto it
  const response = NextResponse.redirect(`${baseUrl}${next}`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          // Write session cookies directly onto the redirect response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error("[auth/callback] exchangeCodeForSession error:", exchangeError.message)
    return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
  }

  // getUser() makes a server-side request to Supabase to verify the token is valid.
  // More secure than getSession() which only reads the local cookie without re-validating.
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("[auth/callback] getUser error:", userError?.message)
    return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
  }

  // Save Google provider tokens — only available in session object, not in user object.
  // Used by automations to send Gmail / Calendar events on behalf of the user.
  const { data: { session } } = await supabase.auth.getSession()

  if (session?.provider_token && user.email) {
    const { error: upsertError } = await supabaseAdmin.from("google_credentials").upsert(
      {
        user_email: user.email,
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_email" }
    )
    if (upsertError) console.error("[auth/callback] Failed to save Google tokens:", upsertError)
  }

  return response
}
