import { Hero } from "@/components/sections/Hero"
import { ElProblema } from "@/components/sections/ElProblema"
import { LaSolucion } from "@/components/sections/LaSolucion"
import { DemoInteractiva } from "@/components/sections/DemoInteractiva"
import { CasosDeUso } from "@/components/sections/CasosDeUso"
import { PorQueAura } from "@/components/sections/PorQueAura"
import { CTAFinal } from "@/components/sections/CTAFinal"
import { Footer } from "@/components/sections/Footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ElProblema />
      <LaSolucion />
      <DemoInteractiva />
      <CasosDeUso />
      <PorQueAura />
      <CTAFinal />
      <Footer />
    </main>
  )
}
