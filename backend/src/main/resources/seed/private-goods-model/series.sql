-- PRIVATE GOODS MODEL (PGM) series (brand_id=15). 10 series; id range 15001-15010 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(15001, 15, '250 GTO', NULL),
(15002, 15, 'F40', NULL),
(15003, 15, 'F40 LM', NULL),
(15004, 15, 'LB LP700', NULL),
(15005, 15, 'Mazda RX-7', '马自达 RX-7'),
(15006, 15, 'Nismo R34 GT-R Z-tune', NULL),
(15007, 15, 'Porsche 356', '保时捷 356'),
(15008, 15, 'RWB 930', NULL),
(15009, 15, 'RWB 964', NULL),
(15010, 15, 'RWB 993', NULL);

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
