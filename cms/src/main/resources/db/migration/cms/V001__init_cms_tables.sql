-- CMS module initialization
-- Tables: news category, tag, news, expertise field, expert, project, comment

-- News category table (dictionary)
CREATE TABLE cms_news_category (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    description VARCHAR(200),
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tag table
CREATE TABLE cms_tag (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    usage_count INTEGER DEFAULT 0,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News table
CREATE TABLE cms_news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    excerpt VARCHAR(500),
    content TEXT,
    category_id BIGINT,
    author VARCHAR(50),
    cover_image VARCHAR(500),
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    status INTEGER DEFAULT 0,
    published_at TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_news_category FOREIGN KEY (category_id) REFERENCES cms_news_category(id)
);

-- News-Tag relation table
CREATE TABLE cms_news_tag (
    news_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (news_id, tag_id),
    CONSTRAINT fk_news_tag_news FOREIGN KEY (news_id) REFERENCES cms_news(id) ON DELETE CASCADE,
    CONSTRAINT fk_news_tag_tag FOREIGN KEY (tag_id) REFERENCES cms_tag(id) ON DELETE CASCADE
);

-- Expertise field table (dictionary)
CREATE TABLE cms_expertise_field (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    description VARCHAR(200),
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expert table
CREATE TABLE cms_expert (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    title VARCHAR(100),
    organization VARCHAR(200),
    location VARCHAR(100),
    achievements TEXT,
    email VARCHAR(100),
    phone VARCHAR(20),
    avatar VARCHAR(500),
    bio TEXT,
    education TEXT,
    experience TEXT,
    projects TEXT,
    publications TEXT,
    awards TEXT,
    research_areas TEXT,
    status INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expert-Expertise relation table
CREATE TABLE cms_expert_expertise (
    expert_id BIGINT NOT NULL,
    expertise_id BIGINT NOT NULL,
    PRIMARY KEY (expert_id, expertise_id),
    CONSTRAINT fk_expert_expertise_expert FOREIGN KEY (expert_id) REFERENCES cms_expert(id) ON DELETE CASCADE,
    CONSTRAINT fk_expert_expertise_field FOREIGN KEY (expertise_id) REFERENCES cms_expertise_field(id) ON DELETE CASCADE
);

-- Project table
CREATE TABLE cms_project (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    category VARCHAR(30) NOT NULL,
    location VARCHAR(200),
    completion_date DATE,
    owner VARCHAR(200),
    designer VARCHAR(200),
    contractor VARCHAR(200),
    description TEXT,
    highlights TEXT,
    project_awards TEXT,
    views INTEGER DEFAULT 0,
    background TEXT,
    scale TEXT,
    design_concept TEXT,
    technical_features TEXT,
    achievements TEXT,
    images TEXT,
    cover_image VARCHAR(500),
    status INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comment table (polymorphic)
CREATE TABLE cms_comment (
    id BIGSERIAL PRIMARY KEY,
    resource_type VARCHAR(20) NOT NULL,
    resource_id BIGINT NOT NULL,
    parent_id BIGINT,
    author_id BIGINT,
    author_name VARCHAR(50) NOT NULL,
    author_avatar VARCHAR(500),
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    status INTEGER DEFAULT 1,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES cms_comment(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_cms_news_category ON cms_news(category_id);
CREATE INDEX idx_cms_news_status ON cms_news(status);
CREATE INDEX idx_cms_news_featured ON cms_news(featured);
CREATE INDEX idx_cms_news_published_at ON cms_news(published_at);

CREATE INDEX idx_cms_expert_status ON cms_expert(status);
CREATE INDEX idx_cms_expert_name ON cms_expert(name);

CREATE INDEX idx_cms_project_category ON cms_project(category);
CREATE INDEX idx_cms_project_status ON cms_project(status);

CREATE INDEX idx_cms_comment_resource ON cms_comment(resource_type, resource_id);
CREATE INDEX idx_cms_comment_parent ON cms_comment(parent_id);
CREATE INDEX idx_cms_comment_status ON cms_comment(status);

-- Seed data: News categories
INSERT INTO cms_news_category (name, code, sort_order) VALUES
('新闻动态', 'news_update', 1),
('会员动态', 'member_news', 2),
('技术成果', 'tech_achievement', 3),
('政策法规', 'policy', 4),
('行业资讯', 'industry_news', 5),
('活动报道', 'activity_report', 6);

-- Seed data: Expertise fields
INSERT INTO cms_expertise_field (name, code, sort_order) VALUES
('建筑给排水', 'building_water', 1),
('市政供水', 'municipal_water_supply', 2),
('市政排水', 'municipal_drainage', 3),
('项目管理', 'project_management', 4),
('智慧管理', 'smart_management', 5),
('水处理技术', 'water_treatment', 6),
('水质安全', 'water_quality', 7),
('海绵城市', 'sponge_city', 8),
('绿色建筑', 'green_building', 9),
('二次供水', 'secondary_supply', 10),
('消防给水', 'fire_water', 11),
('BIM应用', 'bim_application', 12);

-- Comments
COMMENT ON TABLE cms_news_category IS 'News category dictionary';
COMMENT ON TABLE cms_tag IS 'News tags';
COMMENT ON TABLE cms_news IS 'News articles';
COMMENT ON TABLE cms_expertise_field IS 'Expert expertise field dictionary';
COMMENT ON TABLE cms_expert IS 'Expert information';
COMMENT ON TABLE cms_project IS 'Project showcase';
COMMENT ON TABLE cms_comment IS 'Comments (polymorphic for news, project, activity)';
