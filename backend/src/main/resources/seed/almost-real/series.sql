-- Almost Real (AR) series (brand_id=20). 3 series; id range 20001-20003 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(20001, 20, 'Almost Real'),
(20002, 20, 'ARbox'),
(20003, 20, 'AR+');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
