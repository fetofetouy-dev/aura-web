"use client"

import { motion } from "framer-motion"
import { Check, Database, Mail, CheckSquare, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/Card"

const iconMap: Record<string, any> = {
  "database": Database,
  "mail": Mail,
  "check-square": CheckSquare,
  "message-square": MessageSquare,
}

interface StepCardProps {
  step: any
  status: "pending" | "executing" | "complete"
  delay?: number
}

export function StepCard({ step, status, delay = 0 }: StepCardProps) {
  const Icon = iconMap[step.icon] || Database

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        className={`p-4 transition-all duration-300 ${
          status === "executing"
            ? "border-accent-blue glow-aura"
            : status === "complete"
            ? "border-green-500/50 opacity-80"
            : "opacity-50"
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
              status === "complete"
                ? "bg-green-500/20"
                : status === "executing"
                ? "bg-accent-blue/20"
                : "bg-background"
            }`}
          >
            {status === "complete" ? (
              <Check className="w-6 h-6 text-green-500" />
            ) : (
              <Icon
                className={`w-6 h-6 ${
                  status === "executing" ? "text-accent-blue" : "text-text-muted"
                }`}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-text-primary mb-2">{step.title}</h4>
            <ul className="space-y-1">
              {step.details.map((detail, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: status === "pending" ? 0.3 : 1,
                  }}
                  transition={{ delay: status === "executing" ? index * 0.2 : 0 }}
                  className="flex items-start gap-2 text-sm text-text-body"
                >
                  {status === "complete" && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  )}
                  {status === "executing" && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-accent-blue border-t-transparent rounded-full flex-shrink-0 mt-0.5"
                    />
                  )}
                  {status === "pending" && (
                    <div className="w-4 h-4 border-2 border-border rounded-full flex-shrink-0 mt-0.5" />
                  )}
                  <span>{detail}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}
