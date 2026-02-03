"use client"

import { Zap, Target, Handshake } from "lucide-react"
import { Container } from "@/components/ui/Container"
import { Section } from "@/components/ui/Section"
import { Card } from "@/components/ui/Card"
import { useLocale } from "@/lib/i18n/LocaleProvider"

const iconMap = {
  "zap": Zap,
  "target": Target,
  "handshake": Handshake,
}

export function PorQueAura() {
  const { t } = useLocale()
  const porQueAura = t('siteContent.porQueAura')

  return (
    <Section id="por-que-aura" background="elevated">
      <Container>
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {porQueAura.title}
          </h2>
          <p className="text-xl text-text-body max-w-2xl mx-auto">
            {porQueAura.subtitle}
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {porQueAura.pillars.map((pillar) => {
            const Icon = iconMap[pillar.icon]
            return (
              <Card key={pillar.id} className="text-center hover:glow-aura transition-all duration-300">
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex p-4 rounded-full bg-gradient-aura">
                    <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-text-primary">
                  {pillar.title}
                </h3>
                <p className="text-text-body leading-relaxed">
                  {pillar.description}
                </p>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
