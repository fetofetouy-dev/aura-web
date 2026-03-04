-- tenant_profiles already exists with columns: id, business_name, business_type, timezone, plan, onboarding_completed, settings, created_at, updated_at
-- We only need to add the phone column and RLS policy

ALTER TABLE tenant_profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- RLS
ALTER TABLE tenant_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON tenant_profiles
  FOR ALL USING (id = auth.uid());

-- Index for WhatsApp tenant lookup by phone
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenant_profiles_phone
  ON tenant_profiles(phone) WHERE phone IS NOT NULL;
