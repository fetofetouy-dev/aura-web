"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { createSupabaseBrowserClient } from "@/lib/supabase"

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
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

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 rounded-full bg-green-400/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Revisá tu email</h2>
          <p className="text-text-muted text-sm mb-6">
            Te enviamos un link de confirmación a <strong className="text-text-primary">{email}</strong>.
            Hacé clic en el link para activar tu cuenta.
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
            src="/aura-logo.svg"
            alt="Aura"
            width={120}
            height={36}
            className="brightness-200 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-text-primary">Crear cuenta</h1>
          <p className="text-text-muted text-sm mt-2">Empezá a automatizar tu negocio</p>
        </div>

        <div className="bg-background-elevated border border-border rounded-2xl p-8">
          <form onSubmit={handleRegister} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Email"
              className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Contraseña (mín. 8 caracteres)"
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
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="text-center text-xs text-text-muted mt-4">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-accent-blue hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
