# IAM 模块 API 测试指南

本文档介绍如何使用 IntelliJ IDEA HTTP Client 来测试 IAM 模块的各种 API 功能。

## 文件结构

```
backend/iam/
├── http-client.env.json          # 环境配置文件
├── auth-api-test.http           # 认证管理 API 测试
├── permission-api-test.http     # 权限管理 API 测试  
├── role-api-test.http          # 角色管理 API 测试
├── department-api-test.http    # 部门管理 API 测试
└── HTTP_CLIENT_README.md       # 本文档
```

## 环境配置

### 1. 环境变量文件 (`http-client.env.json`)

```json
{
  "dev": {
    "baseUrl": "http://localhost:8080",
    "contentType": "application/json"
  },
  "test": {
    "baseUrl": "http://localhost:8081", 
    "contentType": "application/json"
  },
  "prod": {
    "baseUrl": "https://api.waterplatform.com",
    "contentType": "application/json"
  }
}
```

### 2. 选择环境

在 IntelliJ IDEA 中运行 HTTP 请求时，可以选择使用不同的环境：
- `dev`: 开发环境 (默认)
- `test`: 测试环境  
- `prod`: 生产环境

## 测试文件详情

### 1. 认证管理测试 (`auth-api-test.http`)

**功能范围：**
- 用户登录/登出
- 令牌验证和刷新
- 用户信息获取
- 安全性测试（XSS、SQL注入等）
- CORS 测试
- 错误处理测试

**主要测试用例：**
- ✅ 管理员登录
- ✅ 普通用户登录
- ✅ 错误凭证处理
- ✅ 令牌验证
- ✅ 令牌刷新
- ✅ 安全漏洞防护

**运行方式：**
```bash
# 在 IntelliJ IDEA 中运行整个文件
# 或者运行单个测试用例
```

### 2. 权限管理测试 (`permission-api-test.http`)

**功能范围：**
- 权限 CRUD 操作
- 权限字段验证
- 分页查询
- 错误处理

**主要测试用例：**
- ✅ 创建权限（有效数据、验证失败）
- ✅ 获取权限详情
- ✅ 权限列表分页查询
- ✅ 更新权限信息
- ✅ 删除权限
- ✅ 权限代码唯一性验证

**前置条件：**
需要先运行 `auth-api-test.http` 中的登录测试获取 `accessToken`

### 3. 角色管理测试 (`role-api-test.http`)

**功能范围：**
- 角色 CRUD 操作
- 角色权限管理（分配、添加、移除）
- 角色状态管理
- 复杂业务场景测试

**主要测试用例：**
- ✅ 创建角色（带权限、无权限）
- ✅ 获取角色详情和列表
- ✅ 更新角色信息
- ✅ 权限分配管理
- ✅ 权限操作（替换、添加、移除）
- ✅ 角色状态变更

**特殊功能：**
- 自动创建测试权限数据
- 完整的权限关联测试
- 自动清理测试数据

### 4. 部门管理测试 (`department-api-test.http`)

**功能范围：**
- 部门 CRUD 操作
- 部门层级结构管理
- 部门搜索功能
- 部门移动操作

**主要测试用例：**
- ✅ 创建部门（根部门、子部门）
- ✅ 获取部门详情（ID、编码）
- ✅ 部门树形结构查询
- ✅ 子部门查询
- ✅ 部门搜索（关键词、模糊匹配）
- ✅ 部门移动（父子关系调整）
- ✅ 部门删除（层级约束）

**特殊功能：**
- 完整的组织架构测试
- 循环引用检测
- 层级删除验证

## 使用指南

### 1. 快速开始

1. **启动后端服务**
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **运行认证测试**
   - 打开 `auth-api-test.http`
   - 运行第一个登录测试获取 token
   - Token 会自动保存到全局变量中

3. **运行其他测试**
   - 确保已获取有效的 `accessToken`
   - 选择需要测试的功能模块
   - 运行对应的测试文件

### 2. 测试顺序建议

```
1. auth-api-test.http (获取认证token)
   ↓
2. permission-api-test.http (权限基础数据)
   ↓  
3. role-api-test.http (角色和权限关联)
   ↓
4. department-api-test.http (组织架构)
```

### 3. 全局变量说明

测试过程中会自动设置以下全局变量：

**认证相关：**
- `accessToken`: 访问令牌
- `refreshToken`: 刷新令牌
- `userToken`: 普通用户令牌

**权限相关：**
- `testPermissionId`: 测试权限ID
- `userWritePermissionId`: 用户写入权限ID
- `userDeletePermissionId`: 用户删除权限ID

**角色相关：**
- `testRoleId`: 测试角色ID
- `roleWithPermissionsId`: 带权限的角色ID
- `adminRoleId`: 管理员角色ID

**部门相关：**
- `rootDeptId`: 根部门ID
- `childDeptId`: 子部门ID
- `hrDeptId`: 人事部ID

### 4. 错误处理

测试用例涵盖了各种错误场景：

- **认证错误**: 401 未授权
- **参数验证错误**: 400 请求参数错误
- **资源不存在**: 404 未找到
- **业务规则违反**: 400 业务逻辑错误
- **方法不支持**: 405 方法不允许

### 5. 最佳实践

1. **环境隔离**
   - 开发环境使用测试数据
   - 生产环境谨慎执行删除操作

2. **数据清理**
   - 每个测试文件都包含清理步骤
   - 建议在测试完成后运行清理测试

3. **并发测试**
   - 避免同时运行多个包含数据修改的测试
   - 可以并行运行只读查询测试

4. **错误诊断**
   - 查看 HTTP 响应状态码
   - 检查响应体中的错误信息
   - 验证请求参数格式

## 常见问题

### Q1: Token 过期怎么办？
A: 重新运行 `auth-api-test.http` 中的登录测试获取新的 token。

### Q2: 测试数据冲突怎么办？
A: 运行对应测试文件末尾的清理测试，或手动删除冲突数据。

### Q3: 权限不足错误怎么办？
A: 确保使用的是管理员账户登录获取的 token。

### Q4: 部门删除失败怎么办？
A: 按照层级顺序从子部门开始删除，最后删除父部门。

### Q5: 如何添加新的测试用例？
A: 参考现有测试用例的格式，添加相应的 HTTP 请求和断言逻辑。

## 技术支持

如果在测试过程中遇到问题，请检查：

1. 后端服务是否正常运行
2. 数据库连接是否正常
3. 环境配置是否正确
4. Token 是否有效
5. 请求参数是否符合 API 规范

更多详细信息请参考项目的 API 文档和源代码。