"use client"

import { useState } from "react"
import { Plus, Star, CheckCircle2, Search } from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { mockTemplates, templateCategories, MockTemplate } from "@/lib/mock-data/templates"
import { mockAutomations } from "@/lib/mock-data/automations"
import { cn } from "@/lib/cn"

const planColors: Record<string, string> = {
  FREE: "bg-text-muted/10 text-text-muted",
  STARTER: "bg-accent-blue/10 text-accent-blue",
  PROFESSIONAL: "bg-accent-violet/10 text-accent-violet",
}

const planLabels: Record<string, string> = {
  FREE: "Gratis",
  STARTER: "Starter",
  PROFESSIONAL: "Professional",
}

function TemplateCard({
  template,
  installed,
  onInstall,
}: {
  template: MockTemplate
  installed: boolean
  onInstall: (slug: string) => void
}) {
  const [isInstalling, setIsInstalling] = useState(false)

  async function handleInstall() {
    if (installed) return
    setIsInstalling(true)
    await new Promise((r) => setTimeout(r, 800))
    onInstall(template.slug)
    setIsInstalling(false)
  }

  return (
    <div className="bg-background-elevated border border-border rounded-xl p-5 hover:border-accent-blue/40 transition-all duration-200 flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-text-primary text-sm">{template.name.es}</h3>
              {template.isPopular && (
                <span className="text-xs bg-accent-blue/10 text-accent-blue px-1.5 py-0.5 rounded-full font-medium">
                  Popular
                </span>
              )}
              {template.isNew && (
                <span className="text-xs bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded-full font-medium">
                  Nuevo
                </span>
              )}
            </div>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block", planColors[template.planRequired])}>
              {planLabels[template.planRequired]}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-text-muted leading-relaxed mb-4 flex-1">{template.description.es}</p>

      {/* Steps preview */}
      <div className="mb-4 space-y-1.5">
        {template.steps.slice(0, 3).map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-accent-blue/10 text-accent-blue text-[10px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-xs text-text-muted truncate">{step.title.es}</span>
          </div>
        ))}
        {template.steps.length > 3 && (
          <p className="text-xs text-text-muted pl-6">+{template.steps.length - 3} pasos más</p>
        )}
      </div>

      {/* Integrations */}
      <div className="flex flex-wrap gap-1 mb-4">
        {template.integrations.slice(0, 3).map((i) => (
          <span key={i} className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded-full text-text-muted">
            {i}
          </span>
        ))}
        {template.integrations.length > 3 && (
          <span className="text-xs text-text-muted">+{template.integrations.length - 3}</span>
        )}
      </div>

      {/* Rating + install */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-medium text-text-primary">{template.rating}</span>
          <span className="text-xs text-text-muted">({template.reviewCount})</span>
        </div>

        {installed ? (
          <span className="flex items-center gap-1.5 text-xs text-green-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Instalada
          </span>
        ) : (
          <button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex items-center gap-1.5 text-xs font-medium bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {isInstalling ? (
              <span className="w-3.5 h-3.5 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            {isInstalling ? "Instalando..." : "Instalar"}
          </button>
        )}
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("ALL")
  const [search, setSearch] = useState("")
  const [installed, setInstalled] = useState<Set<string>>(
    new Set(mockAutomations.map((a) => a.template))
  )

  const filtered = mockTemplates.filter((t) => {
    const matchesCategory = activeCategory === "ALL" || t.category === activeCategory
    const matchesSearch =
      search === "" ||
      t.name.es.toLowerCase().includes(search.toLowerCase()) ||
      t.description.es.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function handleInstall(slug: string) {
    setInstalled((prev) => { const next = new Set(prev); next.add(slug); return next })
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Marketplace" />

      <main className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Marketplace de Automatizaciones</h1>
          <p className="text-text-muted text-sm mt-1">
            {mockTemplates.length} automatizaciones listas para instalar con un click
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Buscar automatizaciones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background-elevated border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {templateCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl border transition-colors",
                activeCategory === cat.id
                  ? "bg-accent-blue text-white border-accent-blue"
                  : "border-border text-text-muted hover:text-text-primary hover:border-accent-blue/40 bg-background-elevated"
              )}
            >
              <span>{cat.emoji}</span>
              {cat.label.es}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-xs text-text-muted">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          {search && ` para "${search}"`}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Sin resultados. Probá otro término.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((template) => (
              <TemplateCard
                key={template.slug}
                template={template}
                installed={installed.has(template.slug)}
                onInstall={handleInstall}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
