-- GCD series (brand_id=34). 2 series; id range 34001-34002 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(34001, 34, 'DCT'),
(34002, 34, 'GCD');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
