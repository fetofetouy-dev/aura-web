import { ClipboardList, Clock, FileText } from "lucide-react"
import { Container } from "@/components/ui/Container"
import { Section } from "@/components/ui/Section"
import { Card } from "@/components/ui/Card"
import { SITE_CONTENT } from "@/lib/constants"

const iconMap = {
  "clipboard-list": ClipboardList,
  "clock": Clock,
  "file-text": FileText,
}

export function ElProblema() {
  const { problema } = SITE_CONTENT

  return (
    <Section id="problema">
      <Container>
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {problema.title}
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problema.cards.map((card) => {
            const Icon = iconMap[card.icon]
            return (
              <Card key={card.id} className="hover:border-accent-blue/50 transition-all duration-300">
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-lg bg-background">
                    <Icon className="w-8 h-8 text-accent-blue" strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-text-primary">
                  {card.title}
                </h3>
                <p className="text-text-body leading-relaxed">
                  {card.description}
                </p>
              </Card>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
