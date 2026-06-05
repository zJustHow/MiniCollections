-- Matchbox series (brand_id=45). 23 series; id range 45001-45023 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(45001, 45, '5 Packs', NULL),
(45002, 45, 'American Convertibles Series', NULL),
(45003, 45, 'Best Of Matchbox', NULL),
(45004, 45, 'Best of France', NULL),
(45005, 45, 'Best of Germany', NULL),
(45006, 45, 'Best of Italy', NULL),
(45007, 45, 'Best of UK', NULL),
(45008, 45, 'Cadillac', NULL),
(45009, 45, 'Candy Series', NULL),
(45010, 45, 'Collectors Series', NULL),
(45011, 45, 'Convoys', NULL),
(45012, 45, 'European Streets', NULL),
(45013, 45, 'Ford Mustang Series', NULL),
(45014, 45, 'Global Series', NULL),
(45015, 45, 'Globe Travellers', NULL),
(45016, 45, 'Hitch & Haul', NULL),
(45017, 45, 'Jeep (75th Anniversary)', NULL),
(45018, 45, 'Land Rover', NULL),
(45019, 45, 'Mainlines', NULL),
(45020, 45, 'Moving Parts', NULL),
(45021, 45, 'Superfast', NULL),
(45022, 45, 'Truck Series', NULL),
(45023, 45, 'Working Rigs', NULL);

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
