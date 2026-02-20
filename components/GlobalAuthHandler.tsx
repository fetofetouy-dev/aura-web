"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase"

/**
 * Global OAuth callback interceptor included in the root layout.
 *
 * Problem: Supabase may redirect to the Site URL (home page) instead of
 * /auth/callback when the redirectTo URL is not in the allowed list.
 * This component catches the ?code= param wherever the user lands
 * and completes the PKCE exchange + redirects to the dashboard.
 */
export function GlobalAuthHandler() {
  const pathname = usePathname()

  useEffect(() => {
    // /auth/callback has its own handler — don't double-exchange the code
    if (pathname === "/auth/callback") return

    const url = new URL(window.location.href)
    const code = url.searchParams.get("code")

    if (!code) return

    const supabase = createSupabaseBrowserClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (!error) {
        window.location.replace("/backoffice/dashboard")
      }
    })
  }, [pathname])

  return null
}
