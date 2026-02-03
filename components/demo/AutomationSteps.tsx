"use client"

import { useEffect, useState } from "react"
import { StepCard } from "./StepCard"
import { useLocale } from "@/lib/i18n/LocaleProvider"

interface AutomationStepsProps {
  onComplete: () => void
}

export function AutomationSteps({ onComplete }: AutomationStepsProps) {
  const { t } = useLocale()
  const automationSteps = t('demo.automationSteps')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (currentStepIndex >= automationSteps.length) {
      // All steps complete
      setTimeout(onComplete, 500)
      return
    }

    const currentStep = automationSteps[currentStepIndex]
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1)
    }, currentStep.duration)

    return () => clearTimeout(timer)
  }, [currentStepIndex, onComplete, automationSteps])

  return (
    <div className="space-y-4">
      {automationSteps.map((step: any, index: number) => {
        let status: "pending" | "executing" | "complete"

        if (index < currentStepIndex) {
          status = "complete"
        } else if (index === currentStepIndex) {
          status = "executing"
        } else {
          status = "pending"
        }

        return <StepCard key={step.id} step={step} status={status} delay={0} />
      })}
    </div>
  )
}
