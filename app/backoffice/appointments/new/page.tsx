"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Customer } from "@/lib/types"

export default function NewAppointmentPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)

  const [customerId, setCustomerId] = useState("")
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((data) => setCustomers(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingCustomers(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: customerId,
        title,
        date,
        start_time: startTime,
        end_time: endTime,
        notes: notes || undefined,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Error al guardar")
      setSaving(false)
      return
    }

    router.push("/backoffice/appointments")
  }

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-background-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"

  return (
    <div className="flex-1 p-6 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/backoffice/appointments"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Nueva cita</h1>
          <p className="text-sm text-text-muted mt-0.5">Agendá una cita para un cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Cliente <span className="text-red-400">*</span>
          </label>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
            className={inputClass}
          >
            <option value="">
              {loadingCustomers ? "Cargando clientes..." : "Seleccioná un cliente"}
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.email ? `(${c.email})` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ej: Consulta inicial, Sesión de seguimiento"
            className={inputClass}
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Fecha <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {/* Time row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Hora inicio <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Hora fin <span className="text-red-400">*</span>
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className={inputClass}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional sobre la cita..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-2.5 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {saving ? "Guardando..." : "Agendar cita"}
          </button>
          <Link
            href="/backoffice/appointments"
            className="px-4 py-2.5 text-sm text-text-muted hover:text-text-primary border border-border rounded-lg transition-colors"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  )
}
