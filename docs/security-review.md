# 安全问题清单与整改建议

本文基于代码静态审查整理（未进行渗透测试/运行时验证），用于跟踪当前项目的主要安全风险与整改建议。

- 整理日期：2026-01-15
- 覆盖范围：`boot/`、`common/`、`iam/`、`member/`、`cms/`、`ai/`、`web/`、`deploy/`
- 说明：证据处仅指向“问题出现的位置”，不在本文中重复输出敏感值（如密钥/口令）。

## 风险概览

- `Critical`
  - 源码中硬编码密钥（可直接滥用）
  - 审计链路可能记录明文口令/令牌（高敏泄露面）
- `High`
  - CORS 过宽（任意 Origin + 允许凭证）
  - 前端多处直出 HTML + 令牌存 `localStorage`（XSS → 账号接管）
  - 公开接口存在信息泄露/可枚举（配置、申请状态）
  - 运维/观测端点可被普通登录用户访问（信息泄露面）
- `Medium`
  - 生产环境默认开放 Swagger/OpenAPI（攻击面枚举）
  - 公共 SSE/线程池无上限（DoS 风险）
  - 默认弱口令/默认密钥回退（环境缺失时落入不安全配置）
  - 错误处理回显异常信息/强制打印栈（信息泄露与日志污染）

## 发现清单（按严重度）

### Critical

#### SEC-001 源码中硬编码第三方 API Key

- 影响
  - 密钥泄露后可被直接调用第三方服务导致费用损失/配额耗尽/数据外泄。
- 证据
  - `boot/src/main/resources/application.yml:7`
  - `boot/src/main/resources/application-prod.yml:7`
  - `boot/src/main/resources/application-test.yml:7`
- 建议整改
  - 立即轮换密钥（旧 key 视为已泄露）。
  - 从源码配置移除密钥，改为运行时注入（环境变量 / K8s Secret / Vault）。
  - 清理 Git 历史（例如 `git filter-repo`/BFG），避免旧提交仍可检索到密钥。
  - 为仓库启用 secret scanning（预提交 + CI）。
- 验证建议
  - 全仓库扫描：不得再出现形如 `api-key:` 的非空硬编码值；CI 阶段阻断。

#### SEC-002 审计日志可能记录明文口令/刷新令牌等敏感字段

- 影响
  - 一旦审计库/日志被访问（或被运营导出），可能直接泄露登录口令、刷新令牌、改密参数等高敏信息。
- 证据
  - 登录接口启用审计：`iam/src/main/java/com/assoc/iam/controller/AuthController.java:53`（`@Audit`）
  - 审计采集入参并序列化：`boot/src/main/java/com/assoc/audit/AuditAspect.java:82`
  - 当前脱敏逻辑对“对象 → JSON”场景不递归字段级脱敏：`common/src/main/java/com/assoc/common/audit/ParameterMasker.java:68`
  - 登录 DTO 含 `password` 字段：`iam/src/main/java/com/assoc/iam/dto/LoginRequest.java:12`
- 典型利用链
  - 攻击者通过低权限日志读取/备份泄露/审计表注入等方式拿到明文口令或令牌 → 直接登录或长期保持会话。
- 建议整改（推荐组合）
  - 对认证相关接口（`/login`、`/refresh`、改密、重置等）设置 `@Audit(maskArgs=false)` 或移除入参采集，仅记录元信息（uri/method/userId/结果）。
  - 修复 `ParameterMasker`：对 `objectMapper.convertValue(...)` 的结果继续递归脱敏（确保 `password/token/authorization/...` 等字段在任何嵌套层级都会被替换为 `***`）。
  - 审计数据存储加密/最小权限访问，并设置保留期与脱敏导出策略（已有配置可继续完善）。
- 验证建议
  - 用含 `password` 的请求触发审计，检查审计表/日志中不存在明文口令或令牌。

### High

