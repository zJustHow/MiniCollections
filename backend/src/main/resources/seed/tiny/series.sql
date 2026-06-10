-- Tiny series (brand_id=17). 23 series; id range 17001-17023 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(17001, 17, 'Tiny City'),
(17002, 17, '1/18 Tiny Hobby'),
(17003, 17, 'Tiny T-Brick'),
(17004, 17, 'Tiny Block'),
(17005, 17, 'Tiny Toy'),
(17006, 17, '1/43 Tiny Hobby'),
(17007, 17, '1/12 Tiny Hobby'),
(17008, 17, 'Tiny Singapore Series'),
(17009, 17, 'Other Scale Tiny Hobby'),
(17010, 17, 'Tiny Memory'),
(17011, 17, 'HK Machine'),
(17012, 17, 'Kalos'),
(17013, 17, 'Hong Kong Machines Theme'),
(17014, 17, 'Lan Lan Cat Theme'),
(17015, 17, '88 Good Shepherd Street'),
(17016, 17, 'Artist - Rocky Chan Theme'),
(17017, 17, 'Coca Cola Theme'),
(17018, 17, 'YookGun Kuma Theme'),
(17019, 17, 'Wild Stickers Theme'),
(17020, 17, 'Uncle Fish Theme'),
(17021, 17, 'Artist - Dark Kenjamin Theme'),
(17022, 17, 'Artist - Cheukman Theme'),
(17023, 17, 'Mr. Bean Theme');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
