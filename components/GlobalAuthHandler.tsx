"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export function GlobalAuthHandler() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/auth/callback") return
    if (pathname.startsWith("/backoffice")) return
    if (pathname === "/login" || pathname === "/register") return

    const supabase = createSupabaseBrowserClient()

    // 1. Subscribe FIRST so we don't miss any incoming SIGNED_IN events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) window.location.replace("/backoffice/dashboard")
    })

    // 2. Check for session that might already exist (auto-exchange may have
    //    completed before this subscription was set up)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.replace("/backoffice/dashboard")
    })

    // 3. If ?code= is in URL and auto-exchange didn't trigger, do it manually
    const code = new URL(window.location.href).searchParams.get("code")
    if (code) {
      supabase.auth.exchangeCodeForSession(code).catch(() => null)
    }

    return () => subscription.unsubscribe()
  }, [pathname])

  return null
}
