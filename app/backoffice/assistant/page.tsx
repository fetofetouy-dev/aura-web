"use client"

import { useState } from "react"
import {
  Bot,
  User,
  Headphones,
  CheckCircle2,
  MessageCircle,
  TrendingUp,
  Zap,
  Settings,
  ChevronRight,
} from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { mockConversations, MockConversation, MessageSender } from "@/lib/mock-data/chat-bot"
import { cn } from "@/lib/cn"

// ─── Helpers ─────────────────────────────────────────────────────────────────

const channelEmojis: Record<string, string> = {
  whatsapp: "💬",
  instagram: "📷",
  email: "✉️",
  web: "🌐",
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  active: { label: "Activa", color: "text-green-400", icon: Bot },
  handed_off: { label: "Transferida", color: "text-yellow-400", icon: Headphones },
  closed: { label: "Cerrada", color: "text-text-muted", icon: CheckCircle2 },
}

const senderConfig: Record<MessageSender, { label: string; color: string; align: string; bg: string }> = {
  lead: { label: "Lead", color: "text-text-primary", align: "justify-start", bg: "bg-background-elevated border border-border" },
  bot: { label: "Bot IA", color: "text-accent-blue", align: "justify-end", bg: "bg-accent-blue/10 border border-accent-blue/20" },
  human: { label: "Agente", color: "text-green-400", align: "justify-end", bg: "bg-green-500/10 border border-green-500/20" },
}

function leadScoreColor(score: number) {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-yellow-400"
  return "text-red-400"
}

// ─── Conversation row ────────────────────────────────────────────────────────

function ConversationRow({
  conv,
  isSelected,
  onClick,
}: {
  conv: MockConversation
  isSelected: boolean
  onClick: () => void
}) {
  const status = statusConfig[conv.status]
  const StatusIcon = status.icon
  const lastMsg = conv.messages[conv.messages.length - 1]
  const time = new Date(conv.startedAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-3 p-3 border-b border-border hover:bg-white/[0.02] transition-colors",
        isSelected && "bg-accent-blue/5 border-l-2 border-l-accent-blue"
      )}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
        {conv.leadName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-medium text-text-primary">{conv.leadName}</span>
          <span className="text-xs text-text-muted">{time}</span>
        </div>
        <p className="text-xs text-text-muted truncate">{lastMsg.text.split("\n")[0]}</p>
        <div className="flex items-center gap-2 mt-1">
          <StatusIcon className={cn("w-3 h-3", status.color)} />
          <span className={cn("text-[10px]", status.color)}>{status.label}</span>
          <span className="text-[10px] text-text-muted">{channelEmojis[conv.channel]} {conv.channel}</span>
          <span className={cn("text-[10px] font-medium", leadScoreColor(conv.leadScore))}>
            {conv.leadScore}pts
          </span>
        </div>
      </div>
    </button>
  )
}

// ─── Conversation detail ──────────────────────────────────────────────────────

