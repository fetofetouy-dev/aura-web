"use client"

import { DemoSidebar } from "@/components/demo/DemoSidebar"
import { SidebarProvider } from "@/components/demo/SidebarContext"

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <DemoSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
