-- BMC series (brand_id=43). 1 series; id range 43001-43001 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(43001, 43, 'BM Junior 1/64');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
