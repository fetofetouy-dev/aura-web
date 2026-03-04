-- Connector infrastructure: credentials for non-Google connectors + sync logs

-- Credenciales de conectores (MercadoPago, WhatsApp, Instagram)
-- Google usa su propia tabla google_credentials
CREATE TABLE IF NOT EXISTS connector_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,  -- 'mercadopago', 'whatsapp', 'instagram'
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  provider_user_id TEXT,
  provider_metadata JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, provider)
);

ALTER TABLE connector_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own connector credentials"
  ON connector_credentials FOR ALL
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

CREATE TRIGGER set_connector_credentials_updated_at
  BEFORE UPDATE ON connector_credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Logs de sincronización para visibilidad y debug
CREATE TABLE IF NOT EXISTS sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector TEXT NOT NULL,       -- 'google-calendar', 'mercadopago', etc.
  status TEXT NOT NULL DEFAULT 'running',  -- 'running', 'success', 'failed'
  records_created INT DEFAULT 0,
  records_updated INT DEFAULT 0,
  error TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_sync_logs_tenant_connector ON sync_logs(tenant_id, connector, started_at DESC);

ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own sync logs"
  ON sync_logs FOR ALL
  USING (tenant_id = auth.uid())
  WITH CHECK (tenant_id = auth.uid());

-- Columnas extra en appointments para dedup con calendarios externos
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS external_source TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_external
  ON appointments(tenant_id, external_source, external_id)
  WHERE external_id IS NOT NULL;

-- Unique phone per tenant (para WhatsApp connector)
CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_tenant_phone
  ON customers(tenant_id, phone)
  WHERE phone IS NOT NULL;
