"use client"

import { useEffect, useState, use } from "react"
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
} from "lucide-react"
import type { Customer } from "@/lib/types"

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
  const readClass = "w-full px-3 py-2.5 rounded-lg bg-white/[0.02] border border-transparent text-text-primary text-sm"

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
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-violet/20 flex items-center justify-center text-sm font-semibold text-accent-blue shrink-0">
              {customer.name[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-text-primary">{customer.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-xs text-text-muted">
                  Creado el {new Date(customer.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })}
                </p>
                {customer.source && (
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    customer.source === "csv" ? "bg-amber-400/10 text-amber-400" :
                    customer.source?.startsWith("webhook:") ? "bg-violet-400/10 text-violet-400" :
                    "bg-white/5 text-text-muted"
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
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium rounded-lg transition-colors"
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
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
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
                <p className="px-3 py-2 rounded-lg bg-white/[0.02] text-text-primary text-sm">
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
          <span className="px-2.5 py-1 rounded-full bg-white/5 text-text-muted text-xs font-medium">
            {customer.status}
          </span>
        )}
      </div>
    </div>
  )
}
