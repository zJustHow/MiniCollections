DROP TABLE IF EXISTS object_submissions;
DROP TABLE IF EXISTS authorities;
DROP TABLE IF EXISTS user_objects;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS user_identifiers;
DROP TABLE IF EXISTS brand_objects;
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

CREATE TABLE brand_objects
(
    id                  SERIAL PRIMARY KEY  NOT NULL,
    brand_id            INTEGER,
    name_en             VARCHAR(1024)       NOT NULL,
    name_zh             VARCHAR(1024),
    image_url           TEXT,
    image_source        TEXT,
    release_price_cny   DECIMAL(10, 2),
    release_price_usd   DECIMAL(10, 2),
    release_date        DATE,
    category_en         VARCHAR(255),
    category_zh         VARCHAR(255),
    scale               VARCHAR(64),
    CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES brands (id)
);

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
    CONSTRAINT fk_brand_object FOREIGN KEY (brand_object_id) REFERENCES brand_objects (id)
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
    brand_id             INTEGER,
    custom_brand_name    VARCHAR(512),
    name_en              VARCHAR(1024),
    name_zh              VARCHAR(1024),
    image_url            TEXT,
    release_price_cny    DECIMAL(10, 2),
    release_price_usd    DECIMAL(10, 2),
    release_date         DATE,
    category_en          VARCHAR(255),
    category_zh          VARCHAR(255),
    scale                VARCHAR(64),
    notes                TEXT,
    status               VARCHAR(32)         NOT NULL DEFAULT 'PENDING',
    submitted_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    reviewed_by_user_id  INTEGER,
    reviewed_at          TIMESTAMPTZ,
    reject_reason        TEXT,
    admin_note           TEXT,
    CONSTRAINT fk_submitter FOREIGN KEY (submitted_by_user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviewer FOREIGN KEY (reviewed_by_user_id) REFERENCES users (id),
    CONSTRAINT fk_submission_brand FOREIGN KEY (brand_id) REFERENCES brands (id)
);

