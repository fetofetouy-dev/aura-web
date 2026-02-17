"use client"

import { useState } from "react"
import {
  MessageCircle,
  Mail,
  Phone,
  FileText,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  User,
  Tag,
} from "lucide-react"
import { DemoTopBar } from "@/components/demo/DemoTopBar"
import { mockInboxMessages, MockInboxMessage, InboxChannel, InboxStatus } from "@/lib/mock-data/inbox-messages"
import { cn } from "@/lib/cn"

// ─── Channel config ──────────────────────────────────────────────────────────

const channelConfig: Record<
  InboxChannel,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle, color: "text-green-400", bg: "bg-green-400/10" },
  instagram: { label: "Instagram", icon: MessageCircle, color: "text-accent-violet", bg: "bg-accent-violet/10" },
  email: { label: "Email", icon: Mail, color: "text-accent-blue", bg: "bg-accent-blue/10" },
  facebook: { label: "Facebook", icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
  phone: { label: "Teléfono", icon: Phone, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  form: { label: "Formulario", icon: FileText, color: "text-orange-400", bg: "bg-orange-400/10" },
}

const statusConfig: Record<InboxStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  unread: { label: "Sin leer", color: "text-accent-blue", icon: AlertCircle },
  in_progress: { label: "En progreso", color: "text-yellow-400", icon: Clock },
  resolved: { label: "Resuelto", color: "text-green-400", icon: CheckCircle2 },
}

const sentimentColors = {
  positive: "text-green-400",
  neutral: "text-text-muted",
  negative: "text-red-400",
}

function leadScoreColor(score: number) {
  if (score >= 80) return "text-green-400"
  if (score >= 60) return "text-yellow-400"
  return "text-red-400"
}

// ─── Message row ─────────────────────────────────────────────────────────────

