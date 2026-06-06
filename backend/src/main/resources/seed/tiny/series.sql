-- Tiny series (brand_id=17). 23 series; id range 17001-17023 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(17001, 17, 'Tiny City', 'Tiny 城市'),
(17002, 17, '1/18 Tiny Hobby', '1/18 Tiny Hobby'),
(17003, 17, 'Tiny T-Brick', 'Tiny T-Brick'),
(17004, 17, 'Tiny Block', 'Tiny Block'),
(17005, 17, 'Tiny Toy', 'Tiny Toy'),
(17006, 17, '1/43 Tiny Hobby', '1/43 Tiny Hobby'),
(17007, 17, '1/12 Tiny Hobby', '1/12 Tiny Hobby'),
(17008, 17, 'Tiny Singapore Series', 'Tiny 新加坡系列'),
(17009, 17, 'Other Scale Tiny Hobby', 'Other Scale Tiny Hobby'),
(17010, 17, 'Tiny Memory', 'Tiny Memory'),
(17011, 17, 'HK Machine', 'HK Machine'),
(17012, 17, 'Kalos', 'Kalos'),
(17013, 17, 'Hong Kong Machines Theme', '香港机器主题'),
(17014, 17, 'Lan Lan Cat Theme', 'Lan Lan Cat 主题'),
(17015, 17, '88 Good Shepherd Street', '88 Good Shepherd Street'),
(17016, 17, 'Artist - Rocky Chan Theme', 'Artist - Rocky Chan 主题'),
(17017, 17, 'Coca Cola Theme', '可口可乐主题'),
(17018, 17, 'YookGun Kuma Theme', 'YookGun Kuma 主题'),
(17019, 17, 'Wild Stickers Theme', 'Wild Stickers 主题'),
(17020, 17, 'Uncle Fish Theme', 'Uncle Fish 主题'),
(17021, 17, 'Artist - Dark Kenjamin Theme', 'Artist - Dark Kenjamin 主题'),
(17022, 17, 'Artist - Cheukman Theme', 'Artist - Cheukman 主题'),
(17023, 17, 'Mr. Bean Theme', 'Mr. Bean 主题');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
