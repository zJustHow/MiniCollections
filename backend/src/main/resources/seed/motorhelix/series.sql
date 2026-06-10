-- MOTORHELIX series (brand_id=12). 12 series; id range 12001-12012 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(12001, 12, 'Accessory'),
(12002, 12, 'Alfa Romeo'),
(12003, 12, 'Audi'),
(12004, 12, 'Honda'),
(12005, 12, 'Land Rover'),
(12006, 12, 'Maserati'),
(12007, 12, 'Mercedes-Benz'),
(12008, 12, 'Mitsubishi'),
(12009, 12, 'Nilu'),
(12010, 12, 'Nissan'),
(12011, 12, 'RAUH-Welt'),
(12012, 12, 'Subaru');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
