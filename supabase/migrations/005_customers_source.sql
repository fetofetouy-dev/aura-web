-- Add source column to track where each customer came from
ALTER TABLE customers ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- Backfill existing customers: if they have metadata, likely from CSV
UPDATE customers SET source = 'csv' WHERE metadata IS NOT NULL AND source = 'manual';

COMMENT ON COLUMN customers.source IS 'Origin of the customer record: manual, csv, webhook:{source}, connector:{name}';
