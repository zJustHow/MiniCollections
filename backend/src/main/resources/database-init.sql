DROP TABLE IF EXISTS object_submissions;
DROP TABLE IF EXISTS authorities;
DROP TABLE IF EXISTS user_objects;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS user_identifiers;
DROP TABLE IF EXISTS brand_objects;
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS scales;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS users;


CREATE TABLE users
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    display_name        VARCHAR(255)        NOT NULL,
    password            VARCHAR(255),
    enabled             BOOLEAN             NOT NULL DEFAULT TRUE,
    preferred_locale    VARCHAR(16)         NOT NULL DEFAULT 'en-US',
    avatar_url          TEXT
);

CREATE TABLE user_identifiers
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    user_id             INTEGER             NOT NULL,
    type                VARCHAR(32)         NOT NULL,
    identifier          VARCHAR(255)        NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_type_identifier UNIQUE (type, identifier)
);

CREATE TABLE groups
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    user_id             INTEGER             NOT NULL,
    name                VARCHAR(255)        NOT NULL,
    image_url           TEXT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE brands
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    name_en             VARCHAR(512)        NOT NULL,
    name_zh             VARCHAR(512),
    image_url           TEXT
);

CREATE TABLE series
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    brand_id            INTEGER             NOT NULL,
    name_en             VARCHAR(255)        NOT NULL,
    name_zh             VARCHAR(255),
    CONSTRAINT fk_series_brand FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE,
    CONSTRAINT uq_series_brand_name_en UNIQUE (brand_id, name_en)
);

CREATE TABLE categories
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    slug                VARCHAR(64)         NOT NULL,
    name_en             VARCHAR(255)        NOT NULL,
    name_zh             VARCHAR(255),
    sort_order          INTEGER             NOT NULL DEFAULT 0,
    CONSTRAINT uq_categories_slug UNIQUE (slug)
);

-- Category semantics (seed/import should follow):
--   accessory (7) – micro props for realistic dioramas (lifts, garage tools, gas pumps, trailers, etc.)
--   other (10)    – display cases/covers, stands/pedestals, and standalone micro pieces (helmets, steering wheels, nosecones, art prints, etc.)
--   diorama (8)   – scene sets / dioramas
--   figure (11)   – figurines
--   book (9)      – catalogues, yearbooks, CD-ROMs, etc.
--   boat (14)     – boats, ships, watercraft
INSERT INTO categories (id, slug, name_en, name_zh, sort_order) VALUES
(1,  'car',                  'Car',                  '汽车',     1),
(4,  'motorbike',            'Motorbike',            '摩托车',   2),
(12, 'construction-vehicle', 'Construction Vehicle', '工程车辆', 3),
(2,  'truck',                'Truck',                '卡车',     4),
(3,  'bus',                  'Bus',                  '巴士',     5),
(6,  'tractor',              'Tractor',              '拖拉机',   6),
(13, 'train',                'Train',                '火车',     7),
(5,  'aircraft',             'Aircraft',             '飞机',     8),
(14, 'boat',                 'Boat',                 '船',       9),
(8,  'diorama',              'Diorama',              '场景',     10),
(11, 'figure',               'Figure',               '人仔',     11),
(7,  'accessory',            'Accessory',            '配件',     12),   -- diorama-scale props
(9,  'book',                 'Book',                 '书籍',     13),
(10, 'other',                'Other',                '其他',     14);  -- cases, stands, standalone display pieces

SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT COALESCE(MAX(id), 1) FROM categories));

CREATE TABLE scales
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    code                VARCHAR(16)         NOT NULL,
    denominator         INTEGER             NOT NULL,
    CONSTRAINT uq_scales_code UNIQUE (code)
);

