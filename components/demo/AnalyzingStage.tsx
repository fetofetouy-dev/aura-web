"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/Card"

export function AnalyzingStage() {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Claude AI Logo/Icon */}
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-aura flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
          </svg>
        </motion.div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-text-primary mb-2">
            Claude AI Analizando...
          </h3>
          <p className="text-text-body">
            Procesando información del lead y preparando automatización
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-accent-blue"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
