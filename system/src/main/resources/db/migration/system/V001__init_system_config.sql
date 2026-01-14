-- System configuration table
CREATE TABLE sys_config (
    id BIGSERIAL PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    sort_order INT DEFAULT 0,
    status INT DEFAULT 1,
    created_by BIGINT,
    updated_by BIGINT,
    created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sys_config_category ON sys_config(category);
CREATE INDEX idx_sys_config_status ON sys_config(status);

-- Insert initial configuration data

-- Header / Site Info
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('site_name', '"广东省土木建筑学会"', 'header', '网站主标题', 1),
('site_slogan', '"给水排水专业委员会"', 'header', '网站副标题/标语', 2),
('site_name_short', '"给排水专委会"', 'header', '网站简称（移动端显示）', 3);

-- Hero Section
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('hero_content', '{
  "badge": "专业 · 权威 · 创新",
  "title": "技术专委会\n数字化平台",
  "subtitle": "连接行业精英，推动技术创新\n为会员提供专业服务与交流平台",
  "primaryButton": {"text": "申请入会", "icon": "Users"},
  "secondaryButton": {"text": "了解更多", "icon": "Play"}
}', 'hero', '首页主横幅内容', 1);

-- Carousel Items
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('carousel_items', '[
  {
    "image": "https://images.unsplash.com/photo-1633431303895-8236f0a04b46?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGNvbmZlcmVuY2UlMjBoYWxsfGVufDF8fHx8MTc2NjU3MjcyNXww&ixlib=rb-4.1.0&q=80&w=1080",
    "title": "2024年度技术交流大会",
    "subtitle": "年度盛会",
    "description": "汇聚500+行业精英，共话技术创新与产业发展",
    "buttonText": "了解详情",
    "buttonLink": "activities"
  },
  {
    "image": "https://images.unsplash.com/photo-1694702740570-0a31ee1525c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBidWlsZGluZ3xlbnwxfHx8fDE3NjY1MzMxODZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "title": "优秀案例展示",
    "subtitle": "案例展示",
    "description": "200+标杆案例，分享成功经验与创新实践",
    "buttonText": "查看案例",
    "buttonLink": "projects"
  },
  {
    "image": "https://images.unsplash.com/photo-1728933102332-a4f1a281a621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5JTIwc2VtaW5hcnxlbnwxfHx8fDE3NjY1NzI3MjZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "title": "技术沙龙与专家分享",
    "subtitle": "知识分享",
    "description": "定期举办技术沙龙，邀请行业专家深度分享",
    "buttonText": "参与活动",
    "buttonLink": "activities"
  },
  {
    "image": "https://images.unsplash.com/photo-1696841750205-1aab62d90bef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjY0OTI3NDJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    "title": "专业培训与认证",
    "subtitle": "能力提升",
    "description": "提供系统化专业培训，助力会员能力提升",
    "buttonText": "了解更多",
    "buttonLink": "activities"
  },
  {
    "image": "https://images.unsplash.com/photo-1711390811443-ae5a33144f7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyeSUyMGV4aGliaXRpb258ZW58MXx8fHwxNzY2NTcyNzI3fDA&ixlib=rb-4.1.0&q=80&w=1080",
    "title": "给排水技术产品",
    "subtitle": "产品展示",
    "description": "泵、阀、管件等给排水专业产品，促进厂商与专业人士交流",
    "buttonText": "查看产品",
    "buttonLink": "products"
  }
]', 'carousel', '首页轮播图配置', 1);

-- Statistics
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('statistics', '[
  {"label": "会员单位", "value": "300+", "icon": "Users", "color": "text-blue-600"},
  {"label": "专家团队", "value": "150+", "icon": "Award", "color": "text-purple-600"},
  {"label": "优秀案例", "value": "200+", "icon": "TrendingUp", "color": "text-green-600"},
  {"label": "年度活动", "value": "50+", "icon": "Calendar", "color": "text-orange-600"}
]', 'stats', '首页统计数据', 1);

-- Core Features
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('core_features', '[
  {"icon": "FileText", "title": "优秀案例", "description": "展示行业典型案例与创新成果", "color": "bg-green-500", "link": "projects"},
  {"icon": "Calendar", "title": "活动中心", "description": "年度会议、沙龙、分享会等精彩活动", "color": "bg-purple-500", "link": "activities"},
  {"icon": "Package", "title": "产品展示", "description": "泵阀管件等给排水专业产品", "color": "bg-orange-500", "link": "products"},
  {"icon": "Users", "title": "专家风采", "description": "汇聚行业顶尖专家，提供专业技术指导", "color": "bg-blue-500", "link": "experts"}
]', 'features', '核心功能模块', 1);

-- Organization Introduction
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('organization_intro', '{
  "sectionTitle": "组织介绍",
  "sectionSubtitle": "广东省土木建筑学会给水排水专业委员会是广东省内给排水行业权威专业组织",
  "items": [
    {
      "title": "专业定位",
      "content": "专委会隶属于广东省土木建筑学会，专注于建筑给排水和市政给排水领域的技术研究、学术交流和行业服务。汇聚省内外顶尖专家学者，为行业发展提供智力支持和技术指导。",
      "icon": "CheckCircle",
      "borderColor": "border-blue-100",
      "iconColor": "text-blue-600"
    },
    {
      "title": "核心使命",
      "content": "推动给排水技术创新与应用，促进产学研深度融合，加强行业内专业人士与设备厂商的交流合作，提升行业整体技术水平，服务广东省城市建设和民生工程。",
      "icon": "CheckCircle",
      "borderColor": "border-green-100",
      "iconColor": "text-green-600"
    },
    {
      "title": "服务范围",
      "content": "涵盖建筑给排水设计、市政供水系统、市政排水工程、二次供水、智慧水务、海绵城市建设等多个专业领域，为会员提供技术咨询、标准编制、培训认证等全方位服务。",
      "icon": "CheckCircle",
      "borderColor": "border-purple-100",
      "iconColor": "text-purple-600"
    }
  ],
  "image": "https://images.unsplash.com/photo-1664575602554-2087b04935a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBidWlsZGluZyUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3MzY1NzI3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "imageCaption": {"title": "专业·权威·创新", "subtitle": "服务行业发展，推动技术进步"},
  "quickStats": [
    {"value": "10+年", "label": "行业服务经验", "bgClass": "from-blue-500 to-blue-600"},
    {"value": "300+", "label": "会员单位", "bgClass": "from-green-500 to-green-600"},
    {"value": "150+", "label": "行业专家", "bgClass": "from-purple-500 to-purple-600"},
    {"value": "50+", "label": "年度活动", "bgClass": "from-orange-500 to-orange-600"}
  ]
}', 'about', '组织介绍内容', 1);

-- Member Types
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('member_types', '[
  {"icon": "Building2", "title": "设备单位", "description": "设备制造商、供应商", "count": "120+", "color": "bg-blue-50 text-blue-600"},
  {"icon": "Briefcase", "title": "建设单位", "description": "工程公司、施工单位", "count": "85+", "color": "bg-green-50 text-green-600"},
  {"icon": "GraduationCap", "title": "事业单位", "description": "科研院所、高校", "count": "60+", "color": "bg-purple-50 text-purple-600"},
  {"icon": "BookOpen", "title": "设计单位", "description": "设计院、咨询公司", "count": "45+", "color": "bg-orange-50 text-orange-600"}
]', 'members', '会员分类', 1);

-- Testimonials
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('testimonials', '[
  {
    "name": "张建国",
    "title": "教授级高级工程师",
    "organization": "中国建筑科学研究院",
    "content": "通过专委会平台，我们与行业同仁建立了深度合作，共同推进了多个重大技术创新项目。",
    "avatar": ""
  },
  {
    "name": "李明华",
    "title": "教授、博士生导师",
    "organization": "清华大学建筑学院",
    "content": "专委会的学术交流活动为我们提供了很好的平台，促进了产学研深度融合。",
    "avatar": ""
  },
  {
    "name": "王芳",
    "title": "高级工程师",
    "organization": "上海建筑设计研究院",
    "content": "在这里结识了众多行业精英，获得了宝贵的项目经验和技术资源。",
    "avatar": ""
  }
]', 'testimonials', '会员评价', 1);

-- Platform Highlights
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('platform_highlights', '[
  {"icon": "Star", "title": "权威认证", "description": "国家级行业协会背书，专业可信赖"},
  {"icon": "Sparkles", "title": "创新驱动", "description": "聚焦前沿技术，推动行业创新发展"},
  {"icon": "Users", "title": "资源整合", "description": "连接产学研用，打通产业链上下游"},
  {"icon": "Award", "title": "专业服务", "description": "提供全方位专业技术支持与咨询"}
]', 'highlights', '平台亮点', 1);

-- Exhibition Info
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('exhibition_info', '{
  "badge": "十年合作 · 行业盛会",
  "title": "广东国际泵管阀展览会",
  "description": "连续10年与上海荷瑞展览有限公司成功合作，打造华南地区最具影响力的泵管阀行业展览会。汇聚国内外知名品牌，搭建供需对接平台，促进技术交流与商业合作。",
  "stats": [
    {"value": "10年", "label": "连续举办"},
    {"value": "500+", "label": "参展企业"},
    {"value": "20,000+", "label": "专业观众"},
    {"value": "50,000㎡", "label": "展览面积"}
  ],
  "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxleGhpYml0aW9uJTIwaGFsbHxlbnwxfHx8fDE3MzY1NzI3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080",
  "primaryButton": {"text": "查看展会详情", "icon": "Calendar", "activityId": ""},
  "secondaryButton": {"text": "展位预订", "icon": "ExternalLink"}
}', 'exhibition', '展览会信息', 1);

-- Digital Platforms
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('digital_platforms', '{
  "sectionTitle": "多平台互联互通",
  "sectionSubtitle": "通过视频号和智能体，打造全方位数字化服务体系",
  "platforms": [
    {
      "icon": "Package",
      "title": "WEB平台",
      "description": "专业门户网站，提供会员管理、项目展示、活动组织等全面服务",
      "features": ["会员服务与管理", "项目与产品展示", "活动组织与报名"],
      "bgClass": "from-blue-500 to-blue-600"
    },
    {
      "icon": "Video",
      "title": "视频号",
      "description": "专业技术视频分享，打造行业知识传播阵地",
      "features": ["技术讲座与分享", "项目案例解析", "行业动态速递"],
      "bgClass": "from-red-500 to-pink-600",
      "buttonText": "关注视频号"
    },
    {
      "icon": "Bot",
      "title": "智能体",
      "description": "AI驱动的专业咨询助手，7x24小时智能服务",
      "features": ["技术问题咨询", "智能推荐服务", "行业知识问答"],
      "bgClass": "from-purple-500 to-indigo-600",
      "buttonText": "体验智能体",
      "highlighted": true
    }
  ]
}', 'digital', '数字化平台信息', 1);

-- Core Value Section
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('core_value', '{
  "badge": "核心价值",
  "title": "专业的技术服务平台",
  "description": "我们致力于搭建行业最专业的技术交流平台，汇聚行业精英，分享前沿技术，推动产业创新。通过年度会议、技术沙龙、专家分享等多种形式，为会员提供全方位的专业服务。",
  "buttonText": "立即加入",
  "stats": [
    {"value": "150+", "label": "权威专家团队\n技术指导", "bgColor": "bg-blue-600"},
    {"value": "50+", "label": "年度专业活动\n技术交流", "bgColor": "bg-purple-600"},
    {"value": "200+", "label": "优质项目案例\n经验分享", "bgColor": "bg-green-600"},
    {"value": "300+", "label": "会员单位\n资源共享", "bgColor": "bg-orange-600"}
  ]
}', 'value', '核心价值宣传', 1);

-- CTA Section
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('cta_section', '{
  "title": "准备好加入我们了吗？",
  "subtitle": "与300+优质企业和150+行业专家一起，共建行业技术交流平台",
  "primaryButton": {"text": "申请入会", "icon": "Users"},
  "secondaryButton": {"text": "预约咨询", "icon": "Calendar"}
}', 'cta', 'CTA 号召行动区块', 1);

-- Footer Contact Info
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('contact_info', '{
  "phone": "010-12345678",
  "email": "info@association.org",
  "address": "北京市朝阳区某某路某某号"
}', 'footer', '联系方式', 1);

-- Footer Company Info
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('company_info', '{
  "name": "技术专委会",
  "description": "专注于行业技术交流与创新发展，为会员提供专业的技术服务和交流平台，推动行业技术进步与产业升级。",
  "copyright": "© 2024 技术专委会数字化平台. All rights reserved."
}', 'footer', '公司/组织信息', 2);

-- Footer Quick Links
INSERT INTO sys_config (config_key, config_value, category, description, sort_order) VALUES
('quick_links', '[
  {"label": "关于我们", "link": "#"},
  {"label": "入会指南", "link": "#"},
  {"label": "会员权益", "link": "#"},
  {"label": "联系我们", "link": "#"}
]', 'footer', '页脚快速链接', 3);

-- Add permissions for system config management
INSERT INTO iam_permission (code, name, description, resource, action, status, created_time, updated_time)
VALUES
('SYSTEM_CONFIG_VIEW', '查看系统配置', '查看系统配置的权限', 'system:config', 'view', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('SYSTEM_CONFIG_EDIT', '编辑系统配置', '编辑系统配置的权限', 'system:config', 'edit', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign permissions to SUPER_ADMIN role
INSERT INTO iam_role_permission (role_id, permission_id)
SELECT r.id, p.id FROM iam_role r, iam_permission p
WHERE r.code = 'SUPER_ADMIN' AND p.code IN ('SYSTEM_CONFIG_VIEW', 'SYSTEM_CONFIG_EDIT');
