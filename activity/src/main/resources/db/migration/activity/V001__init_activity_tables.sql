-- Activity table
CREATE TABLE act_activity (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL,
    activity_date DATE,
    activity_time TIME,
    end_date DATE,
    end_time TIME,
    location VARCHAR(255),
    participants_limit INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING',
    description TEXT,
    detailed_description TEXT,
    speaker VARCHAR(100),
    speaker_bio TEXT,
    organization VARCHAR(255),
    fee DECIMAL(10, 2),
    capacity INTEGER,
    registered_count INTEGER DEFAULT 0,
    cover_image VARCHAR(500),
    venue TEXT,
    contact TEXT,
    benefits TEXT,
    agenda TEXT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- Activity registration table
CREATE TABLE act_registration (
    id BIGSERIAL PRIMARY KEY,
    activity_id BIGINT NOT NULL REFERENCES act_activity(id),
    user_id BIGINT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    company VARCHAR(255),
    position VARCHAR(100),
    member_type VARCHAR(50),
    special_requirements TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT
);

-- Indexes
CREATE INDEX idx_activity_status ON act_activity(status);
CREATE INDEX idx_activity_type ON act_activity(type);
CREATE INDEX idx_activity_date ON act_activity(activity_date);
CREATE INDEX idx_registration_activity ON act_registration(activity_id);
CREATE INDEX idx_registration_user ON act_registration(user_id);
CREATE INDEX idx_registration_status ON act_registration(status);
