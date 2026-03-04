"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Zap,
  Megaphone,
  Store,
  Settings,
  CreditCard,
  ArrowUpRight,
  X,
} from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { cn } from "@/lib/cn"
import { useSidebar } from "./SidebarContext"
import { drawerVariants, backdropVariants } from "@/lib/animations"
import type { User } from "@supabase/supabase-js"
import type { LucideIcon } from "lucide-react"

const navItems = [
  { href: "/backoffice/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/backoffice/customers", label: "Clientes", icon: Users },
  { href: "/backoffice/appointments", label: "Citas", icon: CalendarDays },
  { href: "/backoffice/automations", label: "Automatizaciones", icon: Zap },
  { href: "/backoffice/media", label: "Publicidad", icon: Megaphone },
  { href: "/backoffice/marketplace", label: "Marketplace", icon: Store },
]

const bottomItems = [
  { href: "/backoffice/settings", label: "Configuración", icon: Settings },
  { href: "/backoffice/billing", label: "Billing", icon: CreditCard },
]

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string
  label: string
  icon: LucideIcon
  isActive: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
        isActive
          ? "text-accent-blue font-medium"
          : "text-text-muted hover:text-text-primary hover:bg-white/5"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="nav-indicator"
          className="absolute inset-0 bg-accent-blue/10 rounded-lg"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      <Icon className="w-4 h-4 shrink-0 relative z-10" />
      <span className="flex-1 relative z-10">{label}</span>
    </Link>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const name =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "Mi Empresa"
  const initial = name[0]?.toUpperCase() ?? "M"
  const image = user?.user_metadata?.avatar_url

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" onClick={onNavigate}>
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
            <p className="text-xs font-medium text-text-primary truncate max-w-[140px]">
              {name}
            </p>
            <p className="text-xs text-text-muted">Plan Professional</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <NavLink
              key={item.href}
              {...item}
              isActive={isActive}
              onClick={onNavigate}
            />
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <NavLink
              key={item.href}
              {...item}
              isActive={isActive}
              onClick={onNavigate}
            />
          )
        })}

        {/* Upgrade CTA */}
        <div className="mt-2 p-3 rounded-lg bg-gradient-to-br from-accent-blue/10 to-accent-violet/10 border border-accent-blue/20">
          <p className="text-xs font-semibold text-text-primary mb-1">
            Plan Enterprise
          </p>
          <p className="text-xs text-text-muted mb-2">
            Automatizaciones ilimitadas
          </p>
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
    </>
  )
}

export function DemoSidebar() {
  const { isOpen, close } = useSidebar()
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => {
    close()
  }, [pathname, close])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 min-h-screen bg-background-elevated border-r border-border flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={close}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
            />
            <motion.aside
              key="drawer"
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="exit"
              className="fixed inset-y-0 left-0 w-64 bg-background-elevated border-r border-border flex flex-col z-50 md:hidden"
            >
              <button
                onClick={close}
                className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent onNavigate={close} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
