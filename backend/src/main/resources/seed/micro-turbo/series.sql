-- Micro Turbo (MT) series (brand_id=41). 3 series; id range 41001-41003 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(41001, 41, 'Cars', '汽车'),
(41002, 41, 'Trucks', '卡车'),
(41003, 41, 'Diorama', '场景');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
