"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Zap, AlertTriangle, CheckCircle, XCircle } from "lucide-react"

export default function NewCustomerPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null)
  const [automationResult, setAutomationResult] = useState<{ success: boolean; error?: string } | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    fetch("/api/integrations/google/status")
      .then((r) => r.json())
      .then((data) => setGmailConnected(!!data.gmail))
      .catch(() => setGmailConnected(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setAutomationResult(null)
    setSaving(true)

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, company, notes }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Error al guardar")
      setSaving(false)
      return
    }

    // If there was an automation attempt, show the result before redirecting
    if (data.automationResult) {
      setAutomationResult(data.automationResult)
      setSaving(false)
      // Redirect after 3s so the user can read the result
      setTimeout(() => router.push("/backoffice/customers"), 3000)
    } else {
      router.push("/backoffice/customers")
    }
  }

  return (
    <div className="flex-1 p-6 max-w-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/backoffice/customers"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Nuevo cliente</h1>
          <p className="text-sm text-text-muted mt-0.5">Completá los datos del cliente</p>
        </div>
      </div>

      {/* Automation result (shown after save) */}
      {automationResult && (
        <div className={`flex items-start gap-3 p-3 rounded-lg border mb-6 ${
          automationResult.success
            ? "bg-green-400/10 border-green-400/20"
            : "bg-yellow-400/10 border-yellow-400/20"
        }`}>
          {automationResult.success ? (
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
          )}
          <div>
            <p className={`text-xs font-medium ${automationResult.success ? "text-green-400" : "text-yellow-400"}`}>
              {automationResult.success
                ? "Cliente guardado. Email de bienvenida enviado correctamente."
                : "Cliente guardado, pero no se pudo enviar el email de bienvenida."}
            </p>
            {!automationResult.success && automationResult.error && (
              <p className="text-xs text-text-muted mt-0.5">
                {automationResult.error.includes("Gmail no conectado")
                  ? <>Gmail no está conectado. <Link href="/backoffice/settings" className="text-accent-blue hover:underline">Conectalo en Configuración</Link>.</>
                  : automationResult.error
                }
              </p>
            )}
            <p className="text-xs text-text-muted mt-1">Redirigiendo a clientes...</p>
          </div>
        </div>
      )}

      {/* Automation notice (shown while filling form, only when email is typed) */}
      {!automationResult && email.trim() && (
        gmailConnected === false ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-400/10 border border-yellow-400/20 mb-6">
            <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-400">
              Gmail no está conectado. No se enviará el email de bienvenida automáticamente.{" "}
              <Link href="/backoffice/settings" className="underline hover:text-yellow-300">
                Conectar Gmail en Configuración
              </Link>
              .
            </p>
          </div>
        ) : gmailConnected === true ? (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-accent-blue/10 border border-accent-blue/20 mb-6">
            <Zap className="w-4 h-4 text-accent-blue mt-0.5 shrink-0" />
            <p className="text-xs text-accent-blue">
              Se enviará un email de bienvenida automáticamente a <strong>{email}</strong> al guardar.
            </p>
          </div>
        ) : null
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ej: Juan García"
            className="w-full px-3 py-2.5 rounded-lg bg-background-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@empresa.com"
            className="w-full px-3 py-2.5 rounded-lg bg-background-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+54 9 11 1234-5678"
            className="w-full px-3 py-2.5 rounded-lg bg-background-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Empresa</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Nombre de la empresa"
            className="w-full px-3 py-2.5 rounded-lg bg-background-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">Notas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Información adicional..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg bg-background-elevated border border-border text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-accent-blue transition-colors resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* Actions */}
        {!automationResult && (
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? "Guardando..." : "Guardar cliente"}
            </button>
            <Link
              href="/backoffice/customers"
              className="px-4 py-2.5 text-sm text-text-muted hover:text-text-primary border border-border rounded-lg transition-colors"
            >
              Cancelar
            </Link>
          </div>
        )}
      </form>
    </div>
  )
}
