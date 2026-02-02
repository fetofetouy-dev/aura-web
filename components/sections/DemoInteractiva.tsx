"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Container } from "@/components/ui/Container"
import { Section } from "@/components/ui/Section"
import { Button } from "@/components/ui/Button"
import { LeadForm } from "@/components/demo/LeadForm"
import { AnalyzingStage } from "@/components/demo/AnalyzingStage"
import { AutomationSteps } from "@/components/demo/AutomationSteps"
import { CodeViewer } from "@/components/demo/CodeViewer"
import { ImpactMetrics } from "@/components/demo/ImpactMetrics"
import { IntegrationLogos } from "@/components/demo/IntegrationLogos"
import { SITE_CONTENT } from "@/lib/constants"

type DemoStage = "idle" | "analyzing" | "executing" | "results"

export function DemoInteractiva() {
  const [stage, setStage] = useState<DemoStage>("idle")
  const { demo } = SITE_CONTENT

  const handleStartDemo = () => {
    setStage("analyzing")
    setTimeout(() => {
      setStage("executing")
    }, 1500)
  }

  const handleExecutionComplete = () => {
    setStage("results")
  }

  const handleReset = () => {
    setStage("idle")
  }

  return (
    <Section id="demo" className="bg-background">
      <Container>
        {/* Title */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {demo.title}
          </h2>
          <p className="text-xl text-text-body max-w-3xl mx-auto">
            {demo.subtitle}
          </p>
        </div>

        {/* Demo Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Side - Interactive Simulator */}
          <div>
            <AnimatePresence mode="wait">
              {stage === "idle" && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LeadForm onSubmit={handleStartDemo} />
                </motion.div>
              )}

              {stage === "analyzing" && (
                <motion.div
                  key="analyzing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <AnalyzingStage />
                </motion.div>
              )}

              {stage === "executing" && (
                <motion.div
                  key="executing"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <AutomationSteps onComplete={handleExecutionComplete} />
                </motion.div>
              )}

              {stage === "results" && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <ImpactMetrics />
                  <IntegrationLogos />
                  <Button variant="secondary" onClick={handleReset} className="w-full">
                    ↻ Ejecutar Nuevamente
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Code Viewer (sticky on desktop) */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Código de la Automatización
              </h3>
              <p className="text-sm text-text-body">
                Construido con Claude Code - Listo para producción
              </p>
            </div>
            <CodeViewer />
          </div>
        </div>

        {/* Bottom CTA */}
        {stage === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-xl text-text-body mb-6">
              ¿Quieres esta automatización para tu negocio?
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Agenda una Demo Personalizada
            </Button>
          </motion.div>
        )}
      </Container>
    </Section>
  )
}
