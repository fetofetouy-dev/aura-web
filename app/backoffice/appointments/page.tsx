"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  AlertTriangle,
} from "lucide-react"
import type { Appointment, AppointmentStatus } from "@/lib/types"

const PAGE_SIZE = 50

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; color: string; bg: string }> = {
  scheduled: { label: "Agendada", color: "text-blue-400", bg: "bg-blue-400/10" },
  confirmed: { label: "Confirmada", color: "text-green-400", bg: "bg-green-400/10" },
  completed: { label: "Completada", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  cancelled: { label: "Cancelada", color: "text-gray-400", bg: "bg-gray-400/10" },
  noshow: { label: "No asistió", color: "text-red-400", bg: "bg-red-400/10" },
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming")

  const fetchAppointments = useCallback(async (p: number, f: typeof filter) => {
    setLoading(true)
    const today = new Date().toISOString().split("T")[0]
    const params = new URLSearchParams({ page: String(p), limit: String(PAGE_SIZE) })

    if (f === "upcoming") params.set("from", today)
    if (f === "past") params.set("to", today)

    const res = await fetch(`/api/appointments?${params}`)
    if (res.ok) {
      const json = await res.json()
      setAppointments(json.data)
      setTotal(json.total)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAppointments(page, filter)
  }, [page, filter, fetchAppointments])

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      )
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta cita?")) return
    const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
    if (res.ok) {
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      setTotal((t) => t - 1)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Citas</h1>
          <p className="text-sm text-text-muted mt-0.5">
            Gestioná las citas de tus clientes. Podés agendar, confirmar, completar o marcar como no-show. Las citas activan automatizaciones de recordatorio por email.
          </p>
          <p className="text-xs text-text-muted mt-1">
            {loading ? "Cargando..." : `${total} cita${total !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/backoffice/appointments/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva cita
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["upcoming", "past", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setPage(1); setFilter(f) }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f
                ? "bg-accent-blue/10 text-accent-blue"
                : "text-text-muted hover:text-text-primary hover:bg-white/5"
            }`}
          >
            {f === "upcoming" ? "Próximas" : f === "past" ? "Pasadas" : "Todas"}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && appointments.length === 0 && page === 1 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <CalendarDays className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-text-primary font-medium mb-1">No hay citas</p>
          <p className="text-text-muted text-sm mb-4">
            Agendá la primera cita para un cliente.
          </p>
          <Link
            href="/backoffice/appointments/new"
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agendar cita
          </Link>
        </div>
      )}

      {/* Appointments list */}
      {!loading && appointments.length > 0 && (
        <div className="space-y-2">
          {appointments.map((apt) => {
            const statusCfg = STATUS_CONFIG[apt.status]
            const customerName = apt.customer?.name ?? "Cliente"

            return (
              <div
                key={apt.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-background-elevated border border-border hover:border-accent-blue/30 transition-colors group"
              >
                {/* Date badge */}
                <div className="w-12 h-12 rounded-lg bg-accent-blue/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-accent-blue">
                    {new Date(apt.date + "T00:00:00").toLocaleDateString("es-AR", { month: "short" }).toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-accent-blue">
                    {new Date(apt.date + "T00:00:00").getDate()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{apt.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <User className="w-3 h-3" />
                      {customerName}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="w-3 h-3" />
                      {apt.start_time.slice(0, 5)} – {apt.end_time.slice(0, 5)}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusCfg.color} ${statusCfg.bg} shrink-0`}>
                  {statusCfg.label}
                </span>

                {/* Quick actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {apt.status === "scheduled" && (
                    <button
                      onClick={() => handleStatusChange(apt.id, "confirmed")}
                      title="Confirmar"
                      className="p-1.5 rounded-lg text-text-muted hover:text-green-400 hover:bg-green-400/10 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {(apt.status === "scheduled" || apt.status === "confirmed") && (
                    <>
                      <button
                        onClick={() => handleStatusChange(apt.id, "completed")}
                        title="Completar"
                        className="p-1.5 rounded-lg text-text-muted hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt.id, "noshow")}
                        title="No asistió"
                        className="p-1.5 rounded-lg text-text-muted hover:text-orange-400 hover:bg-orange-400/10 transition-colors"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt.id, "cancelled")}
                        title="Cancelar"
                        className="p-1.5 rounded-lg text-text-muted hover:text-gray-400 hover:bg-gray-400/10 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(apt.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary disabled:opacity-30 border border-border rounded-lg transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Anterior
          </button>
          <span className="text-xs text-text-muted">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 text-xs text-text-muted hover:text-text-primary disabled:opacity-30 border border-border rounded-lg transition-colors"
          >
            Siguiente
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
