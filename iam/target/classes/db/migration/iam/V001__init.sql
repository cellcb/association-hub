-- IAM module initial schema
-- Creates core identity tables, constraints, seed data, and indexes.

-- =====================
-- Core master tables
-- =====================
CREATE TABLE iam_user (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    real_name VARCHAR(50),
    status INTEGER DEFAULT 1,
    last_login_time TIMESTAMP,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT iam_user_username_key UNIQUE (username),
    CONSTRAINT iam_user_email_key UNIQUE (email)
);

CREATE TABLE iam_role (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(200),
    status INTEGER DEFAULT 1,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT iam_role_code_key UNIQUE (code),
    CONSTRAINT iam_role_name_key UNIQUE (name)
);

CREATE TABLE iam_permission (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    resource VARCHAR(200),
    action VARCHAR(50),
    description VARCHAR(200),
    status INTEGER DEFAULT 1,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT iam_permission_code_key UNIQUE (code)
);

CREATE TABLE iam_department (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description VARCHAR(500),
    parent_id BIGINT,
    sort_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    path VARCHAR(500),
    status INTEGER DEFAULT 1,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT iam_department_code_key UNIQUE (code),
    CONSTRAINT fk_department_parent FOREIGN KEY (parent_id) REFERENCES iam_department(id) ON DELETE SET NULL
);

CREATE TABLE iam_menu (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    path VARCHAR(200),
    icon VARCHAR(50),
    component VARCHAR(200),
    parent_id BIGINT,
    level INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    menu_type VARCHAR(20) DEFAULT 'MENU',
    external BOOLEAN DEFAULT FALSE,
    cache BOOLEAN DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,
    status INTEGER DEFAULT 1,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT iam_menu_code_key UNIQUE (code),
    CONSTRAINT fk_menu_parent FOREIGN KEY (parent_id) REFERENCES iam_menu(id) ON DELETE CASCADE
);

-- =====================
-- Association tables
-- =====================
CREATE TABLE iam_user_role (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES iam_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES iam_role(id) ON DELETE CASCADE,
    CONSTRAINT iam_user_role_user_role_uq UNIQUE (user_id, role_id)
);

