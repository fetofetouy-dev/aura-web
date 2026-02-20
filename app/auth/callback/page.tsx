"use client"

import { useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function AuthCallbackPage() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()

    const run = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get("code")
      const rawNext = url.searchParams.get("next") ?? "/backoffice/dashboard"
      const next =
        rawNext.startsWith("/") && !rawNext.startsWith("//")
          ? rawNext
          : "/backoffice/dashboard"

      if (!code) {
        window.location.replace("/login")
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[auth/callback] exchange error:", error.message)
        window.location.replace("/login")
        return
      }

      // Save Google tokens in the background — don't await, don't block the redirect
      const session = data.session
      if (session?.provider_token && session.user?.email) {
        fetch("/api/auth/save-google-tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.provider_token,
            refresh_token: session.provider_refresh_token ?? null,
          }),
        }).catch(() => null)
      }

      // Exchange succeeded — go to dashboard
      window.location.replace(next)
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
