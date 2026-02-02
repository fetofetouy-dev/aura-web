"use client"

import { motion } from "framer-motion"

export function FlowLines() {
  // Paths con curvas Bezier para las líneas de flujo
  const paths = [
    "M 0,100 Q 250,50 500,100 T 1000,100 T 1500,100",
    "M 0,300 Q 200,250 400,300 T 800,300 T 1200,300 T 1600,300",
    "M 0,500 Q 300,450 600,500 T 1200,500 T 1800,500",
  ]

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path}
            stroke="url(#flowGradient)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
            }}
            transition={{
              pathLength: {
                duration: 3,
                delay: index * 0.5,
                repeat: Infinity,
                repeatType: "loop",
                ease: "linear"
              },
              opacity: {
                duration: 1,
                delay: index * 0.5
              }
            }}
          />
        ))}
      </svg>
    </div>
  )
}
