-- Tomica series (brand_id=21). 12 series; id range 21001-21012 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(21001, 21, 'Tomica', '多美卡'),
(21002, 21, 'Dream Tomica', '梦想多美卡'),
(21003, 21, 'TOMICA Premium', '多美卡 Premium'),
(21004, 21, 'TOMICA Premium RS', '多美卡 Premium RS'),
(21005, 21, 'TOMICA Premium Unlimited', '多美卡 Premium Unlimited'),
(21006, 21, 'TOMICA Gift Set', '多美卡礼盒'),
(21007, 21, 'TOMICA World', '多美卡世界'),
(21008, 21, 'Thomas & Friends Tomica', '托马斯火车多美卡'),
(21009, 21, 'Disney Tomica', '迪士尼多美卡'),
(21010, 21, 'Cars Tomica', '赛车总动员多美卡'),
(21011, 21, 'First Tomica', '初试多美卡'),
(21012, 21, 'Special', '特别的');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
