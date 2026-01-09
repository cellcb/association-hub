-- 添加会员个人中心权限
INSERT INTO iam_permission (name, code, resource, action, description, status)
VALUES ('会员个人中心', 'MEMBER_PROFILE_ALL', '/api/members/me/**', 'ALL', '会员查看和编辑自己的信息', 1)
ON CONFLICT (code) DO NOTHING;

-- 分配给 USER 角色
INSERT INTO iam_role_permission (role_id, permission_id, created_time)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM iam_role r
JOIN iam_permission p ON p.code = 'MEMBER_PROFILE_ALL'
WHERE r.code = 'USER'
ON CONFLICT DO NOTHING;
