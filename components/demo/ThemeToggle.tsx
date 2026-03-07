"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem("aura-theme")
    if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    if (next) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("aura-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("aura-theme", "light")
    }
  }

  if (!mounted) return <div className="w-8 h-8" />

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggle}
      className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
      title={dark ? "Modo claro" : "Modo oscuro"}
    >
      {dark ? (
        <Sun className="w-4 h-4 text-text-muted" />
      ) : (
        <Moon className="w-4 h-4 text-text-muted" />
      )}
    </motion.button>
  )
}
