"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react"
import type { AdAccount, AdPlatform } from "@/lib/types"

const platforms: Array<{
  id: AdPlatform
  name: string
  description: string
  color: string
  bgColor: string
}> = [
  {
    id: "google_ads",
    name: "Google Ads",
    description: "Conectá tu cuenta de Google Ads para sincronizar campañas de Search, Shopping, Display y Performance Max.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "meta_ads",
    name: "Meta Ads",
    description: "Conectá tu cuenta de Facebook/Instagram Ads para sincronizar campañas de conversiones, tráfico y awareness.",
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "tiktok_ads",
    name: "TikTok Ads",
    description: "Conectá tu cuenta de TikTok for Business para sincronizar campañas de conversiones y tráfico.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
]

export default function MediaConnectPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center min-h-screen"><Loader2 className="w-5 h-5 animate-spin text-text-muted" /></div>}>
      <MediaConnectContent />
    </Suspense>
  )
}

function MediaConnectContent() {
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<AdAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<AdPlatform | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    loadAccounts()

    // Check for OAuth callback results
    const metaResult = searchParams.get("meta")
    const tiktokResult = searchParams.get("tiktok")
    if (metaResult === "success") setMessage({ type: "success", text: "Meta Ads conectado exitosamente" })
    if (metaResult === "error") setMessage({ type: "error", text: "Error al conectar Meta Ads" })
    if (tiktokResult === "success") setMessage({ type: "success", text: "TikTok Ads conectado exitosamente" })
    if (tiktokResult === "error") setMessage({ type: "error", text: "Error al conectar TikTok Ads" })
  }, [searchParams])

  async function loadAccounts() {
    try {
      const res = await fetch("/api/ads/accounts")
      if (res.ok) {
        const data = await res.json()
        setAccounts(data.accounts ?? [])
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(platform: AdPlatform) {
    setConnecting(platform)

    if (platform === "google_ads") {
      // Google Ads uses existing Google OAuth — discover accounts
      try {
        const res = await fetch("/api/ads/google/accounts")
        if (!res.ok) {
          const data = await res.json()
          setMessage({ type: "error", text: data.error ?? "Error al descubrir cuentas" })
          setConnecting(null)
          return
        }
        const data = await res.json()
        const googleAccounts = data.accounts ?? []

        if (googleAccounts.length === 0) {
          setMessage({ type: "error", text: "No se encontraron cuentas de Google Ads" })
          setConnecting(null)
          return
        }

        // Auto-connect the first account (simplification for PyMEs with 1 account)
        const account = googleAccounts[0]
        await fetch("/api/ads/accounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "google_ads",
            platform_account_id: account.id,
            account_name: account.name,
            currency: account.currency,
            timezone: account.timezone,
            credentials_source: "google_credentials",
          }),
        })

        setMessage({ type: "success", text: `Google Ads conectado: ${account.name}` })
        loadAccounts()
      } catch {
        setMessage({ type: "error", text: "Error al conectar Google Ads" })
      }
      setConnecting(null)
    } else if (platform === "meta_ads") {
      // Redirect to Meta OAuth
      window.location.href = "/api/ads/meta/auth"
    } else if (platform === "tiktok_ads") {
      // Redirect to TikTok OAuth
      window.location.href = "/api/ads/tiktok/auth"
    }
  }

  async function handleDisconnect(accountId: string) {
    await fetch(`/api/ads/accounts?id=${accountId}`, { method: "DELETE" })
    loadAccounts()
  }

  const connectedPlatforms = new Set(accounts.filter((a) => a.is_active).map((a) => a.platform))

  return (
    <div className="flex-1 flex flex-col min-h-screen">

      <main className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Message */}
        {message && (
          <div
            className={`flex items-center gap-2 p-4 rounded-xl border ${
              message.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Platform cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const connected = connectedPlatforms.has(platform.id)
            const connectedAccount = accounts.find(
              (a) => a.platform === platform.id && a.is_active
            )

            return (
              <div
                key={platform.id}
                className="bg-background-elevated border border-border rounded-xl p-6 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg ${platform.bgColor} flex items-center justify-center`}>
                    <span className={`text-lg font-bold ${platform.color}`}>
                      {platform.name[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className={`text-sm font-semibold ${platform.color}`}>{platform.name}</h3>
                    {connected && (
                      <span className="text-xs text-green-400">Conectado</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-text-muted mb-6 flex-1">{platform.description}</p>

                {connected && connectedAccount ? (
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-black/[0.02] border border-border/50">
                      <p className="text-xs font-medium text-text-primary">{connectedAccount.account_name}</p>
                      <p className="text-xs text-text-muted mt-0.5">{connectedAccount.platform_account_id}</p>
                      {connectedAccount.last_synced_at && (
                        <p className="text-xs text-text-muted mt-1">
                          Última sync: {new Date(connectedAccount.last_synced_at).toLocaleDateString("es-AR")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDisconnect(connectedAccount.id)}
                      className="w-full text-xs text-red-400 hover:text-red-300 py-2 transition-colors"
                    >
                      Desconectar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={connecting === platform.id || loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent-amber hover:bg-accent-amber/90 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {connecting === platform.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ExternalLink className="w-4 h-4" />
                    )}
                    Conectar {platform.name}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Help text */}
        <div className="bg-background-elevated border border-border rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-primary mb-2">¿Cómo funciona?</h3>
          <ol className="space-y-2 text-xs text-text-muted list-decimal list-inside">
            <li>Conectá tu cuenta de la plataforma publicitaria</li>
            <li>Aura sincroniza automáticamente tus campañas y métricas diarias</li>
            <li>Revisá el rendimiento en la sección de Campañas</li>
            <li>Usá el Optimizador para redistribuir presupuesto y maximizar conversiones</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
