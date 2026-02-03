"use client"

import { Database, Mail, MessageSquare, Calendar, FileText, BarChart } from "lucide-react"
import { useLocale } from "@/lib/i18n/LocaleProvider"

const integrations = [
  { name: "Pipedrive", icon: Database },
  { name: "Gmail", icon: Mail },
  { name: "Slack", icon: MessageSquare },
  { name: "Calendly", icon: Calendar },
  { name: "Notion", icon: FileText },
  { name: "Analytics", icon: BarChart },
]

export function IntegrationLogos() {
  const { t } = useLocale()

  return (
    <div>
      <h4 className="text-sm font-semibold text-text-muted mb-3 text-center">
        {t('common.integrations.title')}
      </h4>
      <div className="grid grid-cols-3 gap-4">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <div
              key={integration.name}
              className="flex flex-col items-center gap-2 p-3 rounded-lg bg-background-elevated border border-border hover:border-accent-blue/30 transition-colors"
            >
              <Icon className="w-6 h-6 text-text-muted" strokeWidth={1.5} />
              <span className="text-xs text-text-muted">{integration.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
