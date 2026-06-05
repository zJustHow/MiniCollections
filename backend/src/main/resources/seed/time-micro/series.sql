-- Time Micro (TM) series (brand_id=48). 9 series; id range 48001-48009 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(48001, 48, 'ATS', 'ATS'),
(48002, 48, 'Cool Car', 'Cool Car'),
(48003, 48, 'MBOX', 'MBOX'),
(48004, 48, 'ModernArt', 'ModernArt'),
(48005, 48, 'MoreArt', 'MoreArt'),
(48006, 48, 'Original Model', 'Original Model'),
(48007, 48, 'SUPCAR', 'SUPCAR'),
(48008, 48, 'TIME TOP', 'TIME TOP'),
(48009, 48, 'TimeMicro', 'TimeMicro');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
