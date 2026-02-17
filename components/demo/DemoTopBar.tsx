"use client"

import { Bell, ChevronDown, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { getUnreadCount } from "@/lib/mock-data/inbox-messages"

interface DemoTopBarProps {
  title: string
  subtitle?: string
}

export function DemoTopBar({ title, subtitle }: DemoTopBarProps) {
  const unread = getUnreadCount()
  const { data: session } = useSession()

  const name = session?.user?.name ?? "Usuario"
  const initial = name[0]?.toUpperCase() ?? "U"
  const image = session?.user?.image

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
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-blue rounded-full" />
          )}
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
              <p className="text-xs text-text-muted">{session?.user?.email ?? "Admin"}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
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
