import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"

/**
 * GET /auth/callback
 * Supabase redirects here after OAuth (Google login or Gmail connect).
 * Exchanges the code for a session and saves Google provider tokens
 * to google_credentials so automations can use them server-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/backoffice/dashboard"

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Save Google provider tokens so automations can send Gmail / Calendar events
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.provider_token && session.user?.email) {
        await supabaseAdmin.from("google_credentials").upsert(
          {
            user_email: session.user.email,
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_email" }
        ).catch((err) => console.error("[auth/callback] Failed to save Google tokens:", err))
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      if (process.env.NODE_ENV === "development" || !forwardedHost) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      return NextResponse.redirect(`https://${forwardedHost}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
