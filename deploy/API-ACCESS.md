# 前端访问后端 API 说明

## API 访问架构

前端访问后端 API 的方式在**开发环境**和**生产环境**中有所不同。

## 开发环境（本地开发）

### 配置：Vite 代理

**文件**: `web/vite.config.ts`

```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### 访问流程

```
浏览器访问: http://localhost:5173/api/iam/auth/login
    ↓
Vite 开发服务器拦截 /api 请求
    ↓
代理转发到: http://localhost:8080/api/iam/auth/login
    ↓
Spring Boot 后端处理请求
    ↓
返回响应给浏览器
```

### 工作原理

1. **前端代码**使用相对路径 `/api`：
   ```typescript
   // web/src/lib/api.ts
   const API_BASE = '/api';
   const response = await fetch(`${API_BASE}/iam/auth/login`, {...});
   // 实际请求: /api/iam/auth/login
   ```

2. **Vite 开发服务器**监听 `localhost:5173`，拦截所有 `/api` 开头的请求

3. **代理转发**到后端服务器 `http://localhost:8080`

4. **解决跨域问题**：`changeOrigin: true` 修改请求头的 Origin

### 优势

- ✅ 前端代码不需要硬编码后端地址
- ✅ 自动解决跨域问题（CORS）
- ✅ 开发体验好，无需额外配置

### 启动方式

```bash
# 终端 1: 启动后端（端口 8080）
cd /path/to/association-hub
./mvnw spring-boot:run

# 终端 2: 启动前端（端口 5173）
cd /path/to/association-hub/web
npm run dev
```

访问：http://localhost:5173

---

## 生产环境（Docker 部署）

### 配置：Nginx 反向代理

**文件**: `deploy/conf/nginx.conf`

```nginx
server {
    listen 80;

    # 前端静态文件
    root /usr/share/nginx/html;

    # API 代理到后端
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 访问流程

```
浏览器访问: http://localhost/api/iam/auth/login
    ↓
Nginx 服务器（端口 80）接收请求
    ↓
匹配 location /api/ 规则
    ↓
代理转发到: http://backend:8080/api/iam/auth/login
    ↓
Spring Boot 后端（Docker 容器）处理请求
    ↓
