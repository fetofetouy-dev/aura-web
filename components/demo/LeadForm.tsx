"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { DEMO_LEAD } from "@/lib/demo-data"

interface LeadFormProps {
  onSubmit: () => void
}

export function LeadForm({ onSubmit }: LeadFormProps) {
  const [formData, setFormData] = useState(DEMO_LEAD)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          🎯 Simulador: Nuevo Lead Detectado
        </h3>
        <p className="text-sm text-text-muted">
          Completa los datos y activa la automatización
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Nombre
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Empresa
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Interés
          </label>
          <select
            value={formData.interest}
            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option>Automatización de marketing</option>
            <option>Gestión de leads</option>
            <option>Atención al cliente</option>
            <option>Generación de contenido</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            Origen
          </label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            <option>LinkedIn</option>
            <option>Google</option>
            <option>Referido</option>
            <option>Email</option>
          </select>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          ▶ Activar Automatización
        </Button>
      </form>
    </Card>
  )
}
