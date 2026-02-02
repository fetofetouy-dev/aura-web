"use client"

import { Card } from "@/components/ui/Card"
import { AnimatedCounter } from "@/components/animations/AnimatedCounter"
import { IMPACT_METRICS } from "@/lib/demo-data"

export function ImpactMetrics() {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-text-primary mb-4">
        Impacto de la Automatización
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {IMPACT_METRICS.map((metric) => (
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
            <span className="text-text-muted">Tiempo manual:</span>
            <span className="ml-2 font-semibold text-text-primary">~15 minutos</span>
          </div>
          <div className="text-text-muted">→</div>
          <div>
            <span className="text-text-muted">Tiempo automatizado:</span>
            <span className="ml-2 font-semibold text-green-500">0.3 segundos</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
