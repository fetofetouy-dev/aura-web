"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Save,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  FileText,
  Loader2,
  History,
  Send,
  CalendarCheck,
  CalendarX,
  UserPlus,
  UserCheck,
  CreditCard,
  Star,
  MessageCircle,
  ChevronDown,
} from "lucide-react"
import type { Customer, TimelineEntry } from "@/lib/types"

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Timeline state
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [timelineTotal, setTimelineTotal] = useState(0)
  const [timelineLoading, setTimelineLoading] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [notes, setNotes] = useState("")
  const [birthday, setBirthday] = useState("")

  useEffect(() => {
    fetch(`/api/customers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found")
        return r.json()
      })
      .then((data: Customer) => {
        setCustomer(data)
        setName(data.name)
        setEmail(data.email ?? "")
        setPhone(data.phone ?? "")
        setCompany(data.company ?? "")
        setNotes(data.notes ?? "")
        setBirthday(data.birthday ?? "")
      })
      .catch(() => setError("Cliente no encontrado"))
      .finally(() => setLoading(false))
  }, [id])

  const fetchTimeline = useCallback(async (offset = 0) => {
    setTimelineLoading(true)
    try {
      const res = await fetch(`/api/customers/${id}/timeline?limit=20&offset=${offset}`)
      if (!res.ok) return
      const data = await res.json()
      if (offset === 0) {
        setTimeline(data.entries)
      } else {
        setTimeline((prev) => [...prev, ...data.entries])
      }
      setTimelineTotal(data.total)
    } finally {
      setTimelineLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  async function handleSave() {
    setError(null)
    setSuccess(false)
    setSaving(true)

    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        notes: notes || null,
        birthday: birthday || null,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? "Error al guardar")
      return
    }

    setCustomer(data)
    setEditing(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este cliente? Esta acción no se puede deshacer.")) return
    const res = await fetch(`/api/customers/${id}`, { method: "DELETE" })
    if (res.ok) router.push("/backoffice/customers")
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-background-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
  const readClass = "w-full px-3 py-2.5 rounded-lg bg-black/[0.02] border border-transparent text-text-primary text-sm"

  function getTimelineIcon(type: string) {
    const size = "w-3.5 h-3.5"
    switch (type) {
      case "customer_created": return <UserPlus className={size} />
      case "customer_updated": return <UserCheck className={size} />
      case "appointment_scheduled": return <CalendarCheck className={size} />
      case "appointment_completed": return <CalendarCheck className={size} />
      case "appointment_noshow": return <CalendarX className={size} />
      case "email_sent": return <Send className={size} />
      case "email_opened": return <Mail className={size} />
      case "email_clicked": return <Mail className={size} />
      case "payment_received": return <CreditCard className={size} />
      case "whatsapp_sent": case "whatsapp_replied": return <MessageCircle className={size} />
      case "nps_sent": case "nps_responded": return <Star className={size} />
      case "review_requested": case "review_left": return <Star className={size} />
      default: return <Clock className={size} />
    }
  }

  function getTimelineIconStyle(type: string) {
    switch (type) {
      case "customer_created": return "bg-green-400/10 text-green-400"
      case "appointment_scheduled": case "appointment_completed": return "bg-accent-blue/10 text-accent-blue"
      case "appointment_noshow": return "bg-red-400/10 text-red-400"
      case "email_sent": case "email_opened": case "email_clicked": return "bg-amber-400/10 text-amber-400"
      case "payment_received": return "bg-emerald-400/10 text-emerald-400"
      case "whatsapp_sent": case "whatsapp_replied": return "bg-green-400/10 text-green-400"
      default: return "bg-surface-subtle text-text-muted"
    }
  }

  function getTimelineLabel(type: string) {
    const labels: Record<string, string> = {
      customer_created: "Cliente creado",
      customer_updated: "Datos actualizados",
      appointment_scheduled: "Cita agendada",
      appointment_completed: "Cita completada",
      appointment_noshow: "No se presentó",
      email_sent: "Email enviado",
      email_opened: "Email abierto",
      email_clicked: "Click en email",
      payment_received: "Pago recibido",
      invoice_sent: "Factura enviada",
      invoice_overdue: "Factura vencida",
      whatsapp_sent: "WhatsApp enviado",
      whatsapp_replied: "Respuesta por WhatsApp",
      nps_sent: "Encuesta NPS enviada",
      nps_responded: "Respuesta NPS recibida",
      review_requested: "Reseña solicitada",
      review_left: "Reseña dejada",
    }
    return labels[type] || type
  }

  function getTimelineDetail(entry: TimelineEntry): string | null {
    const meta = entry.metadata
    if (!meta) return null
    if (entry.type === "email_sent" && meta.automation) {
      const names: Record<string, string> = {
        "lead-to-crm": "Bienvenida",
        "birthday-reminder": "Cumpleaños",
        "reactivation-reminder": "Reactivación",
      }
      return `Automatización: ${names[meta.automation as string] || meta.automation}`
    }
    if (entry.type === "appointment_scheduled" && meta.title) {
      return String(meta.title)
    }
    if (entry.type === "payment_received" && entry.value) {
      return `$${entry.value.toLocaleString("es-AR")}`
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-text-muted animate-spin" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center py-20">
          <p className="text-text-primary font-medium mb-2">Cliente no encontrado</p>
          <Link href="/backoffice/customers" className="text-sm text-accent-blue hover:underline">
            Volver a clientes
          </Link>
        </div>
      </div>
    )
  }

  const metadata = customer.metadata ?? {}
  const metadataKeys = Object.keys(metadata)

  return (
    <div className="flex-1 p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/backoffice/customers"
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center text-sm font-semibold text-accent-amber shrink-0">
              {customer.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-2xl font-normal text-text-primary">{customer.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-text-muted">
                  Creado el {new Date(customer.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
                {customer.source && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    customer.source === "csv" ? "bg-amber-400/10 text-amber-400" :
                    customer.source?.startsWith("webhook:") ? "bg-amber-400/10 text-amber-400" :
                    "bg-surface-subtle text-text-muted"
                  }`}>
                    {customer.source === "manual" ? "Manual" :
                     customer.source === "csv" ? "CSV" :
                     customer.source?.startsWith("webhook:") ? `Webhook: ${customer.source.split(":")[1]}` :
                     customer.source}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-amber hover:bg-accent-amber/90 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Editar
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditing(false)
                  setName(customer.name)
                  setEmail(customer.email ?? "")
                  setPhone(customer.phone ?? "")
                  setCompany(customer.company ?? "")
                  setNotes(customer.notes ?? "")
                  setBirthday(customer.birthday ?? "")
                  setError(null)
                }}
                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-accent-amber hover:bg-accent-amber/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-green-400/10 border border-green-400/20 text-xs text-green-400 font-medium">
          Cliente actualizado correctamente
        </div>
      )}

      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Main fields */}
      <div className="bg-background-elevated border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Información del cliente</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5">
              Nombre <span className="text-red-400">*</span>
            </label>
            {editing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{customer.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5">
              <Mail className="w-3 h-3" /> Email
            </label>
            {editing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{customer.email || <span className="text-text-muted">—</span>}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5">
              <Phone className="w-3 h-3" /> Teléfono
            </label>
            {editing ? (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{customer.phone || <span className="text-text-muted">—</span>}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5">
              <Building2 className="w-3 h-3" /> Empresa
            </label>
            {editing ? (
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de la empresa"
                className={inputClass}
              />
            ) : (
              <p className={readClass}>{customer.company || <span className="text-text-muted">—</span>}</p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5">
              <Calendar className="w-3 h-3" /> Cumpleaños
            </label>
            {editing ? (
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className={inputClass}
              />
            ) : (
              <p className={readClass}>
                {customer.birthday
                  ? new Date(customer.birthday + "T00:00:00").toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
                  : <span className="text-text-muted">—</span>}
              </p>
            )}
          </div>

          {/* Last interaction */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5">
              <Clock className="w-3 h-3" /> Última interacción
            </label>
            <p className={readClass}>
              {customer.last_interaction_at
                ? new Date(customer.last_interaction_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : <span className="text-text-muted">Sin interacciones</span>}
            </p>
          </div>
        </div>

        {/* Notes - full width */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-text-muted mb-1.5">
            <FileText className="w-3 h-3" /> Notas
          </label>
          {editing ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Información adicional..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          ) : (
            <p className={`${readClass} whitespace-pre-wrap`}>
              {customer.notes || <span className="text-text-muted">Sin notas</span>}
            </p>
          )}
        </div>
      </div>

      {/* Metadata (extra fields from CSV or other imports) */}
      {metadataKeys.length > 0 && (
        <div className="mt-4 bg-background-elevated border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Campos adicionales</h2>
          <p className="text-xs text-text-muted mb-4">
            Datos importados desde CSV u otras fuentes que no tienen un campo estándar en Aura.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {metadataKeys.map((key) => (
              <div key={key}>
                <label className="text-xs font-medium text-text-muted mb-1 block capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <p className="px-3 py-2 rounded-lg bg-black/[0.02] text-text-primary text-sm">
                  {metadata[key] || <span className="text-text-muted">—</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status & Segment */}
      <div className="mt-4 flex items-center gap-3">
        {customer.segment && customer.segment !== "unknown" && (
          <span className="px-2.5 py-1 rounded-full bg-accent-blue/10 text-accent-blue text-xs font-medium">
            {customer.segment}
          </span>
        )}
        {customer.status && customer.status !== "active" && (
          <span className="px-2.5 py-1 rounded-full bg-surface-subtle text-text-muted text-xs font-medium">
            {customer.status}
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="mt-6 bg-background-elevated border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-text-muted" />
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            Historial de actividad
          </h2>
          {timelineTotal > 0 && (
            <span className="text-xs text-text-muted bg-surface-subtle px-2 py-0.5 rounded-full">
              {timelineTotal}
            </span>
          )}
        </div>

        {timeline.length === 0 && !timelineLoading ? (
          <p className="text-sm text-text-muted py-4 text-center">
            Sin actividad registrada aún
          </p>
        ) : (
          <div className="space-y-0">
            {timeline.map((entry, i) => (
              <div key={entry.id} className="flex gap-3 relative">
                {/* Vertical line */}
                {i < timeline.length - 1 && (
                  <div className="absolute left-[13px] top-8 bottom-0 w-px bg-border" />
                )}
                {/* Icon */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getTimelineIconStyle(entry.type)}`}>
                  {getTimelineIcon(entry.type)}
                </div>
                {/* Content */}
                <div className="flex-1 pb-4">
                  <p className="text-sm text-text-primary font-medium">
                    {getTimelineLabel(entry.type)}
                  </p>
                  {getTimelineDetail(entry) && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {getTimelineDetail(entry)}
                    </p>
                  )}
                  <p className="text-[11px] text-text-muted/60 mt-1">
                    {new Date(entry.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {timeline.length < timelineTotal && (
          <button
            onClick={() => fetchTimeline(timeline.length)}
            disabled={timelineLoading}
            className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            {timelineLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Ver más ({timelineTotal - timeline.length} restantes)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
