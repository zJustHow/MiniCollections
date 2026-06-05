-- Matchbox series (brand_id=45). 23 series; id range 45001-45023 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(45001, 45, '5 Packs', '5 包'),
(45002, 45, 'American Convertibles Series', '美国敞篷车系列'),
(45003, 45, 'Best Of Matchbox', '最好的火柴盒'),
(45004, 45, 'Best of France', '法国精选'),
(45005, 45, 'Best of Germany', '德国精选'),
(45006, 45, 'Best of Italy', '意大利最佳'),
(45007, 45, 'Best of UK', '英国最佳'),
(45008, 45, 'Cadillac', '凯迪拉克'),
(45009, 45, 'Candy Series', '糖果系列'),
(45010, 45, 'Collectors Series', '收藏系列'),
(45011, 45, 'Convoys', '车队'),
(45012, 45, 'European Streets', '欧洲街道'),
(45013, 45, 'Ford Mustang Series', '福特野马系列'),
(45014, 45, 'Global Series', '全球系列'),
(45015, 45, 'Globe Travellers', '环球旅行者'),
(45016, 45, 'Hitch & Haul', '挂接和牵引'),
(45017, 45, 'Jeep (75th Anniversary)', '吉普车（75 周年）'),
(45018, 45, 'Land Rover', '路虎'),
(45019, 45, 'Mainlines', '主线'),
(45020, 45, 'Moving Parts', '移动部件'),
(45021, 45, 'Superfast', '超快'),
(45022, 45, 'Truck Series', '卡车系列'),
(45023, 45, 'Working Rigs', '工作钻机');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
