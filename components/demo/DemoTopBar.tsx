"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, ChevronDown, LogOut } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface DemoTopBarProps {
  title: string
  subtitle?: string
}

export function DemoTopBar({ title, subtitle }: DemoTopBarProps) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Usuario"
  const initial = name[0]?.toUpperCase() ?? "U"
  const image = user?.user_metadata?.avatar_url

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <header className="h-14 border-b border-border bg-background-elevated flex items-center justify-between px-6 shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4 text-text-muted" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-xs font-bold text-white">
                {initial}
              </div>
            )}
            <div className="text-left hidden sm:block">
              <p className="text-xs font-medium text-text-primary">{name}</p>
              <p className="text-xs text-text-muted">{user?.email ?? "Admin"}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>

          <button
            onClick={handleSignOut}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-text-muted hover:text-red-400"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
