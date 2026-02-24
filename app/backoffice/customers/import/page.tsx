"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Papa from "papaparse"
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Loader2, ChevronRight } from "lucide-react"
import { mapColumns, deduplicateMapping, type AuraField, type MappingResult } from "@/lib/import/column-mapper"

const AURA_FIELDS: { value: AuraField; label: string }[] = [
  { value: "name", label: "Nombre *" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Teléfono" },
  { value: "company", label: "Empresa" },
  { value: "birthday", label: "Cumpleaños" },
  { value: "notes", label: "Notas" },
  { value: "skip", label: "— Ignorar columna —" },
]

type Step = "upload" | "mapping" | "importing" | "done"

export default function ImportCustomersPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<Step>("upload")
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState("")
  const [headers, setHeaders] = useState<string[]>([])
  const [allRows, setAllRows] = useState<Record<string, string>[]>([])
  const [mapping, setMapping] = useState<MappingResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ inserted: number; skipped: number; total: number } | null>(null)

  // Parse CSV client-side
  const parseFile = useCallback((file: File) => {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      setError("Solo se aceptan archivos CSV.")
      return
    }
    setFileName(file.name)
    setError(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[]
        const cols = results.meta.fields ?? []
        if (cols.length === 0 || rows.length === 0) {
          setError("El archivo está vacío o no tiene encabezados.")
          return
        }
        setHeaders(cols)
        setAllRows(rows)
        const suggested = deduplicateMapping(mapColumns(cols))
        setMapping(suggested)
        setStep("mapping")
      },
      error: () => setError("No se pudo leer el archivo. Asegurate de que sea un CSV válido."),
    })
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) parseFile(file)
    },
    [parseFile]
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) parseFile(file)
  }

  const updateMapping = (csvColumn: string, auraField: AuraField) => {
    setMapping((prev) => {
      // If another column already has this auraField, reset it to skip
      const updated: MappingResult[] = prev.map((m) => {
        if (m.csvColumn === csvColumn) return { ...m, auraField, confidence: 1 }
        if (m.auraField === auraField && auraField !== "skip") return { ...m, auraField: "skip" as AuraField, confidence: 0 }
        return m
      })
      return updated
    })
  }

  const nameIsMapped = mapping.some((m) => m.auraField === "name")

  const handleImport = async () => {
    if (!nameIsMapped) {
      setError('Debés mapear al menos la columna "Nombre".')
      return
    }
    setError(null)
    setStep("importing")

    const res = await fetch("/api/import/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: allRows, mapping }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? "Error al importar")
      setStep("mapping")
      return
    }

    setResult(data)
    setStep("done")
  }

  // Preview: first 4 rows with mapped fields
  const previewRows = allRows.slice(0, 4)
  const activeMappings = mapping.filter((m) => m.auraField !== "skip")

  return (
    <div className="flex-1 p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/backoffice/customers"
          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Importar clientes</h1>
          <p className="text-sm text-text-muted mt-0.5">Cargá tu base de clientes desde un archivo CSV o Excel exportado</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-xs">
        {(["upload", "mapping", "importing", "done"] as Step[]).map((s, i) => {
          const labels = ["Subir archivo", "Mapear columnas", "Importando", "Listo"]
          const active = s === step
          const done = ["upload", "mapping", "importing", "done"].indexOf(s) < ["upload", "mapping", "importing", "done"].indexOf(step)
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <ChevronRight className="w-3 h-3 text-text-muted/50" />}
              <span className={`font-medium ${active ? "text-accent-blue" : done ? "text-green-400" : "text-text-muted"}`}>
                {labels[i]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-400/10 border border-red-400/20">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* STEP 1: Upload */}
      {step === "upload" && (
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
            dragging ? "border-accent-blue bg-accent-blue/5" : "border-border hover:border-border/80"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.txt" className="hidden" onChange={onFileChange} />
          <Upload className="w-10 h-10 text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-primary mb-1">
            Arrastrá tu archivo CSV o hacé click para buscarlo
          </p>
          <p className="text-xs text-text-muted">
            Exportá desde tu sistema actual (Excel, Google Sheets, cualquier CRM) y subilo acá
          </p>
        </div>
      )}

      {/* STEP 2: Mapping */}
      {step === "mapping" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background-elevated border border-border">
            <FileText className="w-4 h-4 text-text-muted shrink-0" />
            <span className="text-sm text-text-primary">{fileName}</span>
            <span className="text-xs text-text-muted ml-auto">{allRows.length} filas</span>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-1">Mapeo de columnas</h2>
            <p className="text-xs text-text-muted mb-3">
              Aura detectó automáticamente las columnas. Revisá y ajustá si es necesario.
            </p>

            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-background-elevated border-b border-border">
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Columna en tu archivo</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Campo en Aura</th>
                    <th className="text-left px-4 py-2.5 text-text-muted font-medium">Ejemplo</th>
                  </tr>
                </thead>
                <tbody>
                  {mapping.map((m, i) => (
                    <tr key={m.csvColumn} className={i < mapping.length - 1 ? "border-b border-border/50" : ""}>
                      <td className="px-4 py-2.5 text-text-primary font-medium">{m.csvColumn}</td>
                      <td className="px-4 py-2.5">
                        <select
                          value={m.auraField}
                          onChange={(e) => updateMapping(m.csvColumn, e.target.value as AuraField)}
                          className="w-full bg-background-elevated border border-border rounded-md px-2 py-1 text-text-primary text-xs focus:outline-none focus:border-accent-blue"
                        >
                          {AURA_FIELDS.map((f) => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-text-muted max-w-[120px] truncate">
                        {allRows[0]?.[m.csvColumn] ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Preview */}
          {activeMappings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-text-primary mb-2">
                Vista previa ({Math.min(previewRows.length, 4)} de {allRows.length} filas)
              </h2>
              <div className="rounded-lg border border-border overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-background-elevated border-b border-border">
                      {activeMappings.map((m) => (
                        <th key={m.csvColumn} className="text-left px-3 py-2 text-text-muted font-medium whitespace-nowrap">
                          {AURA_FIELDS.find((f) => f.value === m.auraField)?.label.replace(" *", "")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, i) => (
                      <tr key={i} className={i < previewRows.length - 1 ? "border-b border-border/50" : ""}>
                        {activeMappings.map((m) => (
                          <td key={m.csvColumn} className="px-3 py-2 text-text-primary max-w-[150px] truncate">
                            {row[m.csvColumn] || "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleImport}
              disabled={!nameIsMapped}
              className="flex-1 py-2.5 bg-accent-blue hover:bg-accent-blue/90 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Importar {allRows.length} clientes
            </button>
            <button
              onClick={() => { setStep("upload"); setHeaders([]); setAllRows([]); setMapping([]) }}
              className="px-4 py-2.5 text-sm text-text-muted hover:text-text-primary border border-border rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
          {!nameIsMapped && (
            <p className="text-xs text-yellow-400 text-center">Necesitás mapear al menos la columna "Nombre" para continuar.</p>
          )}
        </div>
      )}

      {/* STEP 3: Importing */}
      {step === "importing" && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-10 h-10 text-accent-blue animate-spin" />
          <div className="text-center">
            <p className="text-sm font-medium text-text-primary">Importando {allRows.length} clientes...</p>
            <p className="text-xs text-text-muted mt-1">Esto puede tardar unos segundos</p>
          </div>
        </div>
      )}

      {/* STEP 4: Done */}
      {step === "done" && result && (
        <div className="flex flex-col items-center py-12 gap-5 text-center">
          <div className="w-14 h-14 rounded-full bg-green-400/10 flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">¡Importación completa!</h2>
            <p className="text-sm text-text-muted mt-1">
              <span className="text-green-400 font-medium">{result.inserted} clientes</span> importados
              {result.skipped > 0 && ` · ${result.skipped} omitidos por error`}
            </p>
            {result.inserted > 0 && (
              <p className="text-xs text-text-muted mt-2">
                Los clientes con email recibirán el email de bienvenida automáticamente.
              </p>
            )}
          </div>
          <Link
            href="/backoffice/customers"
            className="px-6 py-2.5 bg-accent-blue hover:bg-accent-blue/90 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Ver clientes
          </Link>
        </div>
      )}
    </div>
  )
}
