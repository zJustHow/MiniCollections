-- Tomica series (brand_id=44). 12 series; id range 44001-44012 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(44001, 44, 'Tomica', '多美卡'),
(44002, 44, 'Dream Tomica', '梦想多美卡'),
(44003, 44, 'TOMICA Premium', '多美卡 Premium'),
(44004, 44, 'TOMICA Premium RS', '多美卡 Premium RS'),
(44005, 44, 'TOMICA Premium Unlimited', '多美卡 Premium Unlimited'),
(44006, 44, 'TOMICA Gift Set', '多美卡礼盒'),
(44007, 44, 'TOMICA World', '多美卡世界'),
(44008, 44, 'Thomas & Friends Tomica', '托马斯火车多美卡'),
(44009, 44, 'Disney Tomica', '迪士尼多美卡'),
(44010, 44, 'Cars Tomica', '赛车总动员多美卡'),
(44011, 44, 'First Tomica', '初试多美卡'),
(44012, 44, 'Special', '特别的');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
