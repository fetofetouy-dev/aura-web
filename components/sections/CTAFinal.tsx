"use client"

import { Container } from "@/components/ui/Container"
import { Section } from "@/components/ui/Section"
import { Button } from "@/components/ui/Button"
import { GradientText } from "@/components/ui/GradientText"
import { SITE_CONTENT } from "@/lib/constants"

export function CTAFinal() {
  const { ctaFinal } = SITE_CONTENT

  return (
    <Section id="contacto" className="relative overflow-hidden">
      {/* Gradient Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background-elevated to-background opacity-50" />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent-blue/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-accent-violet/10 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            <GradientText>{ctaFinal.title}</GradientText>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-text-body mb-12 max-w-2xl mx-auto">
            {ctaFinal.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                // Scroll to demo section to see automation example
                document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Ver Ejemplo de Automatización
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                // Download case study
                window.open("/caso-estudio-aura.md", "_blank")
              }}
            >
              {ctaFinal.secondaryCTA}
            </Button>
          </div>

          {/* Contact Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-text-muted">
              ¿Prefieres hablar directamente?{" "}
              <a
                href={`mailto:${SITE_CONTENT.footer.contact.email}`}
                className="text-accent-blue hover:underline"
              >
                {SITE_CONTENT.footer.contact.email}
              </a>
            </p>
          </div>
        </div>
      </Container>
    </Section>
  )
}
