-- 添加管理后台权限
INSERT INTO iam_permission (name, code, resource, action, description, status)
VALUES ('管理后台（全部）', 'ADMIN_ALL', '/api/admin/**', 'ALL', '管理后台所有功能', 1)
ON CONFLICT (code) DO NOTHING;

-- 分配给 SUPER_ADMIN 角色
INSERT INTO iam_role_permission (role_id, permission_id, created_time)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM iam_role r
JOIN iam_permission p ON p.code = 'ADMIN_ALL'
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;
