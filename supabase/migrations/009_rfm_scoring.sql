-- RFM scoring columns on customers (computed, never manually set)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS rfm_recency INT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS rfm_frequency INT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS rfm_monetary INT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS rfm_score INT;         -- R*100 + F*10 + M
ALTER TABLE customers ADD COLUMN IF NOT EXISTS rfm_updated_at TIMESTAMPTZ;

-- Customer alerts table (churn risk, segment changes, etc.)
CREATE TABLE IF NOT EXISTS customer_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,              -- 'churn_risk', 'segment_downgrade', 'high_value_inactive'
  severity TEXT NOT NULL DEFAULT 'medium',   -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT,
  suggested_action TEXT,
  status TEXT NOT NULL DEFAULT 'pending',    -- 'pending', 'dismissed', 'acted'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE customer_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own alerts" ON customer_alerts
  FOR ALL USING (tenant_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_customer_alerts_tenant_status
  ON customer_alerts(tenant_id, status) WHERE status = 'pending';
