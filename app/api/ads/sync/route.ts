import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api-auth"
import { inngest } from "@/lib/inngest"
import { rateLimit } from "@/lib/rate-limit"

// POST: Trigger a manual ad data sync for the current tenant
export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth()
  if (error) return error

  const limited = rateLimit(`ads-sync:${user.id}`, 5, 300_000)
  if (limited) return limited

  const body = await req.json().catch(() => ({}))
  const accountId = body.accountId // optional: sync a specific account

  await inngest.send({
    name: "ads/sync.requested",
    data: {
      tenantId: user.id,
      accountId: accountId ?? undefined,
    },
  })

  return NextResponse.json({ ok: true, message: "Sincronización iniciada" })
}