-- id matches denominator (scale ratio) for stable FK references in seeds and APIs
INSERT INTO scales (id, code, denominator) VALUES
(1, '1:1', 1),
(2, '1:2', 2),
(4, '1:4', 4),
(5, '1:5', 5),
(6, '1:6', 6),
(8, '1:8', 8),
(10, '1:10', 10),
(12, '1:12', 12),
(14, '1:14', 14),
(15, '1:15', 15),
(16, '1:16', 16),
(17, '1:17', 17),
(18, '1:18', 18),
(20, '1:20', 20),
(21, '1:21', 21),
(24, '1:24', 24),
(25, '1:25', 25),
(26, '1:26', 26),
(27, '1:27', 27),
(28, '1:28', 28),
(31, '1:31', 31),
(32, '1:32', 32),
(34, '1:34', 34),
(35, '1:35', 35),
(36, '1:36', 36),
(38, '1:38', 38),
(39, '1:39', 39),
(40, '1:40', 40),
(41, '1:41', 41),
(42, '1:42', 42),
(43, '1:43', 43),
(44, '1:44', 44),
(46, '1:46', 46),
(48, '1:48', 48),
(50, '1:50', 50),
(54, '1:54', 54),
(55, '1:55', 55),
(57, '1:57', 57),
(58, '1:58', 58),
(60, '1:60', 60),
(64, '1:64', 64),
(66, '1:66', 66),
(67, '1:67', 67),
(68, '1:68', 68),
(70, '1:70', 70),
(72, '1:72', 72),
(75, '1:75', 75),
(76, '1:76', 76),
(80, '1:80', 80),
(86, '1:86', 86),
(87, '1:87', 87),
(90, '1:90', 90),
(96, '1:96', 96),
(100, '1:100', 100),
(102, '1:102', 102),
(110, '1:110', 110),
(120, '1:120', 120),
(140, '1:140', 140),
(144, '1:144', 144),
(148, '1:148', 148),
(150, '1:150', 150),
(160, '1:160', 160),
(200, '1:200', 200),
(220, '1:220', 220),
(240, '1:240', 240),
(260, '1:260', 260),
(375, '1:375', 375),
(400, '1:400', 400),
(700, '1:700', 700),
(2000, '1:2000', 2000),
(4000, '1:4000', 4000);

SELECT setval(pg_get_serial_sequence('scales', 'id'), (SELECT COALESCE(MAX(id), 1) FROM scales));

CREATE TABLE brand_objects
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    name_en             VARCHAR(1024)       NOT NULL,
    name_zh             VARCHAR(1024),
    image_url           TEXT,
    image_source        TEXT,
    release_price_cny   DECIMAL(10, 2),
    release_price_usd   DECIMAL(10, 2),
    release_date        DATE,
    brand_id            INTEGER,
    series_id           INTEGER,
    category_id         INTEGER,
    scale_id            INTEGER,
    CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_series FOREIGN KEY (series_id) REFERENCES series (id) ON DELETE SET NULL,
    CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT fk_scale FOREIGN KEY (scale_id) REFERENCES scales (id) ON DELETE SET NULL
);

CREATE INDEX idx_brand_objects_series_id ON brand_objects (series_id);
CREATE INDEX idx_brand_objects_category_id ON brand_objects (category_id);
CREATE INDEX idx_brand_objects_scale_id ON brand_objects (scale_id);

CREATE TABLE user_objects
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    user_id             INTEGER             NOT NULL,
    group_id            INTEGER             NOT NULL,
    brand_object_id     INTEGER,
    name                VARCHAR(255)        NOT NULL,
    image_url           TEXT,
    purchase_date       DATE,
    purchase_price      DECIMAL(10, 2),
    other_notes         TEXT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_brand_object FOREIGN KEY (brand_object_id) REFERENCES brand_objects (id) ON DELETE SET NULL
);

