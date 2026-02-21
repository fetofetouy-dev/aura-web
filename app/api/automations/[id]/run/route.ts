import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { runLeadToCrm } from "@/lib/automations/lead-to-crm"

interface RunBody {
  leadName?: string
  leadEmail?: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body: RunBody = await req.json().catch(() => ({}))
  const startedAt = new Date().toISOString()

  if (id === "1") {
    const { leadName = "Lead", leadEmail } = body
    if (!leadEmail) return NextResponse.json({ error: "leadEmail es requerido" }, { status: 400 })

    const result = await runLeadToCrm({ tenantId: user.id, leadName, leadEmail, customerId: "manual" })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error, automationId: id, startedAt }, { status: 500 })
    }
    return NextResponse.json({ success: true, automationId: id, steps: result.steps, startedAt, duration: 3 })
  }

  return NextResponse.json({
    success: true, automationId: id, stub: true,
    message: "Esta automatización está pendiente de implementación real.",
    steps: [
      { title: "Trigger recibido", status: "SUCCESS", duration: 100 },
      { title: "Procesando (simulado)", status: "SUCCESS", duration: 500 },
    ],
    startedAt, duration: 1,
  })
}
