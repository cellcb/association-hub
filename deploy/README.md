# Association Hub 部署指南

## 快速开始

### 前提条件
- Docker 和 Docker Compose
- (可选) Node.js 18+ 和 Maven 3.8+ (如需本地构建)

### 一键构建和部署

```bash
# 1. 构建应用（后端 + 前端）
./build.sh all

# 2. 快速启动（自动检查并启动服务）
./start.sh
```

### 手动部署

```bash
# 1. 构建应用
./build.sh all

# 2. (可选) 自定义配置
cp .env.example .env
# 编辑 .env 文件，修改数据库密码等配置

# 3. 启动所有服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

### 访问应用

**本地开发环境（默认端口）**：
- **前端**: http://localhost:8003
- **后端 API**: http://localhost:8003/api (通过 Nginx 代理)
- **后端直连**: http://localhost:8004
- **数据库**: localhost:8005

**远程部署环境**：
- 端口映射已优化为 8003/8004/8005，详见下方"远程部署"章节

### 默认账号

- 用户名: `admin`
- 密码: `123456`

## 远程部署

### 一键部署到远程服务器

使用 `remote-deploy.sh` 脚本可以自动完成构建、打包、传输和部署：

```bash
# 默认部署到 1.92.215.158:/opt/assoc
./remote-deploy.sh

# 自定义服务器地址
./remote-deploy.sh --host 192.168.1.100 --user ubuntu --dir /opt/assoc

# 跳过构建，仅传输和部署（用于快速更新配置）
./remote-deploy.sh --no-build

# 查看帮助信息
./remote-deploy.sh --help
```

### 远程部署端口映射

远程部署使用以下端口映射（已优化）：

| 端口 | 服务 | 用途 | 访问示例 |
|------|------|------|----------|
| **8003** | Nginx | 前端 + API 统一入口 | `http://1.92.215.158:8003` |
| **8004** | Backend | 后端直连（健康检查/调试） | `http://1.92.215.158:8004/actuator/health` |
| **8005** | PostgreSQL | 数据库直连（备份/调试） | `psql -h 1.92.215.158 -p 8005 -U assoc` |

### 手动远程部署步骤

如果需要手动部署：

```bash
# 1. 本地构建
./build.sh all

# 2. 打包部署文件
tar czf deploy.tar.gz apps/ conf/ docker-compose.yml .env initdb/

# 3. 上传到远程服务器
scp deploy.tar.gz root@1.92.215.158:/opt/assoc/

# 4. 登录远程服务器
ssh root@1.92.215.158

# 5. 解压并启动
cd /opt/assoc
tar xzf deploy.tar.gz
docker-compose down
docker-compose up -d

# 6. 查看服务状态
docker-compose ps
docker-compose logs -f
```

### 远程部署注意事项

**部署前准备**：
1. 确保远程服务器已安装 Docker 和 Docker Compose
2. 确保防火墙开放端口：8003（前端）、8004（后端）、8005（数据库）
3. 配置 SSH 密钥认证（推荐）或准备好密码

**生产环境安全配置**：
1. **修改 `.env` 文件中的敏感信息**：
   ```bash
   # 修改数据库密码
   POSTGRES_PASSWORD=<强密码>
   DB_PASSWORD=<强密码>

   # 生成新的 JWT 密钥
   JWT_SECRET=$(openssl rand -base64 64)
   ```

2. **关闭开发功能**（在 `.env` 中添加）：
   ```bash
   API_DOCS_ENABLED=false
   SWAGGER_UI_ENABLED=false
   ```

3. **修改默认管理员密码**：
   - 登录系统后在用户管理中修改

**数据备份**：
```bash
# 在远程服务器上备份数据库
ssh root@1.92.215.158 "cd /opt/assoc && docker-compose exec -T db pg_dump -U assoc assoc" > backup_$(date +%Y%m%d).sql

# 备份应用数据
ssh root@1.92.215.158 "cd /opt/assoc && tar czf appdata_backup.tar.gz -C /var/lib/docker/volumes assoc_appdata"
```

---

**📘 更详细的远程部署指南**：查看 **[REMOTE-DEPLOYMENT.md](./REMOTE-DEPLOYMENT.md)** 获取：
- 完整的部署原理和架构说明
- start-services.sh 脚本详解
- 常见问题排查和解决方案
- 安全加固和性能优化建议
- 监控、备份和维护指南

---

## 配置说明

### Spring Boot Profile

部署使用 `prod` profile，配置文件：
- 源文件: `boot/src/main/resources/application-prod.yml`
- 容器挂载: `conf/application-prod.yml` -> `/app/config/application-prod.yml`

**数据库配置**:
- 数据库名: `assoc`
- 用户名: `assoc`
- 密码: `assoc`（生产环境建议修改）

**服务依赖**（使用 Docker 服务名）:
- 数据库: `db:5432`

### 环境变量覆盖

可通过 `.env` 文件或修改 `docker-compose.yml` 覆盖配置：

```bash
# 创建 .env 文件
cat > .env << EOF
# 数据库密码
DB_PASSWORD=your_secure_password

# JVM 参数
JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC

# 文件上传路径
KB_FILE_UPLOAD_PATH=/app/data/kb/files
SYSTEM_FILE_UPLOAD_PATH=/app/data/system/files
EOF
```

## 服务架构

