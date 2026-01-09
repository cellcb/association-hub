-- 为所有现有活跃会员分配 USER 角色
-- 查找所有 ACTIVE 会员对应的 userId，分配 USER 角色

INSERT INTO iam_user_role (user_id, role_id, created_time)
SELECT m.user_id, r.id, CURRENT_TIMESTAMP
FROM mbr_member m
JOIN iam_role r ON r.code = 'USER'
WHERE m.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM iam_user_role ur
    WHERE ur.user_id = m.user_id AND ur.role_id = r.id
  );
