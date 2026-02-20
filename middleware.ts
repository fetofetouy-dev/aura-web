import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname, searchParams } = request.nextUrl

  // If Supabase redirected the OAuth code to the home page (Site URL fallback),
  // forward it to /auth/callback server-side — prevents flash of home page content.
  if (pathname === "/" && searchParams.has("code")) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/callback"
    return NextResponse.redirect(url)
  }

  // Redirect already-authenticated users away from login — no flash.
  if (user && pathname === "/login") {
    const url = request.nextUrl.clone()
    url.pathname = "/backoffice/dashboard"
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users out of backoffice.
  if (!user && pathname.startsWith("/backoffice")) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/", "/login", "/backoffice/:path*"],
}
