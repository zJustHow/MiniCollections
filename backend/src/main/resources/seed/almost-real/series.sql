-- Almost Real (AR) series (brand_id=20). 3 series; id range 20001-20003 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(20001, 20, 'Almost Real', '几乎真实'),
(20002, 20, 'ARbox', 'AR盒'),
(20003, 20, 'AR+', '增强现实+');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
