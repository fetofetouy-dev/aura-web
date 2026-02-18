import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { runLeadToCrm } from "@/lib/automations/lead-to-crm"

interface RunBody {
  leadName?: string
  leadEmail?: string
}

/**
 * POST /api/automations/[id]/run
 * Executes a real automation using stored OAuth tokens.
 *
 * Currently implemented:
 * - "1" (lead-to-crm): sends a real welcome Gmail to the provided lead email
 *
 * All others return a simulated success (stub for future implementation).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body: RunBody = await req.json().catch(() => ({}))
  const startedAt = new Date().toISOString()

  // ── Automation: lead-to-crm (id = "1") ──────────────────────────────────
  if (id === "1") {
    const { leadName = "Lead", leadEmail } = body

    if (!leadEmail) {
      return NextResponse.json({ error: "leadEmail es requerido para esta automatización" }, { status: 400 })
    }

    const result = await runLeadToCrm({
      tenantEmail: session.user.email,
      leadName,
      leadEmail,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, automationId: id, startedAt }, { status: 500 })
    }

    return NextResponse.json({ success: true, automationId: id, steps: result.steps, startedAt, duration: 3 })
  }

  // ── Stub: other automations ──────────────────────────────────────────────
  return NextResponse.json({
    success: true,
    automationId: id,
    stub: true,
    message: "Esta automatización está pendiente de implementación real.",
    steps: [
      { title: "Trigger recibido", status: "SUCCESS", duration: 100 },
      { title: "Procesando (simulado)", status: "SUCCESS", duration: 500 },
    ],
    startedAt,
    duration: 1,
  })
}
