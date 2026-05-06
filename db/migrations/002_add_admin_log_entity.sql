-- Migration: Add entity tracking to admin_logs
-- This adds entity and entity_id columns for full audit trail
-- ============================================================

-- Add entity column (e.g., "Article", "User", "Category", "Tag")
ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS entity VARCHAR(50);

-- Add entity_id column (optional reference to the affected record)
ALTER TABLE admin_logs ADD COLUMN IF NOT EXISTS entity_id TEXT;

-- Add indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_admin_logs_entity ON admin_logs(entity);
CREATE INDEX IF NOT EXISTS idx_admin_logs_entity_id ON admin_logs(entity_id);

-- Composite index for filtering by entity + entity_id
CREATE INDEX IF NOT EXISTS idx_admin_logs_entity_ref ON admin_logs(entity, entity_id);
