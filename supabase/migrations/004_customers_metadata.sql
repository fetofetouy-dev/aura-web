-- Add metadata JSONB column to customers for storing extra fields from CSV imports
ALTER TABLE customers ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;
