import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-server"
import { requireAuth } from "@/lib/api-auth"
import { inngest } from "@/lib/inngest"
import type { AuraField } from "@/lib/import/column-mapper"

interface ImportRow {
  name?: string
  email?: string
  phone?: string
  company?: string
  birthday?: string
  notes?: string
}

interface ImportPayload {
  rows: Record<string, string>[]
  mapping: { csvColumn: string; auraField: AuraField }[]
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const body: ImportPayload = await req.json().catch(() => null)
  if (!body?.rows || !body?.mapping) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  // Apply mapping to each raw CSV row → ImportRow
  const mapped: ImportRow[] = body.rows.map((rawRow) => {
    const row: ImportRow = {}
    for (const { csvColumn, auraField } of body.mapping) {
      if (auraField === "skip") continue
      const value = rawRow[csvColumn]?.trim()
      if (value) (row as Record<string, string>)[auraField] = value
    }
    return row
  })

  // Filter out rows without a name (required)
  const valid = mapped.filter((r) => r.name?.trim())

  if (valid.length === 0) {
    return NextResponse.json({ error: "No valid rows found (name is required)" }, { status: 400 })
  }

  // Normalize birthday to ISO date (DD/MM/YYYY or MM/DD/YYYY → YYYY-MM-DD)
  const toISODate = (s: string): string | null => {
    if (!s) return null
    // Already ISO: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
    // DD/MM/YYYY
    const dmyMatch = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
    if (dmyMatch) {
      const [, d, m, y] = dmyMatch
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
    }
    return null
  }

  // Build insert records
  const toInsert = valid.map((r) => ({
    tenant_id: user.id,
    tenant_email: user.email,
    name: r.name!.trim(),
    email: r.email?.trim().toLowerCase() || null,
    phone: r.phone?.trim() || null,
    company: r.company?.trim() || null,
    notes: r.notes?.trim() || null,
    birthday: r.birthday ? toISODate(r.birthday) : null,
  }))

  // Bulk insert in batches of 100, upsert by (tenant_id, email)
  let inserted = 0
  let skipped = 0
  const BATCH = 100

  for (let i = 0; i < toInsert.length; i += BATCH) {
    const batch = toInsert.slice(i, i + BATCH)

    // Rows with email: upsert (deduplicate)
    const withEmail = batch.filter((r) => r.email)
    const withoutEmail = batch.filter((r) => !r.email)

    if (withEmail.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("customers")
        .upsert(withEmail, { onConflict: "tenant_id,email", ignoreDuplicates: false })
        .select("id, email")

      if (!error && data) inserted += data.length
      else if (error) skipped += withEmail.length
    }

    if (withoutEmail.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("customers")
        .insert(withoutEmail)
        .select("id")

      if (!error && data) inserted += data.length
      else if (error) skipped += withoutEmail.length
    }
  }

  // Emit customer/created for rows that have an email (triggers lead-to-crm)
  const rowsWithEmail = toInsert.filter((r) => r.email)
  if (rowsWithEmail.length > 0) {
    // Fetch the newly inserted customers to get their IDs
    const { data: freshCustomers } = await supabaseAdmin
      .from("customers")
      .select("id, name, email")
      .eq("tenant_id", user.id)
      .in("email", rowsWithEmail.map((r) => r.email!))
      .order("created_at", { ascending: false })
      .limit(rowsWithEmail.length)

    if (freshCustomers?.length) {
      await inngest.send(
        freshCustomers.map((c) => ({
          name: "customer/created" as const,
          data: {
            tenantId: user.id,
            customerId: c.id,
            leadName: c.name,
            leadEmail: c.email!,
          },
        }))
      )
    }
  }

  return NextResponse.json({ inserted, skipped, total: valid.length })
}
