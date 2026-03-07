"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react"
import { DemoSidebar } from "@/components/demo/DemoSidebar"
import { SidebarProvider, useSidebar } from "@/components/demo/SidebarContext"
import { ThemeToggle } from "@/components/demo/ThemeToggle"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

function TopBar() {
  const router = useRouter()
  const { toggle } = useSidebar()
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
    <header className="h-14 border-b border-border bg-background-elevated flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-surface-hover transition-colors md:hidden"
        >
          <Menu className="w-5 h-5 text-text-muted" />
        </motion.button>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <motion.button
          whileTap={{ scale: 0.9 }}
          className="relative p-2 rounded-lg hover:bg-surface-hover transition-colors"
        >
          <Bell className="w-4 h-4 text-text-muted" />
        </motion.button>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-colors">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt={name} className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-accent-amber/20 flex items-center justify-center text-xs font-bold text-accent-amber">
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
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-text-muted hover:text-red-500"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DemoSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
