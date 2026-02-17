"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // If already authenticated, redirect to backoffice
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/backoffice/dashboard")
    }
  }, [status, router])

  async function handleSignIn() {
    setIsLoading(true)
    await signIn("google", { callbackUrl: "/backoffice/dashboard" })
  }

  if (status === "loading" || session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Image
            src="/aura-logo.svg"
            alt="Aura"
            width={120}
            height={36}
            className="brightness-200 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-text-primary">Iniciar sesión</h1>
          <p className="text-text-muted text-sm mt-2">
            Accedé al backoffice de Aura con tu cuenta de Google
          </p>
        </div>

        {/* Card */}
        <div className="bg-background-elevated border border-border rounded-2xl p-8 space-y-6">
          {/* Google sign in button */}
          <button
            onClick={handleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {isLoading ? "Redirigiendo..." : "Continuar con Google"}
          </button>

          {/* Scopes explanation */}
          <div className="border-t border-border pt-4">
            <p className="text-xs text-text-muted text-center mb-3">
              Al iniciar sesión, Aura solicitará acceso a:
            </p>
            <ul className="space-y-2">
              {[
                { icon: "✉️", label: "Gmail", desc: "Para enviar emails automáticos desde tu cuenta" },
                { icon: "📅", label: "Google Calendar", desc: "Para detectar y crear citas automáticamente" },
              ].map((item) => (
                <li key={item.label} className="flex items-start gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <div>
                    <span className="text-xs font-medium text-text-primary">{item.label}: </span>
                    <span className="text-xs text-text-muted">{item.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-text-muted mt-6">
          Solo usamos estos permisos para ejecutar tus automatizaciones.
          <br />
          Nunca leemos tus emails ni compartimos tus datos.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