```
┌─────────────────────────────────────────────┐
│          Nginx (Port 8003:80)               │
│  - 静态文件服务 (React 前端)                │
│  - API 反向代理 (/api -> backend:8080)      │
└───────────────┬─────────────────────────────┘
                │
                ├──> 静态文件: /usr/share/nginx/html
                │
                └──> API 请求: backend:8080
                        │
        ┌───────────────┴───────────────┐
        │  Spring Boot (Port 8004:8080) │
        │  - REST API                   │
        │  - 业务逻辑                   │
        │  - Profile: prod              │
        └───────────────┬───────────────┘
                        │
                        ▼
                ┌──────────────┐
                │ PostgreSQL   │
                │ (Port 8005)  │
                │ DB: assoc    │
                └──────────────┘
```

## 构建选项

```bash
# 仅构建后端
./build.sh backend

# 仅构建前端
./build.sh frontend

# 清理构建产物
./build.sh clean
```

## 手动构建

### 后端
```bash
cd ..
./mvnw clean package -DskipTests
cp boot/target/*.jar deploy/apps/wp.jar
```

### 前端
```bash
cd ../web
npm install
npm run build
cp -r dist/* ../deploy/apps/web/
```

## 服务管理

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart nginx
docker-compose restart backend

# 查看特定服务日志
docker-compose logs -f nginx
docker-compose logs -f backend
docker-compose logs -f db

# 进入容器
docker-compose exec backend bash
docker-compose exec nginx sh
docker-compose exec db psql -U assoc -d assoc
```

## 目录结构

```
deploy/
├── apps/                    # 应用文件
│   ├── wp.jar              # 后端 JAR 包
│   └── web/                # 前端构建产物
├── bin/                     # 脚本工具
├── conf/                    # 配置文件
│   └── nginx.conf          # Nginx 配置
├── docker/                  # Docker 构建文件
├── initdb/                  # 数据库初始化脚本
├── logs/                    # 日志目录
│   └── nginx/              # Nginx 日志
├── build.sh                # 构建脚本
├── docker-compose.yml      # Docker Compose 配置
└── README.md               # 本文件
```

## 数据持久化

数据保存在 Docker volumes 中：
- `pgdata`: PostgreSQL 数据
- `esdata`: Elasticsearch 数据
- `appdata`: 应用数据（文件上传、知识库等）
  - `/app/data/kb/files`: 知识库文件
  - `/app/data/system/files`: 系统文件（logo、icon 等）

查看 volumes:
```bash
docker volume ls | grep deploy

# 备份数据库
docker-compose exec db pg_dump -U assoc assoc > backup_$(date +%Y%m%d).sql

# 查看应用数据
docker-compose exec backend ls -la /app/data
```

## 故障排查

### 前端无法访问
```bash
# 检查 Nginx 容器
docker-compose logs nginx

# 检查前端文件是否存在
docker-compose exec nginx ls -la /usr/share/nginx/html

# 确保构建产物已复制
ls -la apps/web/
```

### 后端 API 错误
```bash
# 查看后端日志
docker-compose logs backend

# 检查数据库连接
docker-compose exec db psql -U assoc -d assoc -c "SELECT 1"

# 检查后端健康状态
curl http://localhost:8009/actuator/health
```

### 数据库连接失败
```bash
# 查看数据库日志
docker-compose logs db

# 等待数据库就绪
docker-compose exec db pg_isready -U assoc -d assoc

# 手动连接测试
docker-compose exec db psql -U assoc -d assoc
```

### 配置文件未生效
```bash
# 检查配置文件是否存在
ls -la conf/application-prod.yml

# 确保构建时复制了配置
./build.sh backend

# 查看容器内配置
docker-compose exec backend cat /app/config/application-prod.yml

# 验证 profile
docker-compose exec backend env | grep SPRING_PROFILES_ACTIVE
```

## 性能优化

### Nginx
- 已启用 gzip 压缩
- 静态资源缓存 1 年

### Spring Boot
调整 JVM 参数：
```yaml
# docker-compose.yml
wp:
  command: ["java", "-Xms512m", "-Xmx1024m", "-jar", "app.jar"]
```

## 安全建议

1. **修改默认密码**
   ```bash
   cp .env.example .env
   # 编辑 .env，修改 POSTGRES_PASSWORD 和 DB_PASSWORD
   # 修改 JWT_SECRET 为随机字符串
   ```

2. **生成安全的 JWT 密钥**
   ```bash
   openssl rand -base64 64
   # 将生成的密钥添加到 .env 的 JWT_SECRET
   ```

3. **生产环境关闭 Swagger UI**
   ```bash
   # 在 .env 中添加
   SWAGGER_UI_ENABLED=false
   API_DOCS_ENABLED=false
   ```

4. **启用 HTTPS** (配置 SSL 证书)
5. **配置防火墙规则**
6. **定期备份数据库**
7. **更新管理员密码**

## 常用脚本

- `./build.sh` - 构建应用（后端/前端）
- `./start.sh` - 快速启动服务（带检查）
- `docker-compose up -d` - 启动所有服务
- `docker-compose down` - 停止所有服务
- `docker-compose restart` - 重启服务
- `docker-compose logs -f` - 查看日志

## 更多信息

- **远程部署完整指南**: [REMOTE-DEPLOYMENT.md](./REMOTE-DEPLOYMENT.md) ⭐ 新增
- 构建和部署: [package.md](./package.md)
- 配置说明: [CONFIGURATION.md](./CONFIGURATION.md)
- API 访问机制: [API-ACCESS.md](./API-ACCESS.md)
- 环境变量示例: [.env.example](./.env.example)
