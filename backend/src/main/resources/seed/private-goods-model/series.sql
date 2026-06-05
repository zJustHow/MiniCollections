-- PRIVATE GOODS MODEL (PGM) series (brand_id=15). 10 series; id range 15001-15010 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(15001, 15, '250 GTO', '250 GTO'),
(15002, 15, 'F40', 'F40'),
(15003, 15, 'F40 LM', 'F40LM'),
(15004, 15, 'LB LP700', 'LB LP700'),
(15005, 15, 'Mazda RX-7', '马自达 RX-7'),
(15006, 15, 'Nismo R34 GT-R Z-tune', 'Nismo R34 GT-R Z-tune'),
(15007, 15, 'Porsche 356', '保时捷 356'),
(15008, 15, 'RWB 930', 'RWB 930'),
(15009, 15, 'RWB 964', 'RWB 964'),
(15010, 15, 'RWB 993', 'RWB 993');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
