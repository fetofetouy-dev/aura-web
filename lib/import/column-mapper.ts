export type AuraField = "name" | "email" | "phone" | "company" | "birthday" | "notes" | "skip"

export interface MappingResult {
  csvColumn: string
  auraField: AuraField
  confidence: number // 0-1
}

// Normalize: lowercase, remove accents, remove spaces/underscores/hyphens
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[\s_\-./]+/g, "")      // strip separators
}

// Known aliases per Aura field
const ALIASES: Record<AuraField, string[]> = {
  name: [
    "nombre", "nombrecompleto", "nombreapellido", "cliente", "contacto",
    "name", "fullname", "firstname", "lastname", "person", "titular",
    "denominacion", "razonsocial",
  ],
  email: [
    "email", "mail", "correo", "correoelectronico", "emailaddress",
    "emailcontacto", "emailcliente", "e-mail",
  ],
  phone: [
    "telefono", "tel", "celular", "movil", "whatsapp", "phone",
    "mobile", "cell", "cellphone", "phonenumber", "numerodetelefono",
    "numerodecelular", "numerodecontacto",
  ],
  company: [
    "empresa", "compania", "organizacion", "corporacion", "negocio",
    "company", "organization", "business", "firma", "razon",
  ],
  birthday: [
    "cumpleanos", "cumple", "fechacumpleanos", "fechanacimiento",
    "nacimiento", "birthday", "birthdate", "dateofbirth", "dob",
    "fechadenacimiento",
  ],
  notes: [
    "notas", "nota", "observaciones", "observacion", "comentarios",
    "comentario", "descripcion", "detalle", "notes", "note",
    "comments", "comment", "observations", "details", "info",
    "informacion",
  ],
  skip: [],
}

export function mapColumns(csvHeaders: string[]): MappingResult[] {
  return csvHeaders.map((header) => {
    const key = normalize(header)

    for (const [field, aliases] of Object.entries(ALIASES) as [AuraField, string[]][]) {
      if (field === "skip") continue

      // Exact match → high confidence
      if (aliases.includes(key)) {
        return { csvColumn: header, auraField: field, confidence: 1 }
      }

      // Partial match: does the key start with or contain an alias?
      for (const alias of aliases) {
        if (key.startsWith(alias) || alias.startsWith(key)) {
          return { csvColumn: header, auraField: field, confidence: 0.8 }
        }
        if (key.includes(alias) || alias.includes(key)) {
          return { csvColumn: header, auraField: field, confidence: 0.6 }
        }
      }
    }

    return { csvColumn: header, auraField: "skip", confidence: 0 }
  })
}

// After mapping, pick one column per Aura field (highest confidence wins)
export function deduplicateMapping(mappings: MappingResult[]): MappingResult[] {
  const seen = new Set<AuraField>()
  return mappings.map((m) => {
    if (m.auraField === "skip") return m
    if (seen.has(m.auraField)) {
      return { ...m, auraField: "skip", confidence: 0 }
    }
    seen.add(m.auraField)
    return m
  })
}
