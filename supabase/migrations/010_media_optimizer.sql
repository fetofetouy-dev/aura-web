-- Media Optimizer tables
-- Supports Google Ads, Meta Ads, and TikTok Ads

-- ============================================================
-- ad_accounts: Connected ad accounts per tenant
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  platform TEXT NOT NULL,                -- 'google_ads' | 'meta_ads' | 'tiktok_ads'
  platform_account_id TEXT NOT NULL,     -- Google: customer ID (xxx-xxx-xxxx), Meta: act_XXXXX, TikTok: advertiser_id
  account_name TEXT,
  currency TEXT DEFAULT 'ARS',
  timezone TEXT DEFAULT 'America/Argentina/Buenos_Aires',
  is_active BOOLEAN NOT NULL DEFAULT true,
  credentials_source TEXT NOT NULL,      -- 'google_credentials' | 'connector_credentials'
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, platform, platform_account_id)
);

ALTER TABLE ad_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ad accounts" ON ad_accounts
  FOR ALL USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ad_accounts_tenant
  ON ad_accounts(tenant_id) WHERE is_active = true;

-- ============================================================
-- ad_campaigns: Campaigns synced from ad platforms
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  ad_account_id UUID NOT NULL REFERENCES ad_accounts(id) ON DELETE CASCADE,
  platform_campaign_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unknown',  -- 'enabled','paused','removed','unknown'
  campaign_type TEXT,                      -- 'search','display','shopping','video','performance_max','conversions','traffic','awareness'
  daily_budget NUMERIC(12,2),
  target_roas NUMERIC(8,4),
  currency TEXT DEFAULT 'ARS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, ad_account_id, platform_campaign_id)
);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON ad_campaigns
  FOR ALL USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_account
  ON ad_campaigns(ad_account_id);

-- ============================================================
-- ad_campaign_daily_stats: Daily performance data per campaign
-- This is the core input for the optimization model
-- ============================================================
CREATE TABLE IF NOT EXISTS ad_campaign_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INT NOT NULL DEFAULT 0,
  clicks INT NOT NULL DEFAULT 0,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  conversions NUMERIC(10,2) NOT NULL DEFAULT 0,
  conversion_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, date)
);

ALTER TABLE ad_campaign_daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own stats" ON ad_campaign_daily_stats
  FOR ALL USING (tenant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_campaign_daily_stats_lookup
  ON ad_campaign_daily_stats(campaign_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_daily_stats_tenant_date
  ON ad_campaign_daily_stats(tenant_id, date DESC);

-- ============================================================
-- optimization_runs: History of optimization executions
-- ============================================================
CREATE TABLE IF NOT EXISTS optimization_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending','running','completed','failed'
  total_budget NUMERIC(12,2),
  date_range_start DATE,
  date_range_end DATE,
  campaigns_count INT DEFAULT 0,
  model_version TEXT,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE optimization_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own runs" ON optimization_runs
  FOR ALL USING (tenant_id = auth.uid()) WITH CHECK (tenant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_optimization_runs_tenant
  ON optimization_runs(tenant_id, started_at DESC);

-- ============================================================
-- optimization_solutions: Solutions from each optimization run
-- 3 per run: conservative, moderate, aggressive
-- ============================================================
CREATE TABLE IF NOT EXISTS optimization_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES optimization_runs(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  strategy TEXT NOT NULL,                -- 'conservative','moderate','aggressive'
  total_budget NUMERIC(12,2) NOT NULL,
  expected_conversions NUMERIC(10,2),
  expected_conversion_value NUMERIC(12,2),
  expected_roas NUMERIC(8,4),
  allocations JSONB NOT NULL DEFAULT '[]',
  confidence_interval JSONB,            -- {lower: number, upper: number}
  is_applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE optimization_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own solutions" ON optimization_solutions
  FOR ALL USING (tenant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_optimization_solutions_run
  ON optimization_solutions(run_id);
