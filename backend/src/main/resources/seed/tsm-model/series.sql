-- TSM Model series (brand_id=27). 7 series; id range 27001-27007 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(27001, 27, 'MasterCraft', '大师工艺'),
(27002, 27, 'Scale12 Automotive', 'Scale12 汽车'),
(27003, 27, 'Scale12 Motorbike', 'Scale12 摩托车'),
(27004, 27, 'Scale18', '规模18'),
(27005, 27, 'Scale43', '规模43'),
(27006, 27, 'Velocity Series', '速度系列'),
(27007, 27, 'IMSA', 'IMSA');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
