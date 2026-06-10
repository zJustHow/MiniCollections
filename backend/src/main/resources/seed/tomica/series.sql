-- Tomica series (brand_id=21). 12 series; id range 21001-21012 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(21001, 21, 'Tomica'),
(21002, 21, 'Dream Tomica'),
(21003, 21, 'TOMICA Premium'),
(21004, 21, 'TOMICA Premium RS'),
(21005, 21, 'TOMICA Premium Unlimited'),
(21006, 21, 'TOMICA Gift Set'),
(21007, 21, 'TOMICA World'),
(21008, 21, 'Thomas & Friends Tomica'),
(21009, 21, 'Disney Tomica'),
(21010, 21, 'Cars Tomica'),
(21011, 21, 'First Tomica'),
(21012, 21, 'Special');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
