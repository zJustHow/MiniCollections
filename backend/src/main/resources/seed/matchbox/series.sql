-- Matchbox series (brand_id=18). 23 series; id range 18001-18023 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en) VALUES
(18001, 18, '5 Packs'),
(18002, 18, 'American Convertibles Series'),
(18003, 18, 'Best Of Matchbox'),
(18004, 18, 'Best of France'),
(18005, 18, 'Best of Germany'),
(18006, 18, 'Best of Italy'),
(18007, 18, 'Best of UK'),
(18008, 18, 'Cadillac'),
(18009, 18, 'Candy Series'),
(18010, 18, 'Collectors Series'),
(18011, 18, 'Convoys'),
(18012, 18, 'European Streets'),
(18013, 18, 'Ford Mustang Series'),
(18014, 18, 'Global Series'),
(18015, 18, 'Globe Travellers'),
(18016, 18, 'Hitch & Haul'),
(18017, 18, 'Jeep (75th Anniversary)'),
(18018, 18, 'Land Rover'),
(18019, 18, 'Mainlines'),
(18020, 18, 'Moving Parts'),
(18021, 18, 'Superfast'),
(18022, 18, 'Truck Series'),
(18023, 18, 'Working Rigs');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
