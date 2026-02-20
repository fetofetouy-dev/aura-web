"use client"

import { useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function AuthCallbackPage() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const url = new URL(window.location.href)
    const code = url.searchParams.get("code")
    const rawNext = url.searchParams.get("next") ?? "/backoffice/dashboard"
    const next =
      rawNext.startsWith("/") && !rawNext.startsWith("//")
        ? rawNext
        : "/backoffice/dashboard"

    const redirectToDashboard = (providerToken?: string | null, userEmail?: string | null) => {
      if (providerToken && userEmail) {
        fetch("/api/auth/save-google-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: providerToken, refresh_token: null }),
        }).catch(() => null)
      }
      window.location.replace(next)
    }

    const run = async () => {
      // Case 1: createBrowserClient singleton may have auto-exchanged the code
      // already before this effect ran. Check for existing session first.
      const { data: { session: existingSession } } = await supabase.auth.getSession()
      if (existingSession) {
        redirectToDashboard(existingSession.provider_token, existingSession.user?.email)
        return
      }

      // Case 2: No session yet. If we have a code, exchange it manually.
      if (!code) {
        window.location.replace("/login")
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        // Case 3: Exchange failed — maybe it was already consumed.
        // Do one final session check before giving up.
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        if (retrySession) {
          redirectToDashboard(retrySession.provider_token, retrySession.user?.email)
        } else {
          console.error("[auth/callback] exchange failed:", error.message)
          window.location.replace("/login")
        }
        return
      }

      redirectToDashboard(data.session?.provider_token, data.session?.user?.email)
    }

    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-text-muted text-sm">Iniciando sesión...</p>
      </div>
    </div>
  )
}
