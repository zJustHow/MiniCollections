-- Production migration: trigram indexes for SQL search fallback.
-- Run manually on existing databases (INIT_DB=never), e.g.:
--   psql -h YOUR_RDS_ENDPOINT -U postgres -d minicollections -f 001-pg-trgm-indexes.sql
--
-- CONCURRENTLY avoids long write locks; each statement must run outside a transaction.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_name_en_trgm
    ON brands USING gin (lower(name_en) gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_name_zh_trgm
    ON brands USING gin (lower(coalesce(name_zh, '')) gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_abbreviation_trgm
    ON brands USING gin (lower(coalesce(abbreviation, '')) gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brands_name_en_norm_trgm
    ON brands USING gin (lower(replace(replace(name_en, ' ', ''), '-', '')) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brand_objects_name_en_trgm
    ON brand_objects USING gin (lower(name_en) gin_trgm_ops);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_brand_objects_name_zh_trgm
    ON brand_objects USING gin (lower(coalesce(name_zh, '')) gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_groups_name_trgm
    ON groups USING gin (name gin_trgm_ops);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_objects_name_trgm
    ON user_objects USING gin (name gin_trgm_ops);
