# IAM 模块 API 路径迁移说明

> 本文记录此次将 IAM 模块接口统一到 `/api/iam/**` 名称空间的改动明细，便于前端、自动化脚本和测试用例同步调整。

| 模块/功能 | 原始路径 | 新路径 | 备注 |
| --- | --- | --- | --- |
| 身份认证 | `/api/auth/**` | `/api/iam/auth/**` | 登录、刷新、验证、用户信息、登出接口全部迁移。 |
| 用户管理 | `/api/users/**` | `/api/iam/users/**` | 包括 CRUD、分页、角色分配等管理员操作。 |
| 用户自服务 | `/api/profile/**` | `/api/iam/users/me/**` | 个人档案、修改密码、权限查询、邮箱校验。 |
| 角色管理 | `/api/roles/**` | `/api/iam/roles/**` | 角色 CRUD 以及权限绑定。 |
| 权限管理 | `/api/permissions/**` | `/api/iam/permissions/**` | 权限 CRUD、查询等。 |
| 权限配置 | `/api/permission-config/**` | `/api/iam/permissions/config/**` | 动态权限配置及缓存操作。 |
| 菜单管理 | `/api/menus/**` | `/api/iam/menus/**` | 菜单 CRUD、菜单树、用户菜单。 |
| 部门管理 | `/api/departments/**` | `/api/iam/departments/**` | 部门树、增删改、移动、统计等。 |
| 用户部门关系 | `/api/user-departments/**` 及 `/api/user/.../department/...` | `/api/iam/users/{userId}/departments/**`、`/api/iam/departments/{deptId}/users/**`、`/api/iam/user-departments/**` | 采用租户 → 用户 → 部门层级，支持 CRUD、调动、批量、统计等场景。 |
| 租户管理员 | `/api/tenant-admin` | `/api/tenant/tenants/{tenantId}/admins` | 交由租户模块托管，`tenantId` 通过路径变量传入，Request 体不再包含该字段。 |
| 动态权限测试 | `/api/dynamic-test/**` | `/api/iam/_internal/dynamic-test/**` | 仅在内部/调试使用。 |
| 纯动态权限测试 | `/api/pure-dynamic/**` | `/api/iam/_internal/pure-dynamic/**` | 仅调试用途。 |

## 调整要点

1. **统一前缀**：所有 IAM 对外接口均归于 `/api/iam/**`，便于网关、权限配置与监控集中管理。
2. **租户管理员 API**：接口迁移至租户模块，路径为 `/api/tenant/tenants/{tenantId}/admins`，通过 URL 层级体现“租户 → 管理员”。
3. **用户部门接口**：拆分为 `/users/{userId}/departments/**` 与 `/departments/{deptId}/users/**`，并保留 `/user-departments/{id}` 形式以支持 ID 维度操作。
4. **动态权限与默认权限集**：`TenantAdminService.DEFAULT_PERMISSIONS` 与 Flyway 初始化脚本同步改为匹配 `/api/iam/**`，新增 `TENANT_ADMIN_ALL` 以覆盖租户管理员接口。
5. **客户端同步**：IDEA HTTP Client 脚本、设施/知识库等模块的集成测试已改为调用新路径，若有自建脚本请参考本文件更新。

如需追溯更多细节，可查看各 Controller 顶部 `@Tag` 描述中的“原路径”提示，或使用 `git diff` 了解具体代码变动。***
