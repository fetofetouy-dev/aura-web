"use client"

import { ShoppingCart, Briefcase, HeartPulse, Utensils, Home, Store } from "lucide-react"
import { Container } from "@/components/ui/Container"
import { Section } from "@/components/ui/Section"
import { Card } from "@/components/ui/Card"
import { useLocale } from "@/lib/i18n/LocaleProvider"

const iconMap = {
  "shopping-cart": ShoppingCart,
  "briefcase": Briefcase,
  "heart-pulse": HeartPulse,
  "utensils": Utensils,
  "home": Home,
  "store": Store,
}

export function CasosDeUso() {
  const { t } = useLocale()
  const casosDeUso = t('siteContent.casosDeUso')

  return (
    <Section id="casos-de-uso">
      <Container>
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {casosDeUso.title}
          </h2>
          <p className="text-xl text-text-body max-w-3xl mx-auto">
            {casosDeUso.subtitle}
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {casosDeUso.cards.map((card: any) => {
            const Icon = iconMap[card.icon as keyof typeof iconMap]
            return (
              <Card
                key={card.id}
                className="group hover:border-accent-violet/50 hover:glow-aura transition-all duration-300"
              >
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-lg bg-background">
                    <Icon className="w-8 h-8 text-accent-violet" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-4 text-text-primary">
                  {card.title}
                </h3>
                <ul className="space-y-2">
                  {card.items.map((item: any, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-text-body">
                      <svg
                        className="w-5 h-5 text-accent-blue flex-shrink-0 mt-0.5"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
