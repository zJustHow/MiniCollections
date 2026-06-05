-- Tiny series (brand_id=42). 23 series; id range 42001-42023 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(42001, 42, 'Tiny City', 'Tiny 城市'),
(42002, 42, '1/18 Tiny Hobby', '1/18 Tiny Hobby'),
(42003, 42, 'Tiny T-Brick', 'Tiny T-Brick'),
(42004, 42, 'Tiny Block', 'Tiny Block'),
(42005, 42, 'Tiny Toy', 'Tiny Toy'),
(42006, 42, '1/43 Tiny Hobby', '1/43 Tiny Hobby'),
(42007, 42, '1/12 Tiny Hobby', '1/12 Tiny Hobby'),
(42008, 42, 'Tiny Singapore Series', 'Tiny 新加坡系列'),
(42009, 42, 'Other Scale Tiny Hobby', 'Other Scale Tiny Hobby'),
(42010, 42, 'Tiny Memory', 'Tiny Memory'),
(42011, 42, 'HK Machine', 'HK Machine'),
(42012, 42, 'Kalos', 'Kalos'),
(42013, 42, 'Hong Kong Machines Theme', '香港机器主题'),
(42014, 42, 'Lan Lan Cat Theme', 'Lan Lan Cat 主题'),
(42015, 42, '88 Good Shepherd Street', '88 Good Shepherd Street'),
(42016, 42, 'Artist - Rocky Chan Theme', 'Artist - Rocky Chan 主题'),
(42017, 42, 'Coca Cola Theme', '可口可乐主题'),
(42018, 42, 'YookGun Kuma Theme', 'YookGun Kuma 主题'),
(42019, 42, 'Wild Stickers Theme', 'Wild Stickers 主题'),
(42020, 42, 'Uncle Fish Theme', 'Uncle Fish 主题'),
(42021, 42, 'Artist - Dark Kenjamin Theme', 'Artist - Dark Kenjamin 主题'),
(42022, 42, 'Artist - Cheukman Theme', 'Artist - Cheukman 主题'),
(42023, 42, 'Mr. Bean Theme', 'Mr. Bean 主题');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