#### SEC-003 CORS 允许任意 Origin 且允许携带凭证

- 影响
  - 任意站点可在浏览器侧跨域调用 API（尤其当未来改为 Cookie 认证、或某些端点允许凭证时风险骤增）。
  - 也会扩大浏览器侧攻击面（某些错误配置下可能被用于读写敏感响应）。
- 证据
  - `iam/src/main/java/com/assoc/iam/config/SecurityConfig.java:91`（`setAllowedOriginPatterns("*")` + `setAllowCredentials(true)`）
- 建议整改
  - 用白名单替代 `*`：从配置读取允许的前端域名列表（dev/test/prod 分离）。
  - 若仅使用 `Authorization: Bearer`，可考虑 `allowCredentials=false` 并保持严格 origin 白名单。
  - 明确 `Vary: Origin` 与预检缓存策略（必要时）。

#### SEC-004 前端多处 `dangerouslySetInnerHTML` + 令牌存 `localStorage`（高风险 XSS 组合）

- 影响
  - 一旦新闻/产品/活动等富文本内容可被注入脚本，即可能窃取 `localStorage` 中的 token → 账号接管。
- 证据
  - token 存储：`web/src/lib/api.ts:27`
  - 新闻内容直出：`web/src/app/components/NewsCenter.tsx:350`
  - 产品富文本直出：`web/src/app/components/ProductCatalog.tsx:305`
  - （其余管理端/厂商/活动等组件也存在同类用法，可继续全量梳理）
- 建议整改（按优先级）
  - 后端：对富文本字段进行 HTML 白名单清洗（入库或出库至少做一处）；拒绝 `script/on*`、危险 URL scheme 等。
  - 前端：渲染前对 HTML 再做一次 sanitize（防御纵深）；并尽量减少 `dangerouslySetInnerHTML` 覆盖面。
  - Nginx：增加 CSP（`Content-Security-Policy`）以降低 XSS 成功率；配合 `frame-ancestors` 等。
  - token：若业务允许，迁移到 `httpOnly` Cookie + CSRF 防护；或至少改为内存存储并缩短 token 生命周期。

#### SEC-005 公开配置接口返回所有启用配置，存在“误配置泄露”风险

- 影响
  - 任何启用状态的配置项都会被公开；一旦运营误将密钥/连接串/内部地址写入配置，将直接对外泄露。
  - 配置值会被尝试解析为 JSON，对前端渲染链路也可能造成注入面扩展（取决于前端如何使用）。
- 证据
  - 公开接口：`system/src/main/java/com/assoc/system/controller/PublicConfigController.java:22`
  - 返回所有启用项：`system/src/main/java/com/assoc/system/service/impl/ConfigServiceImpl.java:83`
- 建议整改
  - 建立“可公开配置白名单”（按 key 或 category），仅返回明确允许的字段。
  - 将密钥类配置从业务配置中拆分（例如独立表/独立配置源），并强制不对外返回。

#### SEC-006 会员申请状态查询对外公开且可枚举（IDOR/信息泄露）

- 影响
  - 通过遍历 `memberId` 可批量查询申请状态、驳回原因、会员编号等信息（隐私/业务信息泄露）。
- 证据
  - 白名单放行：`common/src/main/java/com/assoc/common/security/SecurityWhitelist.java:30`
  - 查询接口：`member/src/main/java/com/assoc/member/controller/MemberApplicationController.java:47`
  - 响应包含驳回原因等：`member/src/main/java/com/assoc/member/dto/ApplicationStatusResponse.java:14`
- 建议整改
  - 将查询改为“不可枚举标识”（例如申请时返回 `trackingCode`），查询必须携带该随机值。
  - 或要求登录并校验“只能查自己的申请”。
  - 对公开查询加限流/验证码，防止撞库与批量遍历。

#### SEC-007 `/actuator/**` 对普通登录用户可达（信息泄露面）

