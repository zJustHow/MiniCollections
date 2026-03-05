DROP TABLE IF EXISTS authorities;
DROP TABLE IF EXISTS user_objects;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS brand_objects;
DROP TABLE IF EXISTS brands;
DROP TABLE IF EXISTS users;


CREATE TABLE users
(
    id SERIAL PRIMARY KEY NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    name VARCHAR(255)
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
    name VARCHAR(255) NOT NULL,
    image_url TEXT
);

CREATE TABLE brand_objects
(
    id SERIAL PRIMARY KEY NOT NULL,
    brand_id INTEGER,
    name VARCHAR(255) NOT NULL,
    image_url TEXT,
    release_price DECIMAL(10, 2),
    release_date DATE,
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
    email     VARCHAR(255)       NOT NULL,
    authority VARCHAR(255)       NOT NULL,
    CONSTRAINT authorities_pk PRIMARY KEY (email, authority),
    CONSTRAINT fk_customer FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE
);

-- MINI GT brand and products (images stored under backend/src/main/resources/static/images/minigt/)
INSERT INTO brands (id, name, image_url) VALUES (1, 'MINI GT', '/images/minigt/logo.svg');

-- MINI GT brand_objects: 1056 products loaded from minigt-brand-objects.sql

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));

-- Ensure brand logo uses local SVG (fixes existing DBs that had logo.png)
UPDATE brands SET image_url = '/images/minigt/logo.svg' WHERE id = 1;

-- LCD brand (1:64). brand_objects: 95 products in lcd-brand-objects.sql
INSERT INTO brands (id, name, image_url) VALUES (2, 'LCD', '/images/lcd/logo.png');

SELECT setval(pg_get_serial_sequence('brands', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brands));
SELECT setval(pg_get_serial_sequence('brand_objects', 'id'), (SELECT COALESCE(MAX(id), 1) FROM brand_objects));