"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const supabase = createSupabaseBrowserClient()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Exchange the recovery code so we have a valid session before showing the form.
    // Supabase redirects here with ?code= (PKCE) after the user clicks the reset link.
    const run = async () => {
      const code = new URL(window.location.href).searchParams.get("code")

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          setError("El link expiró o ya fue usado. Pedí uno nuevo.")
          return
        }
      }

      // Check that we have a valid recovery session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("El link expiró o ya fue usado. Pedí uno nuevo.")
        return
      }

      setReady(true)
    }

    run()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      window.location.replace("/backoffice/dashboard")
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image
            src="/aura-logo.svg"
            alt="Aura"
            width={120}
            height={36}
            className="brightness-200 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-text-primary">Nueva contraseña</h1>
          <p className="text-text-muted text-sm mt-2">Elegí una contraseña segura para tu cuenta.</p>
        </div>

        <div className="bg-background-elevated border border-border rounded-2xl p-8">
          {error ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
              <a href="/forgot-password" className="text-sm text-accent-blue hover:underline block">
                Pedir un nuevo link
              </a>
            </div>
          ) : !ready ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Nueva contraseña (mín. 8 caracteres)"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
              />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder="Confirmar contraseña"
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
              />

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {loading ? "Guardando..." : "Guardar contraseña"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
