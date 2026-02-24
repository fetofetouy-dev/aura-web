"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function ForgotPasswordPage() {
  const supabase = createSupabaseBrowserClient()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-accent-blue/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📩</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Revisá tu email</h2>
          <p className="text-text-muted text-sm mb-6">
            Te enviamos un link para restablecer tu contraseña a{" "}
            <strong className="text-text-primary">{email}</strong>.
          </p>
          <Link href="/login" className="text-sm text-accent-blue hover:underline">
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image
            src="/aura-logo.png"
            alt="Aura"
            width={120}
            height={36}
            className="brightness-200 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-text-primary">Olvidé mi contraseña</h1>
          <p className="text-text-muted text-sm mt-2">
            Ingresá tu email y te mandamos un link para restablecerla.
          </p>
        </div>

        <div className="bg-background-elevated border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
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
              {loading ? "Enviando..." : "Enviar link"}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-4">
            <Link href="/login" className="text-accent-blue hover:underline">
              Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
