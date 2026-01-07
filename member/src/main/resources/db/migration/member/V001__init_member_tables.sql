-- Member module initialization
-- Tables: mbr_member, mbr_individual_member, mbr_organization_member

-- Member base table
CREATE TABLE mbr_member (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    member_no VARCHAR(50) NOT NULL UNIQUE,
    member_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at TIMESTAMP,
    expired_at TIMESTAMP,
    reject_reason VARCHAR(500),
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual member details table
CREATE TABLE mbr_individual_member (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    id_card VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(100),
    organization VARCHAR(200),
    position VARCHAR(100),
    title VARCHAR(100),
    expertise TEXT,
    province VARCHAR(50),
    city VARCHAR(50),
    address VARCHAR(300),
    education VARCHAR(50),
    experience VARCHAR(50),
    achievements TEXT,
    recommendation VARCHAR(500),
    avatar VARCHAR(500),
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_individual_member FOREIGN KEY (member_id) REFERENCES mbr_member(id) ON DELETE CASCADE
);

-- Organization member details table
CREATE TABLE mbr_organization_member (
    id BIGSERIAL PRIMARY KEY,
    member_id BIGINT NOT NULL UNIQUE,
    org_name VARCHAR(200) NOT NULL,
    org_type VARCHAR(20) NOT NULL,
    social_credit_code VARCHAR(30),
    legal_representative VARCHAR(50),
    contact_person VARCHAR(50),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    establishment_date DATE,
    registered_capital DECIMAL(18, 2),
    employee_count INTEGER,
    business_scope TEXT,
    qualifications TEXT,
    projects TEXT,
    province VARCHAR(50),
    city VARCHAR(50),
    address VARCHAR(300),
    website VARCHAR(200),
    introduction TEXT,
    logo VARCHAR(500),
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization_member FOREIGN KEY (member_id) REFERENCES mbr_member(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_mbr_member_user_id ON mbr_member(user_id);
CREATE INDEX idx_mbr_member_status ON mbr_member(status);
CREATE INDEX idx_mbr_member_type ON mbr_member(member_type);
CREATE INDEX idx_mbr_member_no ON mbr_member(member_no);

CREATE INDEX idx_mbr_individual_name ON mbr_individual_member(name);
CREATE INDEX idx_mbr_individual_organization ON mbr_individual_member(organization);

CREATE INDEX idx_mbr_organization_name ON mbr_organization_member(org_name);
CREATE INDEX idx_mbr_organization_type ON mbr_organization_member(org_type);

-- Foreign key to iam_user (will be validated at application level)
-- ALTER TABLE mbr_member ADD CONSTRAINT fk_member_user FOREIGN KEY (user_id) REFERENCES iam_user(id);

-- Comments
COMMENT ON TABLE mbr_member IS 'Member base information';
COMMENT ON TABLE mbr_individual_member IS 'Individual member details';
COMMENT ON TABLE mbr_organization_member IS 'Organization member details';

COMMENT ON COLUMN mbr_individual_member.expertise IS 'Professional expertise fields in JSON array format';
COMMENT ON COLUMN mbr_organization_member.qualifications IS 'Qualifications and certifications in JSON array format';
COMMENT ON COLUMN mbr_organization_member.projects IS 'Project experience in JSON array format';
