import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest"
import { leadToCrmFunction, birthdayReminderFunction, reactivationReminderFunction } from "@/lib/inngest/index"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [leadToCrmFunction, birthdayReminderFunction, reactivationReminderFunction],
})
