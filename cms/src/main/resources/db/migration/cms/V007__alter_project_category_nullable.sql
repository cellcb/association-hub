-- Make category column nullable since we now use category_id
ALTER TABLE cms_project ALTER COLUMN category DROP NOT NULL;
