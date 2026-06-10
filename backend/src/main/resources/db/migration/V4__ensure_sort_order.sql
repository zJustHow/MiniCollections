-- Prod databases baselined before Flyway may have skipped V1 without adding sort_order.
-- Idempotent: safe on fresh installs that already ran V1.

ALTER TABLE groups ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_objects ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE groups SET sort_order = id WHERE sort_order = 0;
UPDATE user_objects SET sort_order = id WHERE sort_order = 0;

DROP INDEX IF EXISTS idx_groups_user_id;
CREATE INDEX idx_groups_user_id ON groups (user_id, sort_order, id);

DROP INDEX IF EXISTS idx_user_objects_group_id;
CREATE INDEX idx_user_objects_group_id ON user_objects (group_id, sort_order, id);