function MessageRow({
  message,
  isSelected,
  onClick,
}: {
  message: MockInboxMessage
  isSelected: boolean
  onClick: () => void
}) {
  const channel = channelConfig[message.channel]
  const ChannelIcon = channel.icon
  const status = statusConfig[message.status]

  const time = new Date(message.timestamp).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-start gap-3 p-3 border-b border-border hover:bg-white/[0.02] transition-colors",
        isSelected && "bg-accent-blue/5 border-l-2 border-l-accent-blue",
        message.status === "unread" && !isSelected && "bg-white/[0.01]"
      )}
    >
      {/* Channel icon */}
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", channel.bg)}>
        <ChannelIcon className={cn("w-4 h-4", channel.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className={cn("text-sm font-medium", message.status === "unread" ? "text-text-primary" : "text-text-muted")}>
            {message.from}
          </span>
          <span className="text-xs text-text-muted shrink-0">{time}</span>
        </div>
        {message.subject && (
          <p className="text-xs text-text-muted mb-0.5 truncate">{message.subject}</p>
        )}
        <p className="text-xs text-text-muted line-clamp-2">{message.message}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn("text-[10px] font-medium", status.color)}>{status.label}</span>
          {message.status === "unread" && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
          )}
          {message.leadScore > 0 && (
            <span className={cn("text-[10px]", leadScoreColor(message.leadScore))}>
              Score {message.leadScore}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ─── Message detail ───────────────────────────────────────────────────────────

function MessageDetail({ message }: { message: MockInboxMessage }) {
  const [reply, setReply] = useState("")
  const channel = channelConfig[message.channel]
  const ChannelIcon = channel.icon

  const fullDate = new Date(message.timestamp).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", channel.bg)}>
            <ChannelIcon className={cn("w-5 h-5", channel.color)} />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{message.from}</p>
            <p className="text-xs text-text-muted">
              {message.handle || message.email || message.phone || channel.label} · {fullDate}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-background rounded-lg p-2.5 text-center">
            <TrendingUp className={cn("w-3.5 h-3.5 mx-auto mb-1", leadScoreColor(message.leadScore))} />
            <p className={cn("text-sm font-bold", leadScoreColor(message.leadScore))}>
              {message.leadScore > 0 ? `${message.leadScore}/100` : "N/A"}
            </p>
            <p className="text-[10px] text-text-muted">Lead Score</p>
          </div>
          <div className="bg-background rounded-lg p-2.5 text-center">
            <div className={cn("w-3.5 h-3.5 mx-auto mb-1 rounded-full", {
              "bg-green-400": message.sentiment === "positive",
              "bg-text-muted/50": message.sentiment === "neutral",
              "bg-red-400": message.sentiment === "negative",
            })} />
            <p className={cn("text-sm font-bold capitalize", sentimentColors[message.sentiment])}>
              {message.sentiment === "positive" ? "Positivo" : message.sentiment === "negative" ? "Negativo" : "Neutral"}
            </p>
            <p className="text-[10px] text-text-muted">Sentimiento</p>
          </div>
          <div className="bg-background rounded-lg p-2.5 text-center">
            <User className="w-3.5 h-3.5 mx-auto mb-1 text-text-muted" />
            <p className="text-sm font-bold text-text-primary truncate">
              {message.assignedTo || "Sin asignar"}
            </p>
            <p className="text-[10px] text-text-muted">Asignado</p>
          </div>
        </div>
      </div>

      {/* Message */}
      <div className="flex-1 p-4 overflow-y-auto">
        {message.subject && (
          <p className="font-medium text-text-primary mb-3 text-sm">{message.subject}</p>
        )}
        <div className="bg-background-elevated border border-border rounded-xl p-3 inline-block max-w-[85%]">
          <p className="text-sm text-text-primary leading-relaxed">{message.message}</p>
        </div>

        {/* Tags */}
        {message.tags.length > 0 && (
          <div className="flex items-center gap-2 mt-4">
            <Tag className="w-3.5 h-3.5 text-text-muted" />
            {message.tags.map((tag) => (
              <span key={tag} className="text-xs bg-white/5 border border-border px-2 py-0.5 rounded-full text-text-muted">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Suggested AI response */}
        {message.status !== "resolved" && (
          <div className="mt-4 p-3 rounded-xl border border-accent-blue/20 bg-accent-blue/5">
            <p className="text-xs font-semibold text-accent-blue mb-1">✨ Respuesta sugerida por IA</p>
            <p className="text-xs text-text-muted leading-relaxed">
              {message.sentiment === "negative"
                ? `Hola ${message.from.split(" ")[0]}, lamentamos el inconveniente. Nuestro equipo ya está revisando el problema y te contactaremos en las próximas horas.`
                : `Hola ${message.from.split(" ")[0]}, gracias por contactarnos. Estaré encantado de ayudarte con tu consulta. ¿Podrías contarme un poco más sobre tu negocio?`}
            </p>
            <button
              onClick={() => setReply(
                message.sentiment === "negative"
                  ? `Hola ${message.from.split(" ")[0]}, lamentamos el inconveniente. Nuestro equipo ya está revisando el problema y te contactaremos en las próximas horas.`
                  : `Hola ${message.from.split(" ")[0]}, gracias por contactarnos. Estaré encantado de ayudarte con tu consulta. ¿Podrías contarme un poco más sobre tu negocio?`
              )}
              className="mt-2 text-xs text-accent-blue hover:underline"
            >
              Usar esta respuesta →
            </button>
          </div>
        )}
      </div>

      {/* Reply box */}
      {message.status !== "resolved" && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`Responder por ${channel.label}...`}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue/50 transition-colors"
            />
            <button
              disabled={!reply.trim()}
              className="flex items-center gap-1.5 bg-accent-blue text-white text-sm px-4 py-2 rounded-xl hover:bg-accent-blue/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | InboxStatus>("all")
  const [selectedId, setSelectedId] = useState<string>(mockInboxMessages[0].id)

  const filtered = activeFilter === "all"
    ? mockInboxMessages
    : mockInboxMessages.filter((m) => m.status === activeFilter)

  const selected = mockInboxMessages.find((m) => m.id === selectedId) ?? mockInboxMessages[0]

  const counts = {
    all: mockInboxMessages.length,
    unread: mockInboxMessages.filter((m) => m.status === "unread").length,
    in_progress: mockInboxMessages.filter((m) => m.status === "in_progress").length,
    resolved: mockInboxMessages.filter((m) => m.status === "resolved").length,
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DemoTopBar title="Centralizador Omnicanal" />

      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: list */}
        <div className="w-80 border-r border-border flex flex-col shrink-0">
          {/* Filters */}
          <div className="p-3 border-b border-border flex gap-1 flex-wrap">
            {[
              { key: "all", label: "Todos", count: counts.all },
              { key: "unread", label: "Sin leer", count: counts.unread },
              { key: "in_progress", label: "En curso", count: counts.in_progress },
              { key: "resolved", label: "Resueltos", count: counts.resolved },
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                className={cn(
                  "flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors",
                  activeFilter === filter.key
                    ? "bg-accent-blue text-white"
                    : "text-text-muted hover:text-text-primary bg-white/5"
                )}
              >
                {filter.label}
                <span className={cn("text-[10px] font-bold", activeFilter === filter.key ? "opacity-80" : "opacity-60")}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          {/* Channel summary */}
          <div className="p-3 border-b border-border flex gap-2 flex-wrap">
            {(Object.keys(channelConfig) as InboxChannel[]).map((ch) => {
              const count = mockInboxMessages.filter((m) => m.channel === ch).length
              if (count === 0) return null
              const cfg = channelConfig[ch]
              const Icon = cfg.icon
              return (
                <div key={ch} className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", cfg.bg)}>
                  <Icon className={cn("w-3 h-3", cfg.color)} />
                  <span className={cfg.color}>{count}</span>
                </div>
              )
            })}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 opacity-30" />
                <p className="text-xs">Sin mensajes</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <MessageRow
                  key={msg.id}
                  message={msg}
                  isSelected={msg.id === selectedId}
                  onClick={() => setSelectedId(msg.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel: detail */}
        <div className="flex-1 overflow-y-auto">
          <MessageDetail message={selected} />
        </div>
      </div>
    </div>
  )
}
