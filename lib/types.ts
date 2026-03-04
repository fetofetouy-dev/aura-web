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
  metadata: Record<string, string> | null
  source: string
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

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "noshow"

export interface Appointment {
  id: string
  tenant_id: string
  customer_id: string
  title: string
  date: string          // YYYY-MM-DD
  start_time: string    // HH:MM (24h)
  end_time: string      // HH:MM (24h)
  status: AppointmentStatus
  notes: string | null
  reminder_sent: boolean
  external_id: string | null
  external_source: string | null
  created_at: string
  updated_at: string
  // Joined fields (optional, from select with customer)
  customer?: Pick<Customer, "id" | "name" | "email" | "phone">
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

export interface ConnectorCredential {
  id: string
  tenant_id: string
  provider: "mercadopago" | "whatsapp" | "instagram" | "meta_ads" | "tiktok_ads"
  access_token: string
  refresh_token: string | null
  token_expires_at: string | null
  provider_user_id: string | null
  provider_metadata: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SyncLog {
  id: string
  tenant_id: string
  connector: string
  status: "running" | "success" | "failed"
  records_created: number
  records_updated: number
  error: string | null
  started_at: string
  completed_at: string | null
}

export interface CalendarEvent {
  id: string
  summary: string
  start: string
  end: string
  status: string
  description: string | null
  attendees: Array<{ email: string; displayName?: string; responseStatus?: string }>
}

// --- Cerebro de Aura ---

export interface TenantProfile {
  id: string
  business_name: string | null
  business_type: string | null
  timezone: string | null
  plan: string | null
  onboarding_completed: boolean | null
  phone: string | null
  settings: TenantSettings
  created_at: string
  updated_at: string
}

export interface TenantSettings {
  inactivity_days?: number    // default 60
  theme?: "light" | "dark" | "system"
  whatsapp_enabled?: boolean
}

export interface TimelineEntry {
  id: string
  tenant_id: string
  customer_id: string
  type: string
  value: number | null
  metadata: Record<string, unknown>
  created_at: string
}

export type AlertType = "churn_risk" | "segment_downgrade" | "high_value_inactive"
export type AlertSeverity = "low" | "medium" | "high" | "critical"
export type AlertStatus = "pending" | "dismissed" | "acted"

export interface CustomerAlert {
  id: string
  tenant_id: string
  customer_id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string | null
  suggested_action: string | null
  status: AlertStatus
  created_at: string
  resolved_at: string | null
  // Joined
  customer?: Pick<Customer, "id" | "name" | "email" | "segment">
}

export type CustomerSegment = "champion" | "loyal" | "at_risk" | "dormant" | "new" | "lost" | "unknown"

export interface DashboardInsights {
  segments: Record<CustomerSegment, number>
  alerts: CustomerAlert[]
  churnRate: number
  retentionRate: number
  segmentChanges: Array<{
    customer_id: string
    customer_name: string
    from_segment: string
    to_segment: string
  }>
}

// --- Media Optimizer ---

export type AdPlatform = "google_ads" | "meta_ads" | "tiktok_ads"
export type CampaignStatus = "enabled" | "paused" | "removed" | "unknown"
export type OptimizationStrategy = "conservative" | "moderate" | "aggressive"
export type OptimizationRunStatus = "pending" | "running" | "completed" | "failed"

export interface AdAccount {
  id: string
  tenant_id: string
  platform: AdPlatform
  platform_account_id: string
  account_name: string | null
  currency: string
  timezone: string
  is_active: boolean
  credentials_source: string
  last_synced_at: string | null
  created_at: string
  updated_at: string
}

export interface AdCampaign {
  id: string
  tenant_id: string
  ad_account_id: string
  platform_campaign_id: string
  name: string
  status: CampaignStatus
  campaign_type: string | null
  daily_budget: number | null
  target_roas: number | null
  currency: string
  created_at: string
  updated_at: string
  // Joined fields
  ad_account?: Pick<AdAccount, "platform" | "account_name">
  latest_stats?: AdCampaignDailyStats
}

export interface AdCampaignDailyStats {
  id: string
  tenant_id: string
  campaign_id: string
  date: string
  impressions: number
  clicks: number
  cost: number
  conversions: number
  conversion_value: number
}

export interface OptimizationRun {
  id: string
  tenant_id: string
  status: OptimizationRunStatus
  total_budget: number | null
  date_range_start: string | null
  date_range_end: string | null
  campaigns_count: number
  model_version: string | null
  error: string | null
  started_at: string
  completed_at: string | null
  solutions?: OptimizationSolution[]
}

export interface OptimizationSolution {
  id: string
  run_id: string
  tenant_id: string
  strategy: OptimizationStrategy
  total_budget: number
  expected_conversions: number | null
  expected_conversion_value: number | null
  expected_roas: number | null
  allocations: CampaignAllocation[]
  confidence_interval: { lower: number; upper: number } | null
  is_applied: boolean
  applied_at: string | null
  created_at: string
}

export interface CampaignAllocation {
  campaign_id: string
  campaign_name: string
  platform: AdPlatform
  current_budget: number
  recommended_budget: number
  change_percent: number
  expected_conversions: number
  expected_roas: number
  // Model diagnostics (optional, from parameters)
  elasticity?: number
  r_squared?: number
  model_confidence?: string
  fit_method?: string
}

// --- Optimizer Analysis & Impact ---

export interface PowerLawCurvePoint {
  cost: number
  volume: number
  volume_lower: number
  volume_upper: number
}

export interface CampaignCurve {
  campaign_id: string
  campaign_name: string
  platform: AdPlatform
  w0: number
  w1: number
  w1_std: number | null
  r_squared: number
  rmse: number
  method: string
  data_points: number
  current_budget: number
  curve: PowerLawCurvePoint[]
}

export interface AnalyzeResponse {
  status: "success" | "error"
  error?: string
  curves?: CampaignCurve[]
  excluded?: Array<{
    campaign_id: string
    campaign_name: string
    reason: string
  }>
}

export interface ImpactMetrics {
  solution_id: string
  strategy: OptimizationStrategy
  applied_at: string
  period_days: number
  before: { cost: number; conversions: number; roas: number }
  after: { cost: number; conversions: number; roas: number }
  delta_pct: { cost: number; conversions: number; roas: number }
}
