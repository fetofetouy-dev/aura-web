export interface Customer {
  id: string
  tenant_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  birthday: string | null
  segment: string
  status: string
  last_interaction_at: string | null
  created_at: string
}

export interface AutomationExecution {
  id: string
  tenant_id: string
  automation_type: string
  customer_id: string | null
  status: "running" | "success" | "failed"
  trigger: string
  trigger_source: string
  metadata: Record<string, unknown>
  steps: AutomationStep[]
  error: string | null
  completed_at: string | null
  duration_ms: number | null
  started_at: string
}

export interface AutomationStep {
  title: string
  status: "SUCCESS" | "FAILED"
  duration?: number
  messageId?: string
  error?: string
}

export interface GoogleCredentials {
  tenant_id: string
  user_email: string
  access_token: string
  refresh_token: string
  expires_at: string
  updated_at: string
}

export interface WebhookEndpoint {
  id: string
  tenant_id: string
  source: string
  name: string
  secret_key: string
  automation_type: string
  event_mapping: Record<string, string>
  is_active: boolean
}
