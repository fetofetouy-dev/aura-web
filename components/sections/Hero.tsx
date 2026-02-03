"use client"

import Image from "next/image"
import { Container } from "@/components/ui/Container"
import { Button } from "@/components/ui/Button"
import { GradientText } from "@/components/ui/GradientText"
import { FlowLines } from "@/components/animations/FlowLines"
import { FadeIn } from "@/components/animations/FadeIn"
import { useLocale } from "@/lib/i18n/LocaleProvider"

export function Hero() {
  const { t } = useLocale()
  const hero = t('siteContent.hero')

  const scrollToDemo = () => {
    document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      <FlowLines />

      <Container className="relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <FadeIn delay={0.1}>
            <div className="mb-8 flex justify-center">
              <Image
                src="/aura-logo.svg"
                alt="Aura Logo"
                width={300}
                height={90}
                priority
              />
            </div>
          </FadeIn>

          {/* Main Heading */}
          <FadeIn delay={0.2}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6 leading-tight">
              <GradientText>{hero.title}</GradientText>
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={0.3}>
            <p className="text-lg md:text-xl lg:text-2xl text-text-body mb-12 leading-relaxed max-w-3xl mx-auto">
              {hero.subtitle}
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.4}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                variant="primary"
                size="lg"
                onClick={scrollToDemo}
              >
                {hero.primaryCTA}
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => window.location.href = "#contacto"}
              >
                {hero.secondaryCTA}
              </Button>
            </div>
          </FadeIn>
        </div>
      </Container>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center gap-2 text-text-muted animate-bounce">
          <span className="text-sm">Scroll</span>
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  )
}
