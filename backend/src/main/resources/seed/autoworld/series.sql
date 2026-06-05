-- AUTO WORLD series (brand_id=19). 6 series; id range 19001-19006 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(19001, 19, 'Premium', NULL),
(19002, 19, 'Big Country Toys', NULL),
(19003, 19, 'Exclusives', NULL),
(19004, 19, 'Silver Screen', NULL),
(19005, 19, 'MiJo Exclusives', NULL),
(19006, 19, '1:18 Scale', NULL);

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
