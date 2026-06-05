-- GCD series (brand_id=40). 2 series; id range 40001-40002 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(40001, 40, 'DCT', '离散余弦变换'),
(40002, 40, 'GCD', 'GCD');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
