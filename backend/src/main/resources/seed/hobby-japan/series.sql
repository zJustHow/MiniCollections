-- Hobby Japan series (brand_id=39). 3 series; id range 39001-39003 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(39001, 39, 'HJ64'),
(39002, 39, 'Initial D'),
(39003, 39, 'HJR64');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
