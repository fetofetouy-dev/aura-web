import { serve } from "inngest/next"
import { inngest } from "@/lib/inngest"
import { leadToCrmFunction, birthdayReminderFunction, reactivationReminderFunction, googleCalendarSyncFunction, rfmScoringFunction, adsDataSyncFunction, adsManualSyncFunction, mediaOptimizerFunction } from "@/lib/inngest/index"

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [leadToCrmFunction, birthdayReminderFunction, reactivationReminderFunction, googleCalendarSyncFunction, rfmScoringFunction, adsDataSyncFunction, adsManualSyncFunction, mediaOptimizerFunction],
})
