-- Matchbox series (brand_id=18). 23 series; id range 18001-18023 (brand_id * 1000 + ordinal).
INSERT INTO series (id, brand_id, name_en, name_zh) VALUES
(18001, 18, '5 Packs', '5 包'),
(18002, 18, 'American Convertibles Series', '美国敞篷车系列'),
(18003, 18, 'Best Of Matchbox', '最好的火柴盒'),
(18004, 18, 'Best of France', '法国精选'),
(18005, 18, 'Best of Germany', '德国精选'),
(18006, 18, 'Best of Italy', '意大利最佳'),
(18007, 18, 'Best of UK', '英国最佳'),
(18008, 18, 'Cadillac', '凯迪拉克'),
(18009, 18, 'Candy Series', '糖果系列'),
(18010, 18, 'Collectors Series', '收藏系列'),
(18011, 18, 'Convoys', '车队'),
(18012, 18, 'European Streets', '欧洲街道'),
(18013, 18, 'Ford Mustang Series', '福特野马系列'),
(18014, 18, 'Global Series', '全球系列'),
(18015, 18, 'Globe Travellers', '环球旅行者'),
(18016, 18, 'Hitch & Haul', '挂接和牵引'),
(18017, 18, 'Jeep (75th Anniversary)', '吉普车（75 周年）'),
(18018, 18, 'Land Rover', '路虎'),
(18019, 18, 'Mainlines', '主线'),
(18020, 18, 'Moving Parts', '移动部件'),
(18021, 18, 'Superfast', '超快'),
(18022, 18, 'Truck Series', '卡车系列'),
(18023, 18, 'Working Rigs', '工作钻机');

SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
