-- Almost Real (AR) series (brand_id=39). 3 series; id range 39001-39003 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(39001, 39, 'Almost Real', '几乎真实'),
(39002, 39, 'ARbox', 'AR盒'),
(39003, 39, 'AR+', '增强现实+');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
