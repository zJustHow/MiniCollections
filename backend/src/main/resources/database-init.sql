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
    id               SERIAL PRIMARY KEY NOT NULL,
    display_name     VARCHAR(255)       NOT NULL,
    password         VARCHAR(255),
    enabled          BOOLEAN            NOT NULL DEFAULT TRUE,
    preferred_locale VARCHAR(16)        NOT NULL DEFAULT 'en-US',
    avatar_url       TEXT
);

CREATE TABLE user_identifiers
(
    id         SERIAL PRIMARY KEY NOT NULL,
    user_id    INTEGER            NOT NULL,
    type       VARCHAR(32)        NOT NULL,
    identifier VARCHAR(255)       NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_type_identifier UNIQUE (type, identifier)
);

CREATE TABLE groups
(
    id SERIAL PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE brands
(
    id SERIAL PRIMARY KEY NOT NULL,
    name_en VARCHAR(512) NOT NULL,
    name_zh VARCHAR(512),
    image_url TEXT
);

CREATE TABLE brand_objects
(
    id SERIAL PRIMARY KEY NOT NULL,
    brand_id INTEGER,
    name_en VARCHAR(1024) NOT NULL,
    name_zh VARCHAR(1024),
    image_url TEXT,
    release_price_cny DECIMAL(10, 2),
    release_price_usd DECIMAL(10, 2),
    release_date DATE,
    category_en VARCHAR(255),
    category_zh VARCHAR(255),
    scale VARCHAR(64),
    CONSTRAINT fk_brand FOREIGN KEY (brand_id) REFERENCES brands (id)
);

CREATE TABLE user_objects
(
    id SERIAL PRIMARY KEY NOT NULL,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    brand_object_id INTEGER,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    purchase_date DATE,
    purchase_price DECIMAL(10, 2),
    other_notes TEXT,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_group FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE,
    CONSTRAINT fk_brand_object FOREIGN KEY (brand_object_id) REFERENCES brand_objects (id)
);

CREATE TABLE authorities
(
    user_id   INTEGER      NOT NULL,
    authority VARCHAR(255) NOT NULL,
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

-- MINI GT brand and products (images stored under backend/src/main/resources/static/images/minigt/)
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (1, 'MINI GT', NULL, '/images/minigt/logo.svg');

-- MINI GT brand_objects: 1056 products loaded from minigt-brand-objects.sql

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Ensure brand logo uses local SVG (fixes existing DBs that had logo.png)
UPDATE brands SET image_url = '/images/minigt/logo.svg' WHERE id = 1;

-- LCD brand (1:64). brand_objects: 95 products in lcd-brand-objects.sql
INSERT INTO brands (id, name_en, name_zh, image_url) VALUES (2, 'LCD', NULL, '/images/lcd/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));
