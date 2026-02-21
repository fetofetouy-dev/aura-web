import { Inngest } from "inngest"

export const inngest = new Inngest({
  id: "aura",
  name: "Aura Automations",
})

// Typed event definitions
export type AuraEvents = {
  "customer/created": {
    data: {
      tenantId: string
      customerId: string
      leadName: string
      leadEmail: string | null
    }
  }
  "webhook/received": {
    data: {
      tenantId: string
      source: string
      automationType: string
      payload: Record<string, unknown>
      customerId?: string
    }
  }
  "cron/daily": {
    data: Record<string, never>
  }
}
