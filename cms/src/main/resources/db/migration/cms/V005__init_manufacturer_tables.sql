-- Manufacturer category table
CREATE TABLE mfr_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    parent_id BIGINT REFERENCES mfr_category(id),
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    description TEXT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- Manufacturer table
CREATE TABLE mfr_manufacturer (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id BIGINT REFERENCES mfr_category(id),
    logo TEXT,
    summary TEXT,
    description TEXT,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(100),
    contact_person VARCHAR(100),
    address VARCHAR(500),
    website VARCHAR(255),
    established_date DATE,
    registered_capital VARCHAR(100),
    employee_scale VARCHAR(50),
    main_business TEXT,
    qualifications TEXT,
    honors TEXT,
    cases TEXT,
    images TEXT,
    status INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    views BIGINT DEFAULT 0,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- Indexes
CREATE INDEX idx_mfr_category ON mfr_manufacturer(category_id);
CREATE INDEX idx_mfr_status ON mfr_manufacturer(status);
CREATE INDEX idx_mfr_featured ON mfr_manufacturer(featured);
CREATE INDEX idx_mfr_cat_parent ON mfr_category(parent_id);
CREATE INDEX idx_mfr_cat_status ON mfr_category(status);

-- Seed manufacturer categories
INSERT INTO mfr_category (name, code, sort_order, status) VALUES
('水处理设备', 'WATER_TREATMENT', 1, 1),
('管道器材', 'PIPE_FITTINGS', 2, 1),
('泵类设备', 'PUMP_EQUIPMENT', 3, 1),
('阀门配件', 'VALVE_PARTS', 4, 1),
('检测仪器', 'TESTING_INSTRUMENTS', 5, 1),
('智能设备', 'SMART_DEVICES', 6, 1),
('综合服务', 'COMPREHENSIVE', 7, 1);