CREATE TABLE authorities
(
    user_id             INTEGER             NOT NULL,
    authority           VARCHAR(255)        NOT NULL,
    CONSTRAINT authorities_pk PRIMARY KEY (user_id, authority),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE object_submissions
(
    id                   SERIAL PRIMARY KEY  NOT NULL,
    submitted_by_user_id INTEGER             NOT NULL,
    submission_type      VARCHAR(32)         NOT NULL DEFAULT 'MISSING_MODEL',
    name_en              VARCHAR(1024),
    name_zh              VARCHAR(1024),
    image_url            TEXT,
    release_price_cny    DECIMAL(10, 2),
    release_price_usd    DECIMAL(10, 2),
    release_date         DATE,
    brand_id             INTEGER,
    custom_brand_name    VARCHAR(512),
    series_id            INTEGER,
    category_id          INTEGER,
    scale_id             INTEGER,
    notes                TEXT,
    status               VARCHAR(32)         NOT NULL DEFAULT 'PENDING',
    submitted_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    reviewed_by_user_id  INTEGER,
    reviewed_at          TIMESTAMPTZ,
    reject_reason        TEXT,
    admin_note           TEXT,
    CONSTRAINT fk_submitter FOREIGN KEY (submitted_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviewer FOREIGN KEY (reviewed_by_user_id) REFERENCES users (id),
    CONSTRAINT fk_submission_brand FOREIGN KEY (brand_id) REFERENCES brands (id),
    CONSTRAINT fk_submission_series FOREIGN KEY (series_id) REFERENCES series (id) ON DELETE SET NULL,
    CONSTRAINT fk_submission_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT fk_submission_scale FOREIGN KEY (scale_id) REFERENCES scales (id) ON DELETE SET NULL
);

-- MINI GT (MGT): 1242 products in minigt/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (1, 'MINI GT (MGT)', NULL, 'http://localhost:9000/minicollections-media/brands/minigt/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- LCD: 137 products in lcd/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (2, 'LCD', NULL, 'http://localhost:9000/minicollections-media/brands/lcd/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- AutoArt (AA): 290 products in autoart/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (3, 'AutoArt (AA)', NULL, 'http://localhost:9000/minicollections-media/brands/autoart/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Tomica Limited Vintage (TLV): 1081 products in tomica-limited-vintage/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (4, 'Tomica Limited Vintage (TLV)', NULL, 'http://localhost:9000/minicollections-media/brands/tomica-limited-vintage/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Kyosho: 1484 products in kyosho/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (5, 'Kyosho', NULL, 'http://localhost:9000/minicollections-media/brands/kyosho/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Minichamps: 4107 products in minichamps/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (6, 'Minichamps', NULL, 'http://localhost:9000/minicollections-media/brands/minichamps/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- XCarToys: 711 products in xcartoys/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (7, 'XCarToys', '拓意', 'http://localhost:9000/minicollections-media/brands/xcartoys/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Inno Models: 559 products in inno-models/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (8, 'Inno Models', NULL, 'http://localhost:9000/minicollections-media/brands/inno-models/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Ignition Model (IG): 2789 products in ignition-model/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (9, 'Ignition Model (IG)', NULL, 'http://localhost:9000/minicollections-media/brands/ignition-model/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Hot Wheels: 239 products in hot-wheels/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (10, 'Hot Wheels', NULL, 'http://localhost:9000/minicollections-media/brands/hot-wheels/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- BBR MODELS: 914 products in bbr-models/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (11, 'BBR MODELS', NULL, 'http://localhost:9000/minicollections-media/brands/bbr-models/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- MOTORHELIX: 151 products in motorhelix/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (12, 'MOTORHELIX', NULL, 'http://localhost:9000/minicollections-media/brands/motorhelix/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- TARMAC WORKS (TW): 473 products in tarmac-works/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (13, 'TARMAC WORKS (TW)', NULL, 'http://localhost:9000/minicollections-media/brands/tarmac-works/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Time Micro (TM): 153 products in time-micro/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (14, 'Time Micro (TM)', NULL, 'http://localhost:9000/minicollections-media/brands/time-micro/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- PRIVATE GOODS MODEL (PGM): 87 products in private-goods-model/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (15, 'PRIVATE GOODS MODEL (PGM)', NULL, 'http://localhost:9000/minicollections-media/brands/private-goods-model/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Pop Race: 15 products in pop-race/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (16, 'Pop Race', NULL, 'http://localhost:9000/minicollections-media/brands/pop-race/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Tiny: 1274 products in tiny/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (17, 'Tiny', '微影', 'http://localhost:9000/minicollections-media/brands/tiny/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Matchbox: 1125 products in matchbox/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (18, 'Matchbox', '火柴盒', 'http://localhost:9000/minicollections-media/brands/matchbox/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- AUTO WORLD: 487 products in autoworld/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (19, 'AUTO WORLD', NULL, 'http://localhost:9000/minicollections-media/brands/autoworld/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Almost Real (AR): 315 products in almost-real/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (20, 'Almost Real (AR)', NULL, 'http://localhost:9000/minicollections-media/brands/almost-real/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Tomica: 313 products in tomica/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (21, 'Tomica', '多美卡', 'http://localhost:9000/minicollections-media/brands/tomica/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- FrontiArt (FA): 261 products in frontiart/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (22, 'FrontiArt (FA)', NULL, 'http://localhost:9000/minicollections-media/brands/frontiart/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Looksmart: 1925 products in looksmart/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (23, 'Looksmart', NULL, 'http://localhost:9000/minicollections-media/brands/looksmart/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Norev: 3362 products in norev/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (24, 'Norev', '诺威尔', 'http://localhost:9000/minicollections-media/brands/norev/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Spark (incl. Sparky lineup): 10264 products in spark/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (25, 'Spark', NULL, 'http://localhost:9000/minicollections-media/brands/spark/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- IXO MODELS: 3485 products in ixo-models/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (26, 'IXO MODELS', NULL, 'http://localhost:9000/minicollections-media/brands/ixo-models/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- TSM Model: 436 products in tsm-model/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (27, 'TSM Model', NULL, 'http://localhost:9000/minicollections-media/brands/tsm-model/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Exoto: 635 products in exoto/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (28, 'Exoto', '依珂索托', 'http://localhost:9000/minicollections-media/brands/exoto/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Amalgam: 729 products in amalgam/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (29, 'Amalgam', NULL, 'http://localhost:9000/minicollections-media/brands/amalgam/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- CMC: 157 products in cmc/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (30, 'CMC', '西姆斯', 'http://localhost:9000/minicollections-media/brands/cmc/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Micro Turbo (MT): 50 products in micro-turbo/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (31, 'Micro Turbo (MT)', NULL, 'http://localhost:9000/minicollections-media/brands/micro-turbo/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Bburago: 154 products in bburago/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (32, 'Bburago', NULL, 'http://localhost:9000/minicollections-media/brands/bburago/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- KENGFai: 34 products in kengfai/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (33, 'KENGFai', NULL, 'http://localhost:9000/minicollections-media/brands/kengfai/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- GCD: 90 products in gcd/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (34, 'GCD', NULL, 'http://localhost:9000/minicollections-media/brands/gcd/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Make Up: 536 products in make-up/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (35, 'Make Up', NULL, 'http://localhost:9000/minicollections-media/brands/make-up/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- GreenLight: 3521 products in greenlight/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (36, 'GreenLight', NULL, 'http://localhost:9000/minicollections-media/brands/greenlight/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- MR Collection: 1610 products in mr-collection/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (37, 'MR Collection', NULL, 'http://localhost:9000/minicollections-media/brands/mr-collection/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- TopSpeed Model: 362 products in topspeed-model/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (38, 'TopSpeed Model', NULL, 'http://localhost:9000/minicollections-media/brands/topspeed-model/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Hobby Japan: 747 products in hobby-japan/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (39, 'Hobby Japan', NULL, 'http://localhost:9000/minicollections-media/brands/hobby-japan/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- TOPART COLLECTION: 1 products in topart-collection/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (40, 'TOPART COLLECTION', NULL, 'http://localhost:9000/minicollections-media/brands/topart-collection/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- KJ Miniatures: 4 products in kj-miniatures/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (41, 'KJ Miniatures', NULL, 'http://localhost:9000/minicollections-media/brands/kj-miniatures/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- FIGART MODEL: 1 products in figart-model/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (44, 'FIGART MODEL', NULL, 'http://localhost:9000/minicollections-media/brands/figart-model/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- BMC: 195 products in bmc/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (43, 'BMC', NULL, 'http://localhost:9000/minicollections-media/brands/bmc/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Welly: 1295 products in welly/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (45, 'Welly', NULL, 'http://localhost:9000/minicollections-media/brands/welly/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Rhino Models: 37 products in rhino-models/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (42, 'Rhino Models', NULL, 'http://localhost:9000/minicollections-media/brands/rhino-models/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- Maisto: 5469 products in maisto/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (46, 'Maisto', '美驰图', 'http://localhost:9000/minicollections-media/brands/maisto/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- POLAR MASTER: 3 products in polar-master/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (47, 'POLAR MASTER', NULL, 'http://localhost:9000/minicollections-media/brands/polar-master/logo.gif');
SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- MODELCOLLECT: 16 products in modelcollect/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (48, 'MODELCOLLECT', NULL, 'http://localhost:9000/minicollections-media/brands/modelcollect/logo.png');
SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- KILOworks: 11 products in kiloworks/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (49, 'KILOworks', NULL, 'http://localhost:9000/minicollections-media/brands/kiloworks/logo.png');
SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));

-- WERK83: 4 products in werk83/brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (50, 'WERK83', NULL, 'http://localhost:9000/minicollections-media/brands/werk83/logo.svg');
SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
SELECT setval(pg_get_serial_sequence('series', 'id'), (SELECT COALESCE(MAX(id), 1) FROM series));
