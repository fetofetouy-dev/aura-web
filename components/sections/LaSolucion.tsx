"use client"

import { Search, Cpu, Rocket } from "lucide-react"
import { Container } from "@/components/ui/Container"
import { Section } from "@/components/ui/Section"
import { FadeIn } from "@/components/animations/FadeIn"
import { useLocale } from "@/lib/i18n/LocaleProvider"

const iconMap = {
  "search": Search,
  "cpu": Cpu,
  "rocket": Rocket,
}

export function LaSolucion() {
  const { t } = useLocale()
  const solucion = t('siteContent.solucion')

  return (
    <Section id="solucion">
      <Container>
        {/* Title */}
        <div className="text-center mb-20">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {solucion.title}
            </h2>
            <p className="text-xl text-text-body max-w-2xl mx-auto">
              {solucion.subtitle}
            </p>
          </FadeIn>
        </div>

        {/* Timeline - Horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-aura opacity-20" />

          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {solucion.steps.map((step: any, index: number) => {
              const Icon = iconMap[step.icon as keyof typeof iconMap]
              return (
                <FadeIn key={step.id} delay={0.1 * (index + 1)}>
                  <div className="relative flex flex-col items-center text-center">
                    {/* Icon Circle */}
                    <div className="relative z-10 mb-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-aura flex items-center justify-center glow-aura">
                        <Icon className="w-12 h-12 text-white" strokeWidth={2} />
                      </div>
                      {/* Step Number */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background-elevated border-2 border-accent-blue flex items-center justify-center">
                        <span className="text-sm font-bold text-accent-blue">
                          {index + 1}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 text-text-primary">
                      {step.title}
                    </h3>
                    <p className="text-text-body leading-relaxed max-w-xs">
                      {step.description}
                    </p>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </Container>
    </Section>
  )
}
