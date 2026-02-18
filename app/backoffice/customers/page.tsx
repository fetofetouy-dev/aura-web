"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Plus, Mail, Phone, Building2, Trash2, ChevronRight } from "lucide-react"

interface Customer {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  status: string
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function fetchCustomers() {
    const res = await fetch("/api/customers")
    if (res.ok) {
      const data = await res.json()
      setCustomers(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cliente?")) return
    setDeletingId(id)
    await fetch(`/api/customers/${id}`, { method: "DELETE" })
    setCustomers((prev) => prev.filter((c) => c.id !== id))
    setDeletingId(null)
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Clientes</h1>
          <p className="text-sm text-text-muted mt-0.5">
            {loading ? "Cargando..." : `${customers.length} cliente${customers.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/backoffice/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo cliente
        </Link>
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
      {!loading && customers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-text-muted" />
          </div>
          <p className="text-text-primary font-medium mb-1">Todavía no tenés clientes</p>
          <p className="text-text-muted text-sm mb-4">
            Agregá tu primer cliente y Aura enviará el email de bienvenida automáticamente.
          </p>
          <Link
            href="/backoffice/customers/new"
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white text-sm font-medium rounded-lg hover:bg-accent-blue/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar primer cliente
          </Link>
        </div>
      )}

      {/* Customer list */}
      {!loading && customers.length > 0 && (
        <div className="space-y-2">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-background-elevated border border-border hover:border-accent-blue/30 transition-colors group"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-blue/20 to-accent-violet/20 flex items-center justify-center text-sm font-semibold text-accent-blue shrink-0">
                {customer.name[0]?.toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{customer.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  {customer.email && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </span>
                  )}
                  {customer.phone && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Phone className="w-3 h-3" />
                      {customer.phone}
                    </span>
                  )}
                  {customer.company && (
                    <span className="flex items-center gap-1 text-xs text-text-muted">
                      <Building2 className="w-3 h-3" />
                      {customer.company}
                    </span>
                  )}
                </div>
              </div>

              {/* Date */}
              <span className="text-xs text-text-muted shrink-0 hidden sm:block">
                {new Date(customer.created_at).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(customer.id)}
                  disabled={deletingId === customer.id}
                  className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-text-muted" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
