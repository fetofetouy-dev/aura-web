"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { CheckCircle2, XCircle, Loader2, Mail, Calendar, Key, Webhook, RefreshCw, Send, AlertCircle, Plus, Copy, Trash2, Check } from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { cn } from "@/lib/cn"

interface GoogleStatus { gmail: boolean; calendar: boolean }
interface TestResult { success: boolean; messageId?: string; error?: string }
interface WebhookEndpoint {
  id: string; source: string; name: string; secret_key: string; is_active: boolean
}

function IntegrationCard({ icon: Icon, name, description, connected, loading, onReconnect, actionSlot }: {
  icon: React.ComponentType<{ className?: string }>; name: string; description: string
  connected: boolean | null; loading: boolean; onReconnect?: () => void; actionSlot?: React.ReactNode
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
          {loading ? <Loader2 className="w-4 h-4 text-text-muted animate-spin" />
            : connected === null ? null : connected
            ? <span className="flex items-center gap-1.5 text-sm text-green-400 font-medium"><CheckCircle2 className="w-4 h-4" /> Conectado</span>
            : <span className="flex items-center gap-1.5 text-sm text-text-muted"><XCircle className="w-4 h-4" /> No conectado</span>}
          {onReconnect && (
            <button onClick={onReconnect} className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors",
              connected ? "border-border text-text-muted hover:border-accent-blue/50 hover:text-accent-blue" : "border-accent-blue/50 text-accent-blue hover:bg-accent-blue/5")}>
              <RefreshCw className="w-3 h-3" />{connected ? "Reconectar" : "Conectar"}
            </button>
          )}
        </div>
      </div>
      {actionSlot && <div className="mt-4 pt-4 border-t border-border">{actionSlot}</div>}
    </div>
  )
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>([])
  const [webhooksLoading, setWebhooksLoading] = useState(true)
  const [creatingWebhook, setCreatingWebhook] = useState(false)
  const [newWhSource, setNewWhSource] = useState("")
  const [newWhName, setNewWhName] = useState("")
  const [whError, setWhError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    fetch("/api/integrations/google/status")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setGoogleStatus(d) })
      .finally(() => setStatusLoading(false))
  }, [])

  useEffect(() => {
    fetch("/api/webhooks/manage")
      .then(r => r.ok ? r.json() : [])
      .then(d => setWebhooks(d))
      .finally(() => setWebhooksLoading(false))
  }, [])

  async function handleTestGmail() {
    setTestLoading(true); setTestResult(null)
    try {
      const res = await fetch("/api/test-gmail", { method: "POST" })
      const data = await res.json()
      setTestResult(res.ok ? { success: true, messageId: data.messageId } : { success: false, error: data.error })
    } catch { setTestResult({ success: false, error: "Error de red" }) }
    finally { setTestLoading(false) }
  }

  async function handleCreateWebhook() {
    if (!newWhSource.trim() || !newWhName.trim()) return
    setCreatingWebhook(true); setWhError(null)
    const res = await fetch("/api/webhooks/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: newWhSource.trim(), name: newWhName.trim() }),
    })
    const data = await res.json()
    setCreatingWebhook(false)
    if (!res.ok) { setWhError(data.error); return }
    setWebhooks(prev => [data, ...prev])
    setNewWhSource(""); setNewWhName("")
  }

  async function handleToggleWebhook(id: string, isActive: boolean) {
    const res = await fetch(`/api/webhooks/manage/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !isActive }),
    })
    if (res.ok) {
      const updated = await res.json()
      setWebhooks(prev => prev.map(w => w.id === id ? updated : w))
    }
  }

  async function handleDeleteWebhook(id: string) {
    if (!confirm("¿Eliminar este webhook? Los sistemas externos dejarán de poder enviar datos.")) return
    const res = await fetch(`/api/webhooks/manage/${id}`, { method: "DELETE" })
    if (res.ok) setWebhooks(prev => prev.filter(w => w.id !== id))
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function handleConnectGoogle() {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/backoffice/settings`,
        scopes: ["https://www.googleapis.com/auth/gmail.send","https://www.googleapis.com/auth/gmail.readonly","https://www.googleapis.com/auth/calendar.events"].join(" "),
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    })
  }

  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "—"

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Configuración" />
      <main className="flex-1 p-6 space-y-8 max-w-3xl">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Configuración</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Conectá tu cuenta de Google para habilitar el envío automático de emails. Sin Gmail conectado, las automatizaciones no pueden enviar emails a tus clientes.
          </p>
        </div>

        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Cuenta</h2>
          <div className="bg-background-elevated border border-border rounded-xl p-5">
            <div className="flex items-center gap-4">
              {user?.user_metadata?.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={user.user_metadata.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-white font-bold text-lg">{name[0]?.toUpperCase() ?? "U"}</div>}
              <div>
                <p className="font-semibold text-text-primary">{name}</p>
                <p className="text-sm text-text-muted">{user?.email ?? "—"}</p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Integraciones de Google</h2>
          <div className="space-y-3">
            <IntegrationCard icon={Mail} name="Gmail" description="Envía emails de bienvenida, recordatorios y facturas automáticamente desde tu cuenta."
              connected={googleStatus?.gmail ?? null} loading={statusLoading} onReconnect={handleConnectGoogle}
              actionSlot={googleStatus?.gmail ? (
                <div className="flex items-center gap-3">
                  <button onClick={handleTestGmail} disabled={testLoading}
                    className="flex items-center gap-2 text-sm bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 px-4 py-2 rounded-lg transition-colors disabled:opacity-60">
                    {testLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {testLoading ? "Enviando..." : "Enviar email de prueba"}
                  </button>
                  {testResult && (
                    <div className={cn("flex items-center gap-2 text-sm", testResult.success ? "text-green-400" : "text-red-400")}>
                      {testResult.success ? <><CheckCircle2 className="w-4 h-4" /> Email enviado</> : <><AlertCircle className="w-4 h-4" /> {testResult.error}</>}
                    </div>
                  )}
                </div>
              ) : null} />
            <IntegrationCard icon={Calendar} name="Google Calendar" description="Detecta nuevas citas y envía recordatorios automáticos 24h y 2h antes."
              connected={googleStatus?.calendar ?? null} loading={statusLoading} onReconnect={handleConnectGoogle} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Webhooks entrantes</h2>
          <p className="text-sm text-text-muted mb-4">
            Conectá tu sistema (CRM, agenda, e-commerce) para que envíe datos a Aura automáticamente. Cada webhook tiene una URL y un secret key que tu sistema debe usar para autenticarse.
          </p>

          {/* Create new webhook */}
          <div className="bg-background-elevated border border-border rounded-xl p-5 mb-3">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-text-muted mb-1.5 block">Nombre</label>
                <input
                  type="text"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  placeholder="Mi CRM, Calendly, etc."
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>
              <div className="w-40">
                <label className="text-xs font-medium text-text-muted mb-1.5 block">Source (ID)</label>
                <input
                  type="text"
                  value={newWhSource}
                  onChange={(e) => setNewWhSource(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="mi-crm"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors font-mono"
                />
              </div>
              <button
                onClick={handleCreateWebhook}
                disabled={creatingWebhook || !newWhSource.trim() || !newWhName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
              >
                {creatingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Crear
              </button>
            </div>
            {whError && (
              <p className="mt-2 text-xs text-red-400">{whError}</p>
            )}
          </div>

          {/* Webhook list */}
          {webhooksLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              <Webhook className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No tenés webhooks configurados. Creá uno para empezar a recibir datos.
            </div>
          ) : (
            <div className="space-y-2">
              {webhooks.map((wh) => (
                <div key={wh.id} className="bg-background-elevated border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", wh.is_active ? "bg-green-400" : "bg-white/20")} />
                      <p className="font-medium text-text-primary text-sm">{wh.name}</p>
                      <span className="text-xs text-text-muted font-mono bg-white/5 px-2 py-0.5 rounded">{wh.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleWebhook(wh.id, wh.is_active)}
                        className={cn("text-xs px-3 py-1 rounded-lg border transition-colors",
                          wh.is_active ? "border-border text-text-muted hover:text-amber-400 hover:border-amber-400/30" : "border-green-400/30 text-green-400 hover:bg-green-400/5")}
                      >
                        {wh.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* URL */}
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">URL</label>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="flex-1 text-xs text-text-primary bg-background px-3 py-1.5 rounded-lg border border-border font-mono truncate">
                          {typeof window !== "undefined" ? window.location.origin : "https://aura-web-omega.vercel.app"}/api/webhooks/{wh.source}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${typeof window !== "undefined" ? window.location.origin : "https://aura-web-omega.vercel.app"}/api/webhooks/${wh.source}`, `url-${wh.id}`)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors shrink-0"
                        >
                          {copiedId === `url-${wh.id}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Secret */}
                    <div>
                      <label className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Secret (header x-aura-secret)</label>
                      <div className="flex items-center gap-2 mt-0.5">
                        <code className="flex-1 text-xs text-text-primary bg-background px-3 py-1.5 rounded-lg border border-border font-mono truncate">
                          {wh.secret_key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(wh.secret_key, `secret-${wh.id}`)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 transition-colors shrink-0"
                        >
                          {copiedId === `secret-${wh.id}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">API Keys (próximamente)</h2>
          <div className="space-y-3 opacity-60 pointer-events-none">
            <IntegrationCard icon={Key} name="OpenAI / Anthropic" description="Usá tu propia API key para análisis de leads." connected={false} loading={false} />
          </div>
        </section>
      </main>
    </div>
  )
}
