CREATE INDEX IF NOT EXISTS idx_user_identifiers_identifier ON user_identifiers (identifier);
CREATE INDEX IF NOT EXISTS idx_user_identifiers_user_type ON user_identifiers (user_id, type);
