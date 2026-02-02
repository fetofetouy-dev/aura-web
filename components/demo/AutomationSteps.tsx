"use client"

import { useEffect, useState } from "react"
import { StepCard } from "./StepCard"
import { AUTOMATION_STEPS } from "@/lib/demo-data"

interface AutomationStepsProps {
  onComplete: () => void
}

export function AutomationSteps({ onComplete }: AutomationStepsProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  useEffect(() => {
    if (currentStepIndex >= AUTOMATION_STEPS.length) {
      // All steps complete
      setTimeout(onComplete, 500)
      return
    }

    const currentStep = AUTOMATION_STEPS[currentStepIndex]
    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => prev + 1)
    }, currentStep.duration)

    return () => clearTimeout(timer)
  }, [currentStepIndex, onComplete])

  return (
    <div className="space-y-4">
      {AUTOMATION_STEPS.map((step, index) => {
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
