-- Alter cover_image column to TEXT for Base64 image storage
ALTER TABLE cms_news ALTER COLUMN cover_image TYPE TEXT;