返回响应 → Nginx → 浏览器
```

### 工作原理

1. **前端构建产物**部署到 Nginx：
   ```
   deploy/apps/web/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.js
   │   └── index-xxx.css
   └── ...
   ```

2. **前端代码**仍使用相对路径 `/api`：
   ```typescript
   // 构建后的代码
   fetch('/api/iam/auth/login', {...})
   ```

3. **Nginx 反向代理**：
   - 静态文件请求 (`/`, `/assets/*`) → 直接返回文件
   - API 请求 (`/api/*`) → 转发到 `backend:8080`

4. **Docker 内部通信**：
   - `backend` 是 Docker Compose 中的服务名
   - 在 Docker 网络中解析为后端容器的 IP
   - 端口 8080 是容器内部端口

### 优势

- ✅ 前后端统一域名，无跨域问题
- ✅ 单一入口，便于管理和监控
- ✅ Nginx 提供静态文件缓存、Gzip 压缩
- ✅ 可添加 SSL、限流、安全策略等

### 部署方式

```bash
# 1. 构建前后端
cd /path/to/association-hub/deploy
./build.sh all

# 2. 启动服务
./start.sh

# 或手动启动
docker-compose up -d
```

访问：http://localhost

---

## API 调用实现

### 核心代码：`web/src/lib/api.ts`

#### 1. API 基础路径

```typescript
const API_BASE = '/api';  // 所有 API 请求的基础路径
```

#### 2. 通用请求函数

```typescript
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<Result<T>> {
  const url = `${API_BASE}${endpoint}`;
  const token = getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  return response.json();
}
```

#### 3. 自动 Token 刷新

```typescript
// 如果 401 且有 refresh token，自动刷新
if (response.status === 401 && getRefreshToken()) {
  const refreshed = await tryRefreshToken();
  if (refreshed) {
    // 重试原请求
    const retryResponse = await fetch(url, {...});
    return retryResponse.json();
  }
}
```

#### 4. API 调用示例

```typescript
// 登录
export async function login(credentials: LoginRequest) {
  const response = await fetch(`${API_BASE}/iam/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return response.json();
}

// 获取用户信息（需要 Token）
export async function getUserInfo() {
  return request('/iam/auth/userinfo');
}

// 获取会员列表（需要 Token）
export async function getMembers(params?: PageParams) {
  const query = buildPageParams(params);
  return request(`/admin/members${query ? `?${query}` : ''}`);
}
```

---

## 环境对比总结

| 特性 | 开发环境 | 生产环境 |
|-----|---------|---------|
| **前端服务器** | Vite Dev Server (5173) | Nginx (80) |
| **后端服务器** | Spring Boot (8080) | Docker Backend (8080) |
| **代理方式** | Vite Proxy | Nginx Reverse Proxy |
| **前端地址** | http://localhost:5173 | http://localhost |
| **API 请求** | /api → localhost:8080 | /api → backend:8080 |
| **跨域处理** | Vite Proxy | Nginx (同源) |
| **文件位置** | web/src/ (源码) | deploy/apps/web/ (构建) |

---

## 请求路径映射

### 示例：登录请求

**前端代码**:
```typescript
fetch('/api/iam/auth/login', {
  method: 'POST',
  body: JSON.stringify({ username: 'admin', password: '123456' })
})
```

**开发环境**:
```
浏览器: http://localhost:5173/api/iam/auth/login
         ↓ (Vite Proxy)
后端:   http://localhost:8080/api/iam/auth/login
         ↓ (Spring Boot Controller)
处理:   @PostMapping("/api/iam/auth/login")
```

**生产环境**:
```
浏览器: http://localhost/api/iam/auth/login
         ↓ (Nginx)
后端:   http://backend:8080/api/iam/auth/login
         ↓ (Spring Boot Controller)
处理:   @PostMapping("/api/iam/auth/login")
```

---

## 常见问题

### Q1: 为什么开发环境需要代理？

**A**: 因为浏览器的同源策略（CORS）限制：
- 前端：`http://localhost:5173`
- 后端：`http://localhost:8080`
- 不同端口视为不同源，直接请求会被浏览器阻止

Vite 代理在服务端转发请求，绕过浏览器的 CORS 检查。

### Q2: 生产环境为什么不需要代理配置？

**A**: 因为前后端在同一个域名下：
- 所有请求都发往 `http://localhost`
- Nginx 根据路径规则分发：
  - `/api/*` → 转发到后端
  - 其他 → 返回前端文件

### Q3: 如何修改后端地址？

**开发环境**:
```typescript
// web/vite.config.ts
proxy: {
  '/api': {
    target: 'http://new-backend-url:8080',
    changeOrigin: true,
  },
}
```

**生产环境**:
```nginx
# deploy/conf/nginx.conf
location /api/ {
    proxy_pass http://new-backend:8080/api/;
}
```

### Q4: 如何查看实际请求地址？

**浏览器开发者工具**:
1. 打开 F12 → Network 标签
2. 执行 API 请求
3. 查看请求的 URL 和响应

**开发环境**:
- 请求 URL: `http://localhost:5173/api/iam/auth/login`
- 实际转发: `http://localhost:8080/api/iam/auth/login`

**生产环境**:
- 请求 URL: `http://localhost/api/iam/auth/login`
- 实际转发: `http://backend:8080/api/iam/auth/login` (容器内部)

---

## 调试技巧

### 开发环境调试

```bash
# 查看 Vite 代理日志
npm run dev
# 会显示代理请求信息

# 测试后端直接访问
curl http://localhost:8080/api/iam/auth/login

# 测试前端代理访问
curl http://localhost:5173/api/iam/auth/login
```

### 生产环境调试

```bash
# 查看 Nginx 日志
docker-compose logs -f nginx

# 查看 Nginx 访问日志
tail -f deploy/logs/nginx/access.log

# 查看 Nginx 错误日志
tail -f deploy/logs/nginx/error.log

# 测试 Nginx 配置
docker-compose exec nginx nginx -t

# 进入容器测试后端连接
docker-compose exec nginx wget -O- http://backend:8080/api/actuator/health
```

---

## 安全考虑

### Token 存储

```typescript
// 使用 localStorage 存储 JWT Token
localStorage.setItem('accessToken', token);

// 每次请求自动携带
headers['Authorization'] = `Bearer ${token}`;
```

### 自动刷新机制

```typescript
// 401 时自动刷新 token
if (response.status === 401 && getRefreshToken()) {
  const refreshed = await tryRefreshToken();
  if (refreshed) {
    // 重试原请求
  } else {
    // 跳转登录页
  }
}
```

### 生产环境建议

1. **启用 HTTPS**：修改 Nginx 配置添加 SSL 证书
2. **添加请求限流**：防止 API 滥用
3. **配置 CORS**：后端配置允许的来源
4. **Token 加密传输**：使用 HTTPS
5. **添加 API 网关**：统一认证、限流、监控

---

## 总结

### 核心原理

1. **前端代码统一使用相对路径** `/api`
2. **开发环境**: Vite 代理转发到本地后端
3. **生产环境**: Nginx 代理转发到 Docker 后端
4. **前端无需关心环境差异**，代理层自动处理

### 关键文件

- **前端 API**: `web/src/lib/api.ts`
- **Vite 配置**: `web/vite.config.ts`
- **Nginx 配置**: `deploy/conf/nginx.conf`
- **Docker 配置**: `deploy/docker-compose.yml`

### 设计优势

- ✅ **统一的 API 调用方式**，无需区分环境
- ✅ **自动跨域处理**，无需额外配置
- ✅ **灵活的后端切换**，只需修改代理配置
- ✅ **生产环境优化**，Nginx 提供缓存、压缩等功能
