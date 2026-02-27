-- Helper function for auto-updating updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Webhook endpoints: each tenant can configure incoming webhooks from external systems
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,                    -- identifier: "calendly", "mercadopago", "mi-crm"
  name TEXT NOT NULL,                      -- display name: "Mi CRM", "Calendly", etc.
  secret_key TEXT NOT NULL,                -- auth header value (x-aura-secret)
  automation_type TEXT NOT NULL DEFAULT 'customer_sync',
  event_mapping JSONB NOT NULL DEFAULT '{}',  -- maps external fields to Aura fields
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each tenant can only have one webhook per source
CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_endpoints_tenant_source
  ON webhook_endpoints(tenant_id, source);

-- Index for fast lookup during webhook reception
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_source_secret
  ON webhook_endpoints(source, secret_key) WHERE is_active = true;

-- RLS
ALTER TABLE webhook_endpoints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own webhook endpoints"
  ON webhook_endpoints FOR ALL
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE TRIGGER set_webhook_endpoints_updated_at
  BEFORE UPDATE ON webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
