"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Mail,
  Calendar,
  Key,
  Webhook,
  RefreshCw,
  Send,
  AlertCircle,
} from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { cn } from "@/lib/cn"

// ─── Types ───────────────────────────────────────────────────────────────────

interface GoogleStatus {
  gmail: boolean
  calendar: boolean
}

interface TestResult {
  success: boolean
  messageId?: string
  error?: string
}

// ─── Integration card ─────────────────────────────────────────────────────────

function IntegrationCard({
  icon: Icon,
  name,
  description,
  connected,
  loading,
  onReconnect,
  actionSlot,
}: {
  icon: React.ComponentType<{ className?: string }>
  name: string
  description: string
  connected: boolean | null
  loading: boolean
  onReconnect?: () => void
  actionSlot?: React.ReactNode
}) {
  return (
    <div className="bg-background-elevated border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-border flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-text-muted" />
          </div>
          <div>
            <p className="font-medium text-text-primary">{name}</p>
            <p className="text-sm text-text-muted mt-0.5">{description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
          ) : connected === null ? null : connected ? (
            <span className="flex items-center gap-1.5 text-sm text-green-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Conectado
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-text-muted">
              <XCircle className="w-4 h-4" />
              No conectado
            </span>
          )}

          {onReconnect && (
            <button
              onClick={onReconnect}
              className={cn(
                "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
                connected
                  ? "border-border text-text-muted hover:border-accent-blue/50 hover:text-accent-blue"
                  : "border-accent-blue/50 text-accent-blue hover:bg-accent-blue/5"
              )}
            >
              <RefreshCw className="w-3 h-3" />
              {connected ? "Reconectar" : "Conectar"}
            </button>
          )}
        </div>
      </div>

      {actionSlot && <div className="mt-4 pt-4 border-t border-border">{actionSlot}</div>}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session } = useSession()
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)

  // Fetch Google integration status
  useEffect(() => {
    async function fetchStatus() {
      setStatusLoading(true)
      try {
        const res = await fetch("/api/integrations/google/status")
        if (res.ok) setGoogleStatus(await res.json())
      } catch {
        // Status fetch failed silently
      } finally {
        setStatusLoading(false)
      }
    }
    fetchStatus()
  }, [])

  async function handleTestGmail() {
    setTestLoading(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/test-gmail", { method: "POST" })
      const data = await res.json()
      setTestResult(res.ok ? { success: true, messageId: data.messageId } : { success: false, error: data.error })
    } catch {
      setTestResult({ success: false, error: "Error de red" })
    } finally {
      setTestLoading(false)
    }
  }

  function handleReconnectGoogle() {
    // Force Google re-auth to get fresh refresh_token
    window.location.href = "/api/auth/signin/google?callbackUrl=/backoffice/settings"
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Configuración" />

      <main className="flex-1 p-6 space-y-8 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Configuración</h1>
          <p className="text-text-muted text-sm mt-1">
            Conectá tus herramientas para que las automatizaciones funcionen.
          </p>
        </div>

        {/* Account section */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Cuenta</h2>
          <div className="bg-background-elevated border border-border rounded-xl p-5">
            <div className="flex items-center gap-4">
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-white font-bold text-lg">
                  {session?.user?.name?.[0] ?? "U"}
                </div>
              )}
              <div>
                <p className="font-semibold text-text-primary">{session?.user?.name ?? "—"}</p>
                <p className="text-sm text-text-muted">{session?.user?.email ?? "—"}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Google integrations */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            Integraciones de Google
          </h2>
          <div className="space-y-3">
            <IntegrationCard
              icon={Mail}
              name="Gmail"
              description="Envía emails de bienvenida, recordatorios y facturas automáticamente desde tu cuenta."
              connected={googleStatus?.gmail ?? null}
              loading={statusLoading}
              onReconnect={handleReconnectGoogle}
              actionSlot={
                googleStatus?.gmail ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTestGmail}
                      disabled={testLoading}
                      className="flex items-center gap-2 text-sm bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
                    >
                      {testLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      {testLoading ? "Enviando..." : "Enviar email de prueba"}
                    </button>

                    {testResult && (
                      <div className={cn("flex items-center gap-2 text-sm", testResult.success ? "text-green-400" : "text-red-400")}>
                        {testResult.success ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Email enviado correctamente
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            {testResult.error}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : null
              }
            />

            <IntegrationCard
              icon={Calendar}
              name="Google Calendar"
              description="Detecta nuevas citas y envía recordatorios automáticos 24h y 2h antes."
              connected={googleStatus?.calendar ?? null}
              loading={statusLoading}
              onReconnect={handleReconnectGoogle}
            />
          </div>
        </section>

        {/* API Keys section */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">
            API Keys (próximamente)
          </h2>
          <div className="space-y-3 opacity-60 pointer-events-none">
            <IntegrationCard
              icon={Key}
              name="OpenAI / Anthropic"
              description="Usá tu propia API key para el análisis de leads y generación de respuestas personalizadas."
              connected={false}
              loading={false}
            />
            <IntegrationCard
              icon={Webhook}
              name="Webhooks"
              description="Recibí eventos de formularios, e-commerce y sistemas externos."
              connected={false}
              loading={false}
            />
          </div>
        </section>
      </main>
    </div>
  )
}
