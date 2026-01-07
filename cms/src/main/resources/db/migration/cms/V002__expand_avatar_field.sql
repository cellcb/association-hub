-- Expand avatar field to TEXT to support Base64 image storage
ALTER TABLE cms_expert ALTER COLUMN avatar TYPE TEXT;
