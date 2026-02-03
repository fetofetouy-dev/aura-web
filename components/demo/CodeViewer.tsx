"use client"

import { useState } from "react"
import { Card } from "@/components/ui/Card"
import { useLocale } from "@/lib/i18n/LocaleProvider"
import { Check, Copy } from "lucide-react"

export function CodeViewer() {
  const { t } = useLocale()
  const demoCode = t('demo.code')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(demoCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-background border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <span className="text-sm text-text-muted ml-2">procesarLead.js</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-body hover:text-accent-blue transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              {t('common.buttons.copied')}
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              {t('common.buttons.copy')}
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm leading-relaxed">
          <code className="text-text-body font-mono">
            {demoCode.split("\n").map((line: string, index: number) => (
              <div key={index} className="flex">
                <span className="inline-block w-8 text-right text-text-muted mr-4 select-none">
                  {index + 1}
                </span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: syntaxHighlight(line),
                  }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </Card>
  )
}

// Simple syntax highlighting for JavaScript
function syntaxHighlight(line: string): string {
  // Comments
  line = line.replace(/(\/\/.*$)/g, '<span style="color: #9CA3AF">$1</span>')

  // Strings
  line = line.replace(/(['"`])(.*?)\1/g, '<span style="color: #34D399">$1$2$1</span>')

  // Keywords
  const keywords = ["async", "function", "await", "const", "if", "return"]
  keywords.forEach((keyword) => {
    line = line.replace(
      new RegExp(`\\b${keyword}\\b`, "g"),
      `<span style="color: #8B5CF6">${keyword}</span>`
    )
  })

  // Function calls
  line = line.replace(/(\w+)(\()/g, '<span style="color: #3B82F6">$1</span>$2')

  return line
}
