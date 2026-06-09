-- Run on RDS after importing seed data that still uses localhost MinIO URLs.
-- Replace host/prefix with your S3 public base URL (no trailing slash).

UPDATE brands
SET image_url = REPLACE(
  image_url,
  'http://localhost:9000/minicollections-media',
  'https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com'
)
WHERE image_url LIKE 'http://localhost:9000/minicollections-media%';

UPDATE brand_objects
SET image_url = REPLACE(
  image_url,
  'http://localhost:9000/minicollections-media',
  'https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com'
)
WHERE image_url LIKE 'http://localhost:9000/minicollections-media%';

UPDATE user_objects
SET image_url = REPLACE(
  image_url,
  'http://localhost:9000/minicollections-media',
  'https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com'
)
WHERE image_url LIKE 'http://localhost:9000/minicollections-media%';

UPDATE groups
SET image_url = REPLACE(
  image_url,
  'http://localhost:9000/minicollections-media',
  'https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com'
)
WHERE image_url IS NOT NULL
  AND image_url LIKE 'http://localhost:9000/minicollections-media%';

UPDATE users
SET avatar_url = REPLACE(
  avatar_url,
  'http://localhost:9000/minicollections-media',
  'https://minicollections-media-717373613148.s3.us-west-2.amazonaws.com'
)
WHERE avatar_url IS NOT NULL
  AND avatar_url LIKE 'http://localhost:9000/minicollections-media%';
