-- Trigram indexes for SQL search fallback. Expression shapes must match repository queries.
-- Drops invalid indexes left by a failed CONCURRENTLY build, then creates any missing indexes.

DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN
        SELECT c.relname AS idx_name
        FROM pg_index i
        JOIN pg_class c ON c.oid = i.indexrelid
        WHERE NOT i.indisvalid
          AND c.relname IN (
              'idx_brands_name_en_trgm',
              'idx_brands_name_zh_trgm',
              'idx_brands_abbreviation_trgm',
              'idx_brands_name_en_norm_trgm',
              'idx_brand_objects_name_en_trgm',
              'idx_brand_objects_name_zh_trgm',
              'idx_groups_name_trgm',
              'idx_user_objects_name_trgm'
          )
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', r.idx_name);
    END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS idx_brands_name_en_trgm
    ON brands USING gin (lower(name_en) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brands_name_zh_trgm
    ON brands USING gin (lower(coalesce(name_zh, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brands_abbreviation_trgm
    ON brands USING gin (lower(coalesce(abbreviation, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brands_name_en_norm_trgm
    ON brands USING gin (lower(replace(replace(name_en, ' ', ''), '-', '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_brand_objects_name_en_trgm
    ON brand_objects USING gin (lower(name_en) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_brand_objects_name_zh_trgm
    ON brand_objects USING gin (lower(coalesce(name_zh, '')) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_groups_name_trgm
    ON groups USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_user_objects_name_trgm
    ON user_objects USING gin (name gin_trgm_ops);
