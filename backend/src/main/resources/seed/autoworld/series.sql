-- AUTO WORLD series (brand_id=19). 6 series; id range 19001-19006 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(19001, 19, 'Premium'),
(19002, 19, 'Big Country Toys'),
(19003, 19, 'Exclusives'),
(19004, 19, 'Silver Screen'),
(19005, 19, 'MiJo Exclusives'),
(19006, 19, '1:18 Scale');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
