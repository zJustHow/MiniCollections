-- Hobby Japan series (brand_id=47). 3 series; id range 47001-47003 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(47001, 47, 'HJ64', 'HJ64'),
(47002, 47, 'Initial D', '头文字D'),
(47003, 47, 'HJR64', '红JR64');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
