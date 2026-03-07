"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"
import { CheckCircle2, XCircle, Loader2, Mail, Calendar, Key, Webhook, RefreshCw, Send, AlertCircle, Plus, Copy, Trash2, Check, CreditCard, MessageCircle, Camera } from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { cn } from "@/lib/cn"

interface GoogleStatus { gmail: boolean; calendar: boolean }
interface TestResult { success: boolean; messageId?: string; error?: string }
interface WebhookEndpoint {
  id: string; source: string; name: string; secret_key: string; is_active: boolean
}
interface SyncInfo {
  status: string; records_created: number; records_updated: number; started_at: string; completed_at: string | null; error: string | null
}
interface ConnectorsStatus {
  google: { gmail: boolean; calendar: boolean; lastSync: SyncInfo | null }
  mercadopago: { connected: boolean; lastSync: SyncInfo | null }
  instagram: { connected: boolean; lastSync: SyncInfo | null }
  whatsapp: { connected: boolean; lastSync: SyncInfo | null }
}

function IntegrationCard({ icon: Icon, name, description, connected, loading, onReconnect, actionSlot }: {
  icon: React.ComponentType<{ className?: string }>; name: string; description: string
  connected: boolean | null; loading: boolean; onReconnect?: () => void; actionSlot?: React.ReactNode
}) {
  return (
    <div className="bg-background-elevated border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-border flex items-center justify-center shrink-0">
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
  const [connectorsStatus, setConnectorsStatus] = useState<ConnectorsStatus | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  useEffect(() => {
    fetch("/api/integrations/google/status")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setGoogleStatus(d) })
      .finally(() => setStatusLoading(false))

    fetch("/api/connectors/status")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setConnectorsStatus(d) })
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
    if (!newWhName.trim()) return
    // Auto-generate source ID from name
    const autoSource = newWhSource.trim() || newWhName.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    if (!autoSource) return
    setCreatingWebhook(true); setWhError(null)
    const res = await fetch("/api/webhooks/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: autoSource, name: newWhName.trim() }),
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

  function formatTimeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "hace segundos"
    if (mins < 60) return `hace ${mins} min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return `hace ${Math.floor(hrs / 24)}d`
  }

  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "—"

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Configuración" />
      <main className="flex-1 p-6 space-y-8 max-w-3xl">
        <div>
          <h1 className="font-serif text-2xl font-normal text-text-primary">Configuración</h1>
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
                : <div className="w-12 h-12 rounded-full bg-accent-amber/20 flex items-center justify-center text-accent-amber font-bold text-lg">{name[0]?.toUpperCase() ?? "U"}</div>}
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
            <IntegrationCard icon={Calendar} name="Google Calendar" description="Sincroniza tus citas y clientes automáticamente cada 15 minutos."
              connected={googleStatus?.calendar ?? null} loading={statusLoading} onReconnect={handleConnectGoogle}
              actionSlot={googleStatus?.calendar && connectorsStatus?.google?.lastSync ? (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                  <span>Última sincronización: {formatTimeAgo(connectorsStatus.google.lastSync.completed_at ?? connectorsStatus.google.lastSync.started_at)}</span>
                  {connectorsStatus.google.lastSync.records_created > 0 && (
                    <span className="text-green-400">+{connectorsStatus.google.lastSync.records_created} nuevos</span>
                  )}
                </div>
              ) : null} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Conectores (próximamente)</h2>
          <p className="text-sm text-text-muted mb-3">
            Conectá tus herramientas con un clic. Aura importa los datos automáticamente.
          </p>
          <div className="space-y-3 opacity-60 pointer-events-none">
            <IntegrationCard icon={CreditCard} name="MercadoPago" description="Cada pago que recibís crea o actualiza un cliente automáticamente."
              connected={false} loading={false} />
            <IntegrationCard icon={Camera} name="Instagram" description="Los mensajes directos que recibís se convierten en leads automáticamente."
              connected={false} loading={false} />
            <IntegrationCard icon={MessageCircle} name="WhatsApp" description="Los mensajes de clientes crean contactos y registran interacciones."
              connected={false} loading={false} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Conexiones externas</h2>
          <p className="text-sm text-text-muted mb-2">
            Conectá tu sistema de gestión (agenda, CRM, e-commerce) para que Aura reciba los datos de tus clientes automáticamente, sin que tengas que cargarlos a mano.
          </p>
          <p className="text-xs text-text-muted mb-4">
            Cada conexión genera una dirección y una clave que le pasás a tu proveedor de software para que configure el envío de datos hacia Aura.
          </p>

          {/* Create new connection */}
          <div className="bg-background-elevated border border-border rounded-xl p-5 mb-3">
            <p className="text-sm font-medium text-text-primary mb-3">Nueva conexión</p>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs font-medium text-text-muted mb-1.5 block">
                  Nombre del sistema que va a enviar datos
                </label>
                <input
                  type="text"
                  value={newWhName}
                  onChange={(e) => setNewWhName(e.target.value)}
                  placeholder="Ej: Mi agenda, Calendly, TiendaNube..."
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
                />
              </div>
              <button
                onClick={handleCreateWebhook}
                disabled={creatingWebhook || !newWhName.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
              >
                {creatingWebhook ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Crear conexión
              </button>
            </div>
            {whError && (
              <p className="mt-2 text-xs text-red-400">{whError}</p>
            )}
          </div>

          {/* Connection list */}
          {webhooksLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-surface-subtle animate-pulse" />)}
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-text-muted text-sm">
              <Webhook className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>Todavía no tenés conexiones configuradas.</p>
              <p className="mt-1 text-xs">Creá una conexión y compartí los datos con tu proveedor de software.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {webhooks.map((wh) => (
                <div key={wh.id} className="bg-background-elevated border border-border rounded-xl p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2.5 h-2.5 rounded-full", wh.is_active ? "bg-green-400" : "bg-border")} />
                      <p className="font-medium text-text-primary">{wh.name}</p>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", wh.is_active ? "bg-green-400/10 text-green-400" : "bg-surface-subtle text-text-muted")}>
                        {wh.is_active ? "Activa" : "Pausada"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleWebhook(wh.id, wh.is_active)}
                        className={cn("text-xs px-3 py-1 rounded-lg border transition-colors",
                          wh.is_active ? "border-border text-text-muted hover:text-amber-400 hover:border-amber-400/30" : "border-green-400/30 text-green-400 hover:bg-green-400/5")}
                      >
                        {wh.is_active ? "Pausar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDeleteWebhook(wh.id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-background rounded-lg border border-border p-4 mb-3">
                    <p className="text-xs font-medium text-text-primary mb-2">
                      Compartí estos datos con tu proveedor de software o equipo técnico:
                    </p>
                    <p className="text-[11px] text-text-muted mb-3">
                      Pediles que configuren el envío de datos hacia esta dirección. Si no sabés cómo hacerlo, compartilos por email o WhatsApp con tu proveedor.
                    </p>

                    {/* URL */}
                    <div className="mb-2">
                      <label className="text-[10px] font-medium text-text-muted mb-1 block">Dirección de envío (URL)</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-text-primary bg-background-elevated px-3 py-2 rounded-lg border border-border font-mono truncate">
                          {typeof window !== "undefined" ? window.location.origin : "https://aura-web-omega.vercel.app"}/api/webhooks/{wh.source}
                        </code>
                        <button
                          onClick={() => copyToClipboard(`${typeof window !== "undefined" ? window.location.origin : "https://aura-web-omega.vercel.app"}/api/webhooks/${wh.source}`, `url-${wh.id}`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 border border-border transition-colors shrink-0"
                        >
                          {copiedId === `url-${wh.id}` ? <><Check className="w-3 h-3 text-green-400" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                        </button>
                      </div>
                    </div>

                    {/* Secret */}
                    <div>
                      <label className="text-[10px] font-medium text-text-muted mb-1 block">Clave secreta (va en el header x-aura-secret)</label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-text-primary bg-background-elevated px-3 py-2 rounded-lg border border-border font-mono truncate">
                          {wh.secret_key}
                        </code>
                        <button
                          onClick={() => copyToClipboard(wh.secret_key, `secret-${wh.id}`)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-text-muted hover:text-accent-blue hover:bg-accent-blue/10 border border-border transition-colors shrink-0"
                        >
                          {copiedId === `secret-${wh.id}` ? <><Check className="w-3 h-3 text-green-400" /> Copiado</> : <><Copy className="w-3 h-3" /> Copiar</>}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-text-muted">
                    Cuando el sistema externo envíe datos a esta dirección, Aura los va a recibir y agregar automáticamente a tu base de clientes.
                  </p>
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
