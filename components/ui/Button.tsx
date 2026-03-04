"use client"

import { type ReactNode, type MouseEventHandler } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/cn"

export interface ButtonProps {
  variant?: "primary" | "secondary"
  size?: "sm" | "md" | "lg"
  className?: string
  children?: ReactNode
  disabled?: boolean
  type?: "button" | "submit" | "reset"
  onClick?: MouseEventHandler<HTMLButtonElement>
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  disabled,
  type = "button",
  onClick,
}: ButtonProps) {
  const variants = {
    primary: "bg-gradient-aura text-white glow-aura-hover",
    secondary: "border-2 border-accent-blue text-text-primary hover:bg-accent-blue/10",
  }

  const sizes = {
    sm: "px-6 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-lg",
  }

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "rounded-pill font-semibold transition-all duration-300",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      type={type}
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}
