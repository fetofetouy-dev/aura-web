"use client"

import { useState } from "react"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { useLocale } from "@/lib/i18n/LocaleProvider"

interface LeadFormProps {
  onSubmit: () => void
}

export function LeadForm({ onSubmit }: LeadFormProps) {
  const { t } = useLocale()
  const demoLead = t('demo.lead')
  const [formData, setFormData] = useState(demoLead)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-text-primary mb-2">
          {t('common.demo.title')}
        </h3>
        <p className="text-sm text-text-muted">
          {t('common.demo.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            {t('common.labels.name')}
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
            {t('common.labels.email')}
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
            {t('common.labels.company')}
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
            {t('common.labels.interest')}
          </label>
          <select
            value={formData.interest}
            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            {t('common.interests').map((interest: string, idx: number) => (
              <option key={idx}>{interest}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-body mb-1">
            {t('common.labels.source')}
          </label>
          <select
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-blue"
          >
            {t('common.sources').map((source: string, idx: number) => (
              <option key={idx}>{source}</option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="primary" className="w-full">
          {t('common.buttons.startAutomation')}
        </Button>
      </form>
    </Card>
  )
}
