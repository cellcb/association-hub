-- Create project category table
CREATE TABLE cms_project_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    description TEXT,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add comment
COMMENT ON TABLE cms_project_category IS 'Project category dictionary';

-- Insert seed data from existing enum values
INSERT INTO cms_project_category (name, code, sort_order) VALUES
('智能建筑', 'smart_building', 1),
('绿色建筑', 'green_building', 2),
('BIM应用', 'bim_application', 3),
('装配式建筑', 'prefabricated', 4),
('既有建筑改造', 'renovation', 5);

-- Add category_id column to cms_project
ALTER TABLE cms_project ADD COLUMN category_id BIGINT;

-- Migrate existing data: map old category enum to new category_id
UPDATE cms_project SET category_id = (
    SELECT id FROM cms_project_category WHERE code = LOWER(cms_project.category)
);

-- Create index
CREATE INDEX idx_cms_project_category_id ON cms_project(category_id);
CREATE INDEX idx_cms_project_category_status ON cms_project_category(status);
