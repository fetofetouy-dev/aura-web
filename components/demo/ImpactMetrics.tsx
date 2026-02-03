"use client"

import { Card } from "@/components/ui/Card"
import { AnimatedCounter } from "@/components/animations/AnimatedCounter"
import { useLocale } from "@/lib/i18n/LocaleProvider"

export function ImpactMetrics() {
  const { t } = useLocale()
  const impactMetrics = t('demo.impactMetrics')

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-text-primary mb-4">
        {t('common.impacts.title')}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {impactMetrics.map((metric: any) => (
          <Card
            key={metric.id}
            className="text-center p-6 border-accent-blue/30 hover:glow-aura transition-all"
          >
            <div className="text-4xl mb-2">{metric.icon}</div>
            <div className="text-3xl font-bold text-text-primary mb-2">
              <AnimatedCounter
                end={metric.value}
                suffix={metric.suffix}
                duration={1.5}
              />
            </div>
            <div className="text-sm text-text-body">{metric.label}</div>
          </Card>
        ))}
      </div>

      {/* Comparison */}
      <Card className="p-4 bg-background-elevated border-green-500/30">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-text-muted">{t('common.impacts.manualTime')}</span>
            <span className="ml-2 font-semibold text-text-primary">{t('common.impacts.manualTimeValue')}</span>
          </div>
          <div className="text-text-muted">→</div>
          <div>
            <span className="text-text-muted">{t('common.impacts.automatedTime')}</span>
            <span className="ml-2 font-semibold text-green-500">{t('common.impacts.automatedTimeValue')}</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
