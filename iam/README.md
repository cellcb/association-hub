# IAM (Identity and Access Management) 模块

## 概述

IAM模块实现了基于JWT的用户身份认证和权限管理功能，为水务平台提供统一的用户认证、授权和权限控制。

## 功能特性

### 🔐 核心功能
- **JWT登录认证** - 基于用户名/密码的登录验证
- **令牌管理** - Access Token 和 Refresh Token 机制
- **权限控制** - 基于角色和权限的访问控制
- **用户管理** - 用户信息维护和状态管理

### 🏗️ 技术架构
- **Spring Boot 3.3.13** + **Java 17**
- **Spring Security** - 安全框架
- **JWT (jjwt 0.12.3)** - 令牌技术
- **JPA/Hibernate** - 数据持久化
- **Flyway** - 数据库版本管理
- **PostgreSQL** - 数据库

## 数据库设计

### 📊 表结构 (iam_ 前缀)

```sql
iam_user           -- 用户表
iam_role           -- 角色表  
iam_permission     -- 权限表
iam_user_role      -- 用户角色关联表
iam_role_permission -- 角色权限关联表
```

### 👤 默认用户
- **用户名**: admin
- **密码**: 123456
- **角色**: 超级管理员 (拥有所有权限)

## API接口

### 🔑 认证接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/iam/auth/login` | 用户登录 |
| POST | `/api/iam/auth/refresh` | 刷新令牌 |
| POST | `/api/iam/auth/validate` | 验证令牌 |
| GET  | `/api/iam/auth/userinfo` | 获取用户信息 |
| POST | `/api/iam/auth/logout` | 用户退出 |

### 📝 登录示例

**请求:**
```json
POST /api/iam/auth/login
{
  "username": "admin",
  "password": "123456"
}
```


**响应:**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 7200,
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@waterplatform.com",
      "realName": "系统管理员",
      "roles": ["SUPER_ADMIN"],
      "permissions": ["USER_READ", "USER_CREATE", ...]
    }
  },
  "timestamp": 1704067200000
}
```

> **角色说明**：`SUPER_ADMIN` 代表平台级系统管理员；租户侧自动创建的超级管理员角色代码为 `TENANT_SUPER_ADMIN`，仅在各自租户内生效。

## 配置说明

### 🔧 核心配置

```yaml
# JWT配置
jwt:
  secret: your-secret-key
  access-token-expiration: 7200000  # 2小时
  refresh-token-expiration: 604800000  # 7天
  issuer: water-platform

# 数据库配置
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/water_platform
    username: water_user
    password: water_password

# 审计日志
audit:
  mask-keys:
    - password
    - secret
    - token
  parameter-max-length: 4000          # 审计参数字段最大长度，超出会截断
  retention-days: 180                  # 保留天数（<=0 关闭定期清理）
  retention-cron: "0 30 3 * * *"       # 清理任务 cron 表达式
  async:
    core-pool-size: 2
    max-pool-size: 4
    queue-capacity: 500
```

## 安全特性

### 🛡️ 安全措施
- **密码加密**: BCrypt算法加密存储
- **JWT签名**: HMAC-SHA256算法签名
- **令牌过期**: Access Token 2小时，Refresh Token 7天
- **CORS配置**: 跨域请求控制
- **输入验证**: 请求参数验证和过滤

### 🔒 权限模型
```
用户 -> 角色 -> 权限
  |      |       |
  M      M       N
  |      |       |
  N      N       M
```

## 审计日志使用指南

### 💾 数据表
- `iam_audit_log`：记录租户隔离的审计日志，索引 `(tenant_id, occurred_at desc)` 与 `(action, resource)`。

### 📥 记录方式
- 在控制器/服务方法上标记 `@Audit(action = AuditAction.UPDATE_USER, resource = "user")`，AOP 自动捕获请求上下文、用户、租户、耗时、结果、脱敏参数并异步入库。
- 认证事件：登录/刷新/退出已用 `@Audit` 标记；可在安全监听器扩展登录失败等场景。
- 参数脱敏：默认屏蔽密码、token 等键，可通过 `audit.mask-keys` 配置扩展。

### 📤 查询接口
- `GET /api/iam/audit/logs`：按 `action/resource/username/resultStatus/时间范围` 过滤并分页；需具备审计只读权限（在角色策略中分配）。

### 🔄 保留与清理
- `audit.retention-days` 控制保留期，调度任务按 `audit.retention-cron` 定期清理；设为 `<=0` 关闭清理（不建议线上）。

### ✅ 开发建议
- 优先给高风险/关键变更接口加 `@Audit`：用户、角色、租户、规则、设施、系统配置等。
- 批处理或非 Web 场景可直接调用 `AuditLogService.record(AuditContext)`，确保传入租户上下文，否则会使用兜底租户或记录失败。

## 快速开始

### 1️⃣ 环境准备
```bash
# 确保PostgreSQL运行
# 创建数据库
createdb water_platform
```

### 2️⃣ 构建运行
```bash
# 在项目根目录执行
mvn clean compile
```

### 3️⃣ 测试登录
```bash
curl -X POST http://localhost:8080/api/iam/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456","tenantId":1}'
```

### 4️⃣ 使用令牌
```bash
curl -X GET http://localhost:8080/api/iam/auth/userinfo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 项目结构

```
src/main/java/com/waterplatform/iam/
├── config/          # 配置类
│   └── SecurityConfig.java
├── controller/      # 控制器
│   └── AuthController.java
├── dto/            # 数据传输对象
│   ├── LoginRequest.java
│   └── LoginResponse.java
├── entity/         # 实体类
│   ├── User.java
│   ├── Role.java
│   └── Permission.java
├── exception/      # 异常处理
│   ├── AuthenticationException.java
│   └── GlobalExceptionHandler.java
├── repository/     # 数据访问层
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   └── PermissionRepository.java
├── security/       # 安全组件
│   ├── JwtAuthenticationFilter.java
│   ├── JwtAuthenticationEntryPoint.java
│   ├── JwtAuthenticationDetails.java
│   └── UserDetailsServiceImpl.java
└── service/        # 业务逻辑层
    ├── AuthService.java
    └── JwtService.java
```

## 后续扩展

### 🚀 待实现功能

- [ ] 令牌黑名单机制
- [ ] 审计日志记录

### 📈 性能优化
- [ ] Redis缓存用户权限
- [ ] 令牌续期机制
- [ ] 批量权限验证
- [ ] 数据库连接池优化

## 注意事项