function ConversationDetail({ conv }: { conv: MockConversation }) {
  const status = statusConfig[conv.status]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-blue to-accent-violet flex items-center justify-center text-white font-bold">
              {conv.leadName[0]}
            </div>
            <div>
              <p className="font-semibold text-text-primary">{conv.leadName}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted">
                  {channelEmojis[conv.channel]} {conv.channel}
                </span>
                <span className={cn("text-xs font-medium", status.color)}>· {status.label}</span>
              </div>
            </div>
          </div>

          {conv.handedOffTo && (
            <div className="flex items-center gap-2 text-xs text-text-muted bg-background border border-border rounded-lg px-3 py-1.5">
              <Headphones className="w-3.5 h-3.5 text-yellow-400" />
              Transferido a <strong className="text-text-primary">{conv.handedOffTo}</strong>
            </div>
          )}
        </div>

        {/* Lead data cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
          <div className="bg-background rounded-lg p-2">
            <p className={cn("text-base font-bold", leadScoreColor(conv.leadScore))}>{conv.leadScore}/100</p>
            <p className="text-[10px] text-text-muted">Lead Score</p>
          </div>
          {conv.extractedData.industry && (
            <div className="bg-background rounded-lg p-2">
              <p className="text-xs font-semibold text-text-primary truncate">{conv.extractedData.industry}</p>
              <p className="text-[10px] text-text-muted">Industria</p>
            </div>
          )}
          {conv.extractedData.teamSize && (
            <div className="bg-background rounded-lg p-2">
              <p className="text-xs font-semibold text-text-primary">{conv.extractedData.teamSize}</p>
              <p className="text-[10px] text-text-muted">Equipo</p>
            </div>
          )}
          {conv.extractedData.budget && (
            <div className="bg-background rounded-lg p-2">
              <p className="text-xs font-semibold text-accent-blue truncate">{conv.extractedData.budget}</p>
              <p className="text-[10px] text-text-muted">Budget estimado</p>
            </div>
          )}
        </div>

        {conv.interest && (
          <div className="mt-2 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-accent-blue shrink-0" />
            <p className="text-xs text-text-muted">Interés: <span className="text-text-primary">{conv.interest}</span></p>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {conv.messages.map((msg) => {
          const cfg = senderConfig[msg.sender]
          const time = new Date(msg.timestamp).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })

          return (
            <div key={msg.id} className={cn("flex gap-2", cfg.align)}>
              {msg.sender === "lead" && (
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-3.5 h-3.5 text-text-muted" />
                </div>
              )}
              <div className="max-w-[70%]">
                <div className={cn("flex items-center gap-2 mb-1", msg.sender !== "lead" && "flex-row-reverse")}>
                  <span className={cn("text-[10px] font-medium", cfg.color)}>{cfg.label}</span>
                  <span className="text-[10px] text-text-muted">{time}</span>
                </div>
                <div className={cn("rounded-xl px-3 py-2 text-sm text-text-primary whitespace-pre-line leading-relaxed", cfg.bg)}>
                  {msg.text}
                </div>
              </div>
              {msg.sender === "bot" && (
                <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-3.5 h-3.5 text-accent-blue" />
                </div>
              )}
              {msg.sender === "human" && (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Headphones className="w-3.5 h-3.5 text-green-400" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AssistantPage() {
  const [selectedId, setSelectedId] = useState(mockConversations[0].id)
  const selected = mockConversations.find((c) => c.id === selectedId) ?? mockConversations[0]

  const stats = {
    total: mockConversations.length,
    active: mockConversations.filter((c) => c.status === "active").length,
    handedOff: mockConversations.filter((c) => c.status === "handed_off").length,
    avgScore: Math.round(mockConversations.reduce((s, c) => s + c.leadScore, 0) / mockConversations.length),
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Bot IA" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top stats bar */}
        <div className="border-b border-border px-6 py-3 flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-semibold text-text-primary">Bot Activo</span>
            <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.6)]" />
          </div>
          <div className="h-4 w-px bg-border" />
          {[
            { label: "Conversaciones hoy", value: stats.total, icon: MessageCircle },
            { label: "En curso", value: stats.active, icon: Bot },
            { label: "Transferidas", value: stats.handedOff, icon: Headphones },
            { label: "Score promedio", value: `${stats.avgScore}pts`, icon: TrendingUp },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-sm font-semibold text-text-primary">{stat.value}</span>
                <span className="text-xs text-text-muted">{stat.label}</span>
              </div>
            )
          })}
          <div className="ml-auto">
            <button className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary border border-border px-3 py-1.5 rounded-lg transition-colors">
              <Settings className="w-3.5 h-3.5" />
              Configurar Bot
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left: conversation list */}
          <div className="w-72 border-r border-border flex flex-col shrink-0">
            <div className="p-3 border-b border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Conversaciones</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {mockConversations.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  isSelected={conv.id === selectedId}
                  onClick={() => setSelectedId(conv.id)}
                />
              ))}
            </div>

            {/* Bot config snippet */}
            <div className="p-3 border-t border-border">
              <div className="p-3 rounded-xl bg-accent-blue/5 border border-accent-blue/20">
                <p className="text-xs font-semibold text-accent-blue mb-1">Prompt del bot activo</p>
                <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                  &ldquo;Sos el asistente de Aura. Tu objetivo es calificar leads, entender sus necesidades y agendar demos para el equipo de ventas...&rdquo;
                </p>
                <button className="mt-1.5 text-xs text-accent-blue hover:underline">
                  Editar prompt →
                </button>
              </div>
            </div>
          </div>

          {/* Right: conversation detail */}
          <div className="flex-1 overflow-hidden">
            <ConversationDetail conv={selected} />
          </div>
        </div>
      </div>
    </div>
  )
}
