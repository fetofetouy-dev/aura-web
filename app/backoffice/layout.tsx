"use client"

import { DemoSidebar } from "@/components/demo/DemoSidebar"
import { SidebarProvider } from "@/components/demo/SidebarContext"
import { BackofficeShell } from "@/components/demo/BackofficeShell"

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DemoSidebar />
        <BackofficeShell>{children}</BackofficeShell>
      </div>
    </SidebarProvider>
  )
}
