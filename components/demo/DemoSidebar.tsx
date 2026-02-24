"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Users,
  Zap,
  Store,
  Settings,
  CreditCard,
  ArrowUpRight,
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { cn } from "@/lib/cn"
import type { User } from "@supabase/supabase-js"

const navItems = [
  { href: "/backoffice/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/backoffice/customers", label: "Clientes", icon: Users },
  { href: "/backoffice/automations", label: "Automatizaciones", icon: Zap },
  { href: "/backoffice/marketplace", label: "Marketplace", icon: Store },
]

const bottomItems = [
  { href: "/backoffice/settings", label: "Configuración", icon: Settings },
  { href: "/backoffice/billing", label: "Billing", icon: CreditCard },
]

export function DemoSidebar() {
  const pathname = usePathname()
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

  const name = user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "Mi Empresa"
  const initial = name[0]?.toUpperCase() ?? "M"
  const image = user?.user_metadata?.avatar_url

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <aside className="w-64 min-h-screen bg-background-elevated border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/">
          <Image
            src="/aura-logo.png"
            alt="Aura"
            width={100}
            height={30}
            className="brightness-200"
          />
        </Link>
        <div className="mt-3 flex items-center gap-2">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt={name} className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-xs font-bold text-white">
              {initial}
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-text-primary truncate max-w-[140px]">{name}</p>
            <p className="text-xs text-text-muted">Plan Professional</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-accent-blue/10 text-accent-blue font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-accent-blue/10 text-accent-blue font-medium"
                  : "text-text-muted hover:text-text-primary hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {/* Upgrade CTA */}
        <div className="mt-2 p-3 rounded-lg bg-gradient-to-br from-accent-blue/10 to-accent-violet/10 border border-accent-blue/20">
          <p className="text-xs font-semibold text-text-primary mb-1">Plan Enterprise</p>
          <p className="text-xs text-text-muted mb-2">Automatizaciones ilimitadas</p>
          <button className="w-full flex items-center justify-center gap-1 text-xs font-medium text-accent-blue hover:text-accent-violet transition-colors">
            Upgrade <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 text-xs text-text-muted hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/5"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
