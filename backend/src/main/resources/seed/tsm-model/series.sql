-- TSM Model series (brand_id=27). 7 series; id range 27001-27007 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(27001, 27, 'MasterCraft', NULL),
(27002, 27, 'Scale12 Automotive', NULL),
(27003, 27, 'Scale12 Motorbike', NULL),
(27004, 27, 'Scale18', NULL),
(27005, 27, 'Scale43', NULL),
(27006, 27, 'Velocity Series', NULL),
(27007, 27, 'IMSA', NULL);

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