CREATE TABLE iam_role_permission (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES iam_role(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES iam_permission(id) ON DELETE CASCADE,
    CONSTRAINT iam_role_permission_role_perm_uq UNIQUE (role_id, permission_id)
);

CREATE TABLE iam_user_department (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    position VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    status INTEGER DEFAULT 1,
    start_date DATE,
    end_date DATE,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT fk_user_department_user FOREIGN KEY (user_id) REFERENCES iam_user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_department_department FOREIGN KEY (department_id) REFERENCES iam_department(id) ON DELETE CASCADE
);

CREATE TABLE iam_menu_permission (
    id BIGSERIAL PRIMARY KEY,
    menu_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT,
    CONSTRAINT fk_menu_permission_menu FOREIGN KEY (menu_id) REFERENCES iam_menu(id) ON DELETE CASCADE,
    CONSTRAINT fk_menu_permission_permission FOREIGN KEY (permission_id) REFERENCES iam_permission(id) ON DELETE CASCADE,
    CONSTRAINT iam_menu_permission_menu_perm_uq UNIQUE (menu_id, permission_id)
);

-- =====================
-- Indexes
-- =====================
CREATE INDEX idx_iam_user_status ON iam_user(status);
CREATE INDEX idx_iam_role_status ON iam_role(status);
CREATE INDEX idx_iam_permission_status ON iam_permission(status);
CREATE INDEX idx_iam_department_parent_id ON iam_department(parent_id);
CREATE INDEX idx_iam_menu_parent_id ON iam_menu(parent_id);
CREATE INDEX idx_iam_menu_status ON iam_menu(status);
CREATE INDEX idx_iam_user_role_user ON iam_user_role(user_id);
CREATE INDEX idx_iam_user_role_role ON iam_user_role(role_id);
CREATE INDEX idx_iam_role_permission_role ON iam_role_permission(role_id);
CREATE INDEX idx_iam_role_permission_perm ON iam_role_permission(permission_id);
CREATE INDEX idx_iam_user_department_user ON iam_user_department(user_id);
CREATE INDEX idx_iam_user_department_department ON iam_user_department(department_id);
CREATE INDEX idx_iam_menu_permission_menu ON iam_menu_permission(menu_id);
CREATE INDEX idx_iam_menu_permission_permission ON iam_menu_permission(permission_id);
CREATE UNIQUE INDEX idx_iam_user_department_primary_unique
    ON iam_user_department(user_id)
    WHERE is_primary = TRUE AND status = 1;

-- =====================
-- Seed data
-- =====================
INSERT INTO iam_user (username, password, email, phone, real_name, status)
VALUES ('admin', '$2a$10$Fk.DTWRpr5UH1eoI.kek4epuenUw6mbR1FmhovKpqQDoyUWh7vBy.', 'admin@waterplatform.com', NULL, '系统管理员', 1);

INSERT INTO iam_role (name, code, description, status) VALUES
('系统超级管理员', 'SUPER_ADMIN', '平台级超级管理员，拥有所有权限', 1),
('租户超级管理员', 'TENANT_SUPER_ADMIN', '系统租户管理员，拥有所有权限', 1),
('系统管理员', 'SYSTEM_ADMIN', '系统管理员，负责系统配置和用户管理', 1),
('运维人员', 'OPERATOR', '运维人员，负责设备监控和维护', 1),
('普通用户', 'USER', '普通用户，只能查看基础信息', 1);

-- Simplified module-level permissions with explicit resource patterns for dynamic checks.
INSERT INTO iam_permission (name, code, resource, action, description, status)
VALUES
  ('身份与访问管理（全部）', 'IAM_ALL', 'regex:^/api/iam(/.*)?$', 'ALL', 'IAM模块所有功能', 1),
  ('知识库（全部）', 'KB_ALL', '/api/kb/**', 'ALL', '知识库模块所有功能', 1),
  ('设施管理（全部）', 'FACILITY_ALL', '/api/facility/**', 'ALL', '设施模块所有功能', 1),
  ('系统管理（全部）', 'SYSTEM_ALL', '/api/system/**', 'ALL', '系统模块所有功能', 1),
  ('规则引擎（全部）', 'RULE_ALL', '/api/rules/**', 'ALL', '规则模块所有功能', 1),
  ('AI 模块（全部）', 'AI_ALL', '/api/ai/**', 'ALL', 'AI 模块所有功能', 1)
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam_department (name, code, description, parent_id, sort_order, level, path, status)
VALUES ('水务集团', 'ROOT', '水务集团根部门', NULL, 1, 1, NULL, 1);

INSERT INTO iam_department (name, code, description, parent_id, sort_order, level, path, status)
SELECT '技术部', 'TECH', '技术开发部门', d.id, 1, 2, NULL, 1
FROM iam_department d WHERE d.code = 'ROOT';

INSERT INTO iam_department (name, code, description, parent_id, sort_order, level, path, status)
SELECT '运营部', 'OPERATIONS', '运营管理部门', d.id, 2, 2, NULL, 1
FROM iam_department d WHERE d.code = 'ROOT';

INSERT INTO iam_department (name, code, description, parent_id, sort_order, level, path, status)
SELECT '财务部', 'FINANCE', '财务管理部门', d.id, 3, 2, NULL, 1
FROM iam_department d WHERE d.code = 'ROOT';

INSERT INTO iam_department (name, code, description, parent_id, sort_order, level, path, status)
SELECT '人事部', 'HR', '人力资源部门', d.id, 4, 2, NULL, 1
FROM iam_department d WHERE d.code = 'ROOT';

INSERT INTO iam_department (name, code, description, parent_id, sort_order, level, path, status)
SELECT '开发组', 'DEV_TEAM', '软件开发组', d.id, 1, 3, NULL, 1
FROM iam_department d WHERE d.code = 'TECH';

INSERT INTO iam_department (name, code, description, parent_id, sort_order, level, path, status)
SELECT '测试组', 'TEST_TEAM', '软件测试组', d.id, 2, 3, NULL, 1
FROM iam_department d WHERE d.code = 'TECH';

-- 递归更新部门层级与路径
WITH RECURSIVE dept_tree AS (
    SELECT id, parent_id, CAST(id AS TEXT) AS path, 1 AS lvl
    FROM iam_department
    WHERE parent_id IS NULL
  UNION ALL
    SELECT d.id, d.parent_id, CONCAT(dt.path, '/', d.id) AS path, dt.lvl + 1 AS lvl
    FROM iam_department d
    JOIN dept_tree dt ON d.parent_id = dt.id
)
UPDATE iam_department d
SET level = dt.lvl,
    path = dt.path
FROM dept_tree dt
WHERE d.id = dt.id;

-- =====================
-- Menu structure seeding
-- =====================
INSERT INTO iam_menu (name, code, path, icon, component, parent_id, level, sort_order, menu_type, status)
VALUES
('系统管理', 'SYSTEM_MANAGE', '/system', 'system', NULL, NULL, 1, 1, 'CATALOG', 1),
('用户管理', 'USER_MANAGE', '/user', 'user', NULL, NULL, 1, 2, 'CATALOG', 1),
('监控面板', 'DASHBOARD', '/dashboard', 'dashboard', NULL, NULL, 1, 3, 'MENU', 1);

INSERT INTO iam_menu (name, code, path, icon, component, parent_id, level, sort_order, menu_type, status)
SELECT '部门管理', 'DEPARTMENT_MANAGE', '/system/department', 'apartment', NULL, m.id, 2, 1, 'MENU', 1
FROM iam_menu m WHERE m.code = 'SYSTEM_MANAGE';

INSERT INTO iam_menu (name, code, path, icon, component, parent_id, level, sort_order, menu_type, status)
SELECT '角色管理', 'ROLE_MANAGE', '/system/role', 'team', NULL, m.id, 2, 2, 'MENU', 1
FROM iam_menu m WHERE m.code = 'SYSTEM_MANAGE';

INSERT INTO iam_menu (name, code, path, icon, component, parent_id, level, sort_order, menu_type, status)
SELECT '权限管理', 'PERMISSION_MANAGE', '/system/permission', 'safety-certificate', NULL, m.id, 2, 3, 'MENU', 1
FROM iam_menu m WHERE m.code = 'SYSTEM_MANAGE';

INSERT INTO iam_menu (name, code, path, icon, component, parent_id, level, sort_order, menu_type, status)
SELECT '菜单管理', 'MENU_MANAGE', '/system/menu', 'menu', NULL, m.id, 2, 4, 'MENU', 1
FROM iam_menu m WHERE m.code = 'SYSTEM_MANAGE';

INSERT INTO iam_menu (name, code, path, icon, component, parent_id, level, sort_order, menu_type, status)
SELECT '用户列表', 'USER_LIST', '/user/list', 'user', NULL, m.id, 2, 1, 'MENU', 1
FROM iam_menu m WHERE m.code = 'USER_MANAGE';

INSERT INTO iam_menu (name, code, path, icon, component, parent_id, level, sort_order, menu_type, status)
SELECT '用户详情', 'USER_PROFILE', '/user/profile', 'profile', NULL, m.id, 2, 2, 'MENU', 1
FROM iam_menu m WHERE m.code = 'USER_MANAGE';

-- =====================
-- Role / menu / permission bindings
-- =====================
INSERT INTO iam_user_role (user_id, role_id, created_time)
SELECT u.id, r.id, CURRENT_TIMESTAMP
FROM iam_user u
JOIN iam_role r ON 1=1
WHERE u.username = 'admin' AND r.code = 'SUPER_ADMIN';

INSERT INTO iam_role_permission (role_id, permission_id, created_time)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM iam_role r
JOIN iam_permission p ON 1=1
WHERE r.code IN ('SUPER_ADMIN', 'TENANT_SUPER_ADMIN');

-- Menu permission associations (ensures menu-level ACLs)
-- Simplified menu-permission associations: map all IAM menus to IAM_ALL
INSERT INTO iam_menu_permission (menu_id, permission_id, created_time)
SELECT m.id, p.id, CURRENT_TIMESTAMP
FROM iam_menu m
JOIN iam_permission p ON 1=1
WHERE m.code IN ('DEPARTMENT_MANAGE','ROLE_MANAGE','PERMISSION_MANAGE','MENU_MANAGE','USER_LIST','USER_PROFILE','DASHBOARD')
  AND p.code = 'IAM_ALL';

-- =====================
-- User department relationships
-- =====================
INSERT INTO iam_user_department (user_id, department_id, is_primary, status, start_date, created_time)
SELECT u.id, d.id, TRUE, 1, CURRENT_DATE, CURRENT_TIMESTAMP
FROM iam_user u
JOIN iam_department d ON 1=1
WHERE u.username = 'admin' AND d.code = 'TECH';

-- Trigger to maintain updated_time column
CREATE OR REPLACE FUNCTION update_user_department_updated_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_department_updated_time
    BEFORE UPDATE ON iam_user_department
    FOR EACH ROW
    EXECUTE FUNCTION update_user_department_updated_time();