- 影响
  - 当前“免权限校验”策略会使任意已登录用户访问观测端点（metrics/prometheus 等），可能泄露系统与运行状态信息。
- 证据
  - 动态权限免检：`common/src/main/java/com/assoc/common/security/SecurityWhitelist.java:52`
  - 公开的 management 端点列表：`boot/src/main/resources/application.yml:114`
- 建议整改
  - 将 `/actuator/**` 从免检列表移除，并在 Spring Security/management security 中单独加严（仅运维角色、或仅内网）。
  - Prometheus 等端点建议独立端口 + 网络层访问控制。

### Medium

#### SEC-008 生产默认启用 Swagger/OpenAPI 且白名单放行

- 影响
  - 使攻击者更容易枚举接口、参数结构与返回模型，降低攻击成本。
- 证据
  - 生产默认启用：`boot/src/main/resources/application-prod.yml:124`
  - 白名单放行：`common/src/main/java/com/assoc/common/security/SecurityWhitelist.java:21`
- 建议整改
  - 生产默认关闭；如必须保留，仅允许内网或管理员访问（不应完全放行）。

#### SEC-009 公共 RAG SSE 使用无上限线程池（DoS 风险）

- 影响
  - `newCachedThreadPool()` 在高并发/长连接下可能创建大量线程；公共接口无认证更容易被滥用造成资源耗尽。
- 证据
  - `ai/src/main/java/com/assoc/ai/controller/PublicRagController.java:33`
- 建议整改
  - 改为有界线程池/队列 + 并发与速率限制（IP/UA/会话维度）。
  - 为公共入口增加验证码/匿名配额/应用级 API key（按业务选择）。

#### SEC-010 默认弱口令/默认密钥回退（部署安全）

- 影响
  - 环境变量缺失或复制示例配置时，系统可能以弱口令/默认密钥运行。
- 证据
  - docker-compose 默认数据库口令：`deploy/docker-compose.yml:7`
  - JWT secret 存在默认回退：`boot/src/main/resources/application.yml:94`、`iam/src/main/java/com/assoc/iam/service/JwtService.java:20`
  - 示例环境含默认管理员口令：`http-client.env.json:4`
- 建议整改
  - “缺失即失败”：生产启动时强制校验 `DB_PASSWORD/JWT_SECRET/...` 不得为空且不得为默认值。
  - 部署模板中移除弱口令，改为占位符并在文档中强调生成方式。

#### SEC-011 错误处理回显异常信息/强制打印栈（信息泄露）

- 影响
  - 向客户端回显 `e.getMessage()` 可能泄露内部实现细节；`printStackTrace()` 会污染日志且可能泄露敏感数据。
- 证据
  - `common/src/main/java/com/assoc/common/exception/GlobalExceptionHandler.java:73`
  - `common/src/main/java/com/assoc/common/exception/GlobalExceptionHandler.java:104`
  - 登录接口返回 `e.getMessage()`：`iam/src/main/java/com/assoc/iam/controller/AuthController.java:61`
- 建议整改
  - 对外返回统一的、无内部细节的错误消息；内部用结构化日志记录（含 traceId）。
  - 移除 `printStackTrace()`，并避免把异常信息拼到 500 响应里。

## Nginx/前端安全头建议（补充）

当前 Nginx 已配置部分安全头：`deploy/conf/nginx.conf:10`，但仍建议补齐：

- `Content-Security-Policy`（配合前端资源策略与第三方域名）
- `Permissions-Policy`
- `Strict-Transport-Security`（HTTPS 场景）
- 针对 `/api/` 的更严格缓存/类型策略（如必要）

## 待确认/后续补充

- `/api/kb/indexing/**` 等白名单路径在当前代码中未定位到实现（可能在其他分支/模块）；建议确认后补充具体风险与修复方案。
- 富文本内容的后端存储/编辑链路是否已有清洗（未在本次审查中确认），需结合管理端编辑器与后端入库逻辑进一步核查。

