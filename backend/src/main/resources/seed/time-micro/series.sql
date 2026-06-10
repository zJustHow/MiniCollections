-- Time Micro (TM) series (brand_id=14). 9 series; id range 14001-14009 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(14001, 14, 'ATS'),
(14002, 14, 'Cool Car'),
(14003, 14, 'MBOX'),
(14004, 14, 'ModernArt'),
(14005, 14, 'MoreArt'),
(14006, 14, 'Original Model'),
(14007, 14, 'SUPCAR'),
(14008, 14, 'TIME TOP'),
(14009, 14, 'TimeMicro');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
