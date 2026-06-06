-- MOTORHELIX series (brand_id=12). 12 series; id range 12001-12012 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(12001, 12, 'Accessory', '配件'),
(12002, 12, 'Alfa Romeo', '阿尔法·罗密欧'),
(12003, 12, 'Audi', '奥迪'),
(12004, 12, 'Honda', '本田'),
(12005, 12, 'Land Rover', '路虎'),
(12006, 12, 'Maserati', '玛莎拉蒂'),
(12007, 12, 'Mercedes-Benz', '梅赛德斯-奔驰'),
(12008, 12, 'Mitsubishi', '三菱'),
(12009, 12, 'Nilu', 'Nilu'),
(12010, 12, 'Nissan', '日产'),
(12011, 12, 'RAUH-Welt', 'RAUH-Welt'),
(12012, 12, 'Subaru', '斯巴鲁');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
