# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure & Module Organization

**后端 (Maven Multi-module)**
- `boot/` - Spring Boot 启动入口，集中配置 (`application*.yml`)
- `common/` - 共享工具库、异常层次、`Result<?>` 响应封装
- `iam/` - 身份认证与访问管理 (JWT, 用户, 角色, 权限)
- `member/` - 会员管理 (申请、审核、个人/单位会员)
- `cms/` - 内容管理 (新闻、公告)
- `activity/` - 活动管理
- `product/` - 产品展示
- `scheduler/` - 定时任务 (Quartz)

**前端 (`web/`)**
- React 18 + Vite + TypeScript
- Tailwind CSS 4.x + Radix UI 组件库
- 目录结构: `src/app/` (页面组件), `src/lib/` (API), `src/types/` (类型定义)

## Build & Development Commands

```bash
# 后端
./mvnw clean compile                    # 编译所有模块
./mvnw clean test                       # 运行测试
./mvnw test -pl iam -am                 # 单模块测试
./mvnw test -Dtest=AuthServiceTest      # 单类测试
./mvnw clean package -DskipTests        # 打包 (输出: boot/target/)

# 后端启动 (端口 8080) - 推荐使用 jar 方式
./mvnw clean package -DskipTests && java -jar boot/target/*.jar --spring.profiles.active=dev

# 前端
cd web && npm install && npm run dev    # 启动 (端口 5173)
cd web && npm run build                 # 构建
```

**测试账户**: `admin` / `123456`

## Architecture Notes

**Entity 基类**
- `AuditableEntity` 提供 `createdTime`, `updatedTime`, `createdBy`, `updatedBy`

**API 响应格式**
- REST 控制器统一返回 `com.assoc.common.Result<?>`
- 业务异常使用 `common/` 中的异常层次

**Spring Boot 3.x 分页数据格式** (重要)
```json
{
  "data": {
    "content": [...],
    "page": {
      "size": 10,
      "number": 0,
      "totalElements": 14,
      "totalPages": 2
    }
  }
}
```
前端 `Page<T>` 类型需匹配此嵌套结构: `{ content: T[]; page: PageMetadata }`

## 多模块开发注意事项

**Maven 类缓存问题**: 修改非 boot 模块代码后，`mvn spring-boot:run` 可能使用旧的类文件（从 `~/.m2` 缓存加载）。

解决方案：
- **推荐**: `mvn clean package -DskipTests` 后用 `java -jar` 运行
- 或: `mvn clean install -DskipTests` 后再 `mvn spring-boot:run`
- 验证编译: `javap -public target/classes/com/assoc/xxx/XxxController.class`

## Coding Conventions

- 四空格缩进，包名 `com.assoc.<module>`
- 使用 Lombok 简化 DTO/Entity
- Flyway 脚本: `src/main/resources/db/migration/{module}/`
- 配置集中在 `boot/`，使用 `@ConditionalOnProperty` 做条件配置

## Database

- PostgreSQL (Docker): `jdbc:postgresql://localhost:5432/assoc`
- 用户名/密码: `assoc` / `assoc`

## Commit Style

短小、祈使语气: `Add member management module`, `Fix pagination display issue`
