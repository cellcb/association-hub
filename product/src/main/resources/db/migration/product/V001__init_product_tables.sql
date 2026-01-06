-- Product category table
CREATE TABLE prd_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    parent_id BIGINT REFERENCES prd_category(id),
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    description TEXT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- Product table
CREATE TABLE prd_product (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id BIGINT REFERENCES prd_category(id),
    manufacturer VARCHAR(255),
    description TEXT,
    features TEXT,
    application TEXT,
    certifications TEXT,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    images TEXT,
    specifications TEXT,
    status INTEGER DEFAULT 0,
    views BIGINT DEFAULT 0,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- Indexes
CREATE INDEX idx_product_category ON prd_product(category_id);
CREATE INDEX idx_product_status ON prd_product(status);
CREATE INDEX idx_product_manufacturer ON prd_product(manufacturer);
CREATE INDEX idx_category_parent ON prd_category(parent_id);
CREATE INDEX idx_category_status ON prd_category(status);

-- Seed product categories
INSERT INTO prd_category (name, code, sort_order, status) VALUES
('水处理设备', 'WATER_TREATMENT', 1, 1),
('管道器材', 'PIPE_FITTINGS', 2, 1),
('泵类设备', 'PUMP_EQUIPMENT', 3, 1),
('阀门配件', 'VALVE_PARTS', 4, 1),
('检测仪器', 'TESTING_INSTRUMENTS', 5, 1),
('智能设备', 'SMART_DEVICES', 6, 1),
('其他产品', 'OTHER', 7, 1);