-- MINI GT (MGT): 1056 products in minigt-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (1, 'MINI GT (MGT)', NULL, 'http://localhost:9000/minicollections-media/brands/minigt/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- LCD: 137 products in lcd-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (2, 'LCD', NULL, 'http://localhost:9000/minicollections-media/brands/lcd/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- AutoArt (AA): 290 products in autoart-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (3, 'AutoArt (AA)', NULL, 'http://localhost:9000/minicollections-media/brands/autoart/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Tomica Limited Vintage (TLV): 1081 products in tomica-limited-vintage-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (4, 'Tomica Limited Vintage (TLV)', NULL, 'http://localhost:9000/minicollections-media/brands/tomica-limited-vintage/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Kyosho: 1484 products in kyosho-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (5, 'Kyosho', NULL, 'http://localhost:9000/minicollections-media/brands/kyosho/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Minichamps: 2014 products in minichamps-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (6, 'Minichamps', NULL, 'http://localhost:9000/minicollections-media/brands/minichamps/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- XCarToys: 711 products in xcartoys-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (7, 'XCarToys', '拓意', 'http://localhost:9000/minicollections-media/brands/xcartoys/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Inno Models: 559 products in inno-models-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (8, 'Inno Models', NULL, 'http://localhost:9000/minicollections-media/brands/inno-models/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Ignition Model (IG): 2789 products in ignition-model-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (9, 'Ignition Model (IG)', NULL, 'http://localhost:9000/minicollections-media/brands/ignition-model/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- IG other-brand lineup (ig-model.com/?c=otherbrand)

-- KENGFai: 34 products in kengfai-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (10, 'KENGFai', NULL, 'http://localhost:9000/minicollections-media/brands/kengfai/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- KJ Miniatures: 4 products in kj-miniatures-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (11, 'KJ Miniatures', NULL, 'http://localhost:9000/minicollections-media/brands/kj-miniatures/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- MOTORHELIX: 30 products in motorhelix-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (12, 'MOTORHELIX', NULL, 'http://localhost:9000/minicollections-media/brands/motorhelix/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- TARMAC WORKS (TW): 473 products in tarmac-works-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (13, 'TARMAC WORKS (TW)', NULL, 'http://localhost:9000/minicollections-media/brands/tarmac-works/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- MODELCOLLECT: 16 products in modelcollect-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (14, 'MODELCOLLECT', NULL, 'http://localhost:9000/minicollections-media/brands/modelcollect/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- PRIVATE GOODS MODEL (PGM): 69 products in private-goods-model-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (15, 'PRIVATE GOODS MODEL (PGM)', NULL, 'http://localhost:9000/minicollections-media/brands/private-goods-model/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- WERK83: 4 products in werk83-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (16, 'WERK83', NULL, 'http://localhost:9000/minicollections-media/brands/werk83/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- KILOworks: 11 products in kiloworks-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (17, 'KILOworks', NULL, 'http://localhost:9000/minicollections-media/brands/kiloworks/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- TOPART COLLECTION: 1 products in topart-collection-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (18, 'TOPART COLLECTION', NULL, 'http://localhost:9000/minicollections-media/brands/topart-collection/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- AUTO WORLD: 1 products in autoworld-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (19, 'AUTO WORLD', NULL, 'http://localhost:9000/minicollections-media/brands/autoworld/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- POLAR MASTER: 3 products in polar-master-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (20, 'POLAR MASTER', NULL, 'http://localhost:9000/minicollections-media/brands/polar-master/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- FIGART MODEL: 1 products in figart-model-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (21, 'FIGART MODEL', NULL, 'http://localhost:9000/minicollections-media/brands/figart-model/logo.gif');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- FrontiArt (FA): 261 products in frontiart-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (22, 'FrontiArt (FA)', NULL, 'http://localhost:9000/minicollections-media/brands/frontiart/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Looksmart: 1925 products in looksmart-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (23, 'Looksmart', NULL, 'http://localhost:9000/minicollections-media/brands/looksmart/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Norev: 3362 products in norev-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (24, 'Norev', '诺威尔', 'http://localhost:9000/minicollections-media/brands/norev/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Spark (incl. Sparky lineup): 10264 products in spark-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (25, 'Spark', NULL, 'http://localhost:9000/minicollections-media/brands/spark/logo.ico');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- IXO MODELS: 3485 products in ixo-models-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (26, 'IXO MODELS', NULL, 'http://localhost:9000/minicollections-media/brands/ixo-models/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- TSM Model: 436 products in tsm-model-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (27, 'TSM Model', NULL, 'http://localhost:9000/minicollections-media/brands/tsm-model/logo.ico');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Exoto: 635 products in exoto-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (28, 'Exoto', '依珂索托', 'http://localhost:9000/minicollections-media/brands/exoto/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Amalgam: 729 products in amalgam-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (29, 'Amalgam', NULL, 'http://localhost:9000/minicollections-media/brands/amalgam/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- CMC: 157 products in cmc-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (30, 'CMC', '西姆斯', 'http://localhost:9000/minicollections-media/brands/cmc/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- BBR MODELS: 914 products in bbr-models-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (31, 'BBR MODELS', NULL, 'http://localhost:9000/minicollections-media/brands/bbr-models/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Bburago: 154 products in bburago-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (32, 'Bburago', NULL, 'http://localhost:9000/minicollections-media/brands/bburago/logo.svg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Hot Wheels: 239 products in hot-wheels-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (33, 'Hot Wheels', NULL, 'http://localhost:9000/minicollections-media/brands/hot-wheels/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Welly: 1295 products in welly-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (34, 'Welly', NULL, 'http://localhost:9000/minicollections-media/brands/welly/logo.jpg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Make Up: 536 products in make-up-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (35, 'Make Up', NULL, 'http://localhost:9000/minicollections-media/brands/make-up/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- GreenLight: 66 products in greenlight-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (36, 'GreenLight', NULL, 'http://localhost:9000/minicollections-media/brands/greenlight/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- MR Collection: 1610 products in mr-collection-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (37, 'MR Collection', NULL, 'http://localhost:9000/minicollections-media/brands/mr-collection/logo.jpg');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
