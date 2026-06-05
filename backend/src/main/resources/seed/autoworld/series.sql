-- AUTO WORLD series (brand_id=19). 6 series; id range 19001-19006 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(19001, 19, 'Premium', '优质的'),
(19002, 19, 'Big Country Toys', '大国玩具'),
(19003, 19, 'Exclusives', '独家报道'),
(19004, 19, 'Silver Screen', '银幕'),
(19005, 19, 'MiJo Exclusives', 'MiJo 独家商品'),
(19006, 19, '1:18 Scale', '1:18 比例');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
