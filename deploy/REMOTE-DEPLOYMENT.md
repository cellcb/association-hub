# 远程服务器部署指南

## 目录

- [部署概述](#部署概述)
- [部署方式](#部署方式)
- [方式一：自动化部署（推荐）](#方式一自动化部署推荐)
- [方式二：手动部署](#方式二手动部署)
- [部署原理](#部署原理)
- [故障排查](#故障排查)
- [常用管理命令](#常用管理命令)

---

## 部署概述

### 目标环境

- **服务器 IP**: 1.92.215.158
- **部署目录**: `/opt/assoc`
- **操作系统**: 华为云欧拉 (HCE 2.0)
- **Docker 版本**: 20.10.24

### 端口规划

| 端口 | 服务 | 用途 |
|------|------|------|
| **8003** | Nginx | 前端 + API 统一入口 |
| **8004** | Backend | 后端直连（健康检查/调试）|
| **8005** | PostgreSQL | 数据库直连（备份/调试）|

### 服务架构

```
外部访问 (1.92.215.158)
├─ :8003 → Nginx (前端静态文件 + API 反向代理)
├─ :8004 → Spring Boot (后端 API)
└─ :8005 → PostgreSQL (数据库)

Docker 内部网络 (assoc_default)
├─ nginx → 访问 backend:8080
└─ backend → 访问 db:5432
```

---

## 部署方式

### 两种部署方式对比

| 特性 | 方式一：remote-deploy.sh | 方式二：手动部署 |
|------|-------------------------|-----------------|
| **自动化程度** | 全自动 | 半自动 |
| **适用场景** | 初次部署、完整更新 | 快速重启、配置调整 |
| **本地依赖** | SSH、SCP、Tar | SSH |
| **构建** | 自动构建前后端 | 需提前构建 |
| **传输** | 自动打包上传 | 手动上传或已存在 |
| **启动方式** | 使用 start-services.sh | 直接执行 start-services.sh |
| **执行时间** | 5-10 分钟 | 1-2 分钟 |

---

## 方式一：自动化部署（推荐）

### 前提条件

1. **SSH 无密码登录**（推荐）：
   ```bash
   # 生成 SSH 密钥（如果没有）
   ssh-keygen -t rsa -b 4096

   # 复制公钥到远程服务器
   ssh-copy-id root@1.92.215.158

   # 测试连接
   ssh root@1.92.215.158 "echo 'SSH 连接成功'"
   ```

2. **本地已安装**：
   - Docker（用于构建）
   - Node.js 18+（用于构建前端）
   - Maven 3.8+（用于构建后端）

3. **远程服务器已安装**：
   - Docker 20.10+
   - Python 3.9+ 和 pip3（用于 docker-compose）

### 使用步骤

#### 1. 默认部署（全自动）

```bash
cd /path/to/association-hub/deploy
./remote-deploy.sh
```

**执行流程**：
1. ✅ 检查 SSH 连接
2. ✅ 构建后端（mvn clean package）
3. ✅ 构建前端（npm run build）
4. ✅ 打包部署文件（tar.gz）
5. ✅ 上传到远程服务器
6. ✅ 远程解压并启动服务

#### 2. 跳过构建（快速部署）

适用于仅修改配置文件的场景：

```bash
./remote-deploy.sh --no-build
```

#### 3. 自定义服务器

```bash
# 方式 1：使用命令行参数
./remote-deploy.sh --host 192.168.1.100 --user ubuntu --dir /opt/myapp

# 方式 2：使用环境变量
REMOTE_HOST=192.168.1.100 \
REMOTE_USER=ubuntu \
REMOTE_DIR=/opt/myapp \
./remote-deploy.sh
```

### 脚本参数说明

```bash
./remote-deploy.sh [选项]

选项：
  --no-build          跳过构建步骤，仅传输和启动
  --host HOST         远程服务器地址（默认: 1.92.215.158）
  --user USER         SSH 用户名（默认: root）
  --dir DIR           远程部署目录（默认: /opt/assoc）
  --port PORT         SSH 端口（默认: 22）
  --help              显示帮助信息
```

### 部署输出示例

```
╔════════════════════════════════════════════════════╗
║   Association Hub 远程部署脚本                     ║
╚════════════════════════════════════════════════════╝

[INFO] 目标服务器: root@1.92.215.158:22
[INFO] 部署目录:   /opt/assoc

==> 检查前置条件
[SUCCESS] 所有必需命令已安装
[SUCCESS] SSH 连接测试成功

==> 构建应用程序
[INFO] 执行 ./build.sh all
[SUCCESS] 应用构建成功
[SUCCESS] 构建产物验证通过

==> 打包部署文件
[SUCCESS] 部署包创建成功 (大小: 57M)

==> 传输文件到远程服务器
[SUCCESS] 文件传输成功

==> 在远程服务器上部署应用
✅ 服务启动完成！

访问地址：
  前端: http://1.92.215.158:8003
  后端: http://1.92.215.158:8004/actuator/health
  数据库: 1.92.215.158:8005
```

---

## 方式二：手动部署

### 适用场景

- 远程服务器已有部署文件，仅需重启
- 配置文件已修改，快速应用更改
- 调试和测试环境

### 部署步骤

#### 1. 本地构建（如需更新应用）

```bash
cd /path/to/association-hub/deploy
./build.sh all
```

#### 2. 上传文件到服务器（如需更新应用）

```bash
# 方式 A：打包上传
tar czf deploy.tar.gz apps/ conf/ docker-compose.yml .env initdb/
scp deploy.tar.gz root@1.92.215.158:/opt/assoc/

# SSH 到服务器解压
ssh root@1.92.215.158
cd /opt/assoc
tar xzf deploy.tar.gz
rm deploy.tar.gz

# 方式 B：仅上传更新的文件
# 更新后端
scp apps/wp.jar root@1.92.215.158:/opt/assoc/apps/

# 更新前端
scp -r apps/web/* root@1.92.215.158:/opt/assoc/apps/web/

# 更新配置
scp conf/nginx.conf root@1.92.215.158:/opt/assoc/conf/
scp conf/application-prod.yml root@1.92.215.158:/opt/assoc/conf/
scp .env root@1.92.215.158:/opt/assoc/
```

#### 3. 启动服务

```bash
# SSH 到服务器
ssh root@1.92.215.158

# 执行启动脚本
/opt/assoc/start-services.sh
```

**或者一行命令执行**：

```bash
ssh root@1.92.215.158 '/opt/assoc/start-services.sh'
```

### 启动脚本输出

```
等待数据库启动...
等待后端启动...

✅ 服务启动完成！

访问地址：
  前端: http://1.92.215.158:8003
  后端: http://1.92.215.158:8004/actuator/health
  数据库: 1.92.215.158:8005

默认登录: admin / 123456
```

---

## 部署原理

### start-services.sh 工作流程

这是核心启动脚本，使用**原生 Docker 命令**替代 docker-compose。

#### 为什么不用 docker-compose？

远程服务器的 docker-compose (v1.29.2) 存在以下兼容性问题：

1. **docker-py 版本冲突**：
   ```
   TypeError: kwargs_from_env() got an unexpected keyword argument 'ssl_version'
   ```
   - 解决：降级 `docker` 到 5.0.3

2. **urllib3 不支持 Docker socket**：
   ```
   URLSchemeUnknown: Not supported URL scheme http+docker
   ```
   - 解决：降级 `urllib3` 到 1.26.20，安装 `requests-unixsocket`

3. **容器间网络通信失败**：
   ```
   UnknownHostException: db
   ```
   - 解决：使用 `--network-alias` 设置网络别名

#### 脚本执行流程

```bash
#!/bin/bash
set -e  # 遇到错误立即退出
cd /opt/assoc

# 步骤 1: 清理旧环境
docker stop assoc-db assoc-backend assoc-nginx 2>/dev/null || true
docker rm assoc-db assoc-backend assoc-nginx 2>/dev/null || true
docker network rm assoc_default 2>/dev/null || true

# 步骤 2: 创建网络和卷
docker network create assoc_default
docker volume create assoc_pgdata     # 数据库数据持久化
docker volume create assoc_appdata    # 应用数据持久化

# 步骤 3: 启动数据库
docker run -d \
  --name assoc-db \
  --network assoc_default \
  --network-alias db \              # ⭐ 关键：其他容器通过 "db:5432" 访问
  -p 8005:5432 \
  -e POSTGRES_DB=assoc \
  -e POSTGRES_USER=assoc \
  -e POSTGRES_PASSWORD=assoc \
  -v assoc_pgdata:/var/lib/postgresql/data \
  -v /opt/assoc/initdb:/docker-entrypoint-initdb.d \
  postgres:17

sleep 20  # 等待数据库完全启动

# 步骤 4: 启动后端
docker run -d \
  --name assoc-backend \
  --network assoc_default \
  --network-alias backend \         # ⭐ 关键：Nginx 通过 "backend:8080" 访问
  -p 8004:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC" \
  -v /opt/assoc/apps/wp.jar:/app/app.jar \
  -v /opt/assoc/conf/application-prod.yml:/app/config/application-prod.yml:ro \
  -v assoc_appdata:/app/data \
  openjdk:17-jdk-slim \
  sh -c "java \$JAVA_OPTS -jar app.jar"

sleep 15  # 等待后端完全启动

# 步骤 5: 启动 Nginx
docker run -d \
  --name assoc-nginx \
  --network assoc_default \
  -p 8003:80 \
  -v /opt/assoc/apps/web:/usr/share/nginx/html:ro \
  -v /opt/assoc/conf/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  nginx:alpine
```

#### 关键技术点

1. **网络别名 (--network-alias)**：
   - 让容器在 Docker 网络中通过友好名称访问
   - `--network-alias db` → 其他容器可通过 `db:5432` 连接数据库
   - `--network-alias backend` → Nginx 可通过 `http://backend:8080` 访问后端

2. **数据持久化 (Docker Volumes)**：
   - `assoc_pgdata`：PostgreSQL 数据（即使容器删除，数据保留）
   - `assoc_appdata`：上传文件、知识库等应用数据

3. **只读挂载 (:ro)**：
   - 防止容器内进程修改配置文件
   - 例如：`-v /opt/assoc/conf/nginx.conf:/etc/nginx/conf.d/default.conf:ro`

4. **依赖等待 (sleep)**：
   - 数据库启动后等待 20 秒
   - 后端启动后等待 15 秒
   - 简单但有效的依赖管理

### 容器间通信原理

```
┌─────────────────────────────────────────────────┐
│         Docker Network: assoc_default           │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐                               │
│  │ assoc-nginx  │                               │
│  │              │                               │
│  │ 通过 nginx.conf 配置：                       │
│  │ proxy_pass http://backend:8080/api/          │
│  └──────┬───────┘                               │
│         │                                       │
│         ▼                                       │
│  ┌──────────────┐      网络别名: backend       │
│  │ assoc-       │◄─────────────────────────────│
│  │ backend      │                               │
│  │              │                               │
│  │ 通过 application-prod.yml 配置：             │
│  │ url: jdbc:postgresql://db:5432/assoc         │
│  └──────┬───────┘                               │
│         │                                       │
│         ▼                                       │
│  ┌──────────────┐      网络别名: db            │
│  │ assoc-db     │◄─────────────────────────────│
│  │              │                               │
│  └──────────────┘                               │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 故障排查

### 问题 1: SSH 连接失败

**症状**：
```
ssh: connect to host 1.92.215.158 port 22: Connection refused
```

**解决**：
1. 检查服务器 IP 和端口：
   ```bash
   ping 1.92.215.158
   telnet 1.92.215.158 22
   ```

2. 检查 SSH 密钥：
   ```bash
   ssh -v root@1.92.215.158  # 查看详细日志
   ```

3. 临时使用密码登录：
   ```bash
   ssh -o PubkeyAuthentication=no root@1.92.215.158
   ```

---

### 问题 2: 容器启动失败

**症状**：
```bash
docker ps  # 看不到某个容器
```

**排查步骤**：

1. **查看容器日志**：
   ```bash
   docker logs assoc-db
   docker logs assoc-backend
   docker logs assoc-nginx
   ```

2. **查看所有容器（包括停止的）**：
   ```bash
   docker ps -a
   ```

3. **检查容器退出原因**：
   ```bash
   docker inspect assoc-backend | grep -A 10 State
   ```

4. **常见错误**：

   **后端无法连接数据库**：
   ```
   java.net.UnknownHostException: db
   ```
   - 原因：网络别名未设置
   - 解决：确保使用 `--network-alias db` 启动数据库

   **端口被占用**：
   ```
   Error response from daemon: driver failed programming external connectivity on endpoint
   ```
   - 原因：端口 8003/8004/8005 已被占用
   - 解决：
     ```bash
     # 查找占用端口的进程
     netstat -tlnp | grep -E '8003|8004|8005'
     # 或
     lsof -i :8003

     # 停止占用端口的容器
     docker stop <container_id>
     ```

---

### 问题 3: 数据库初始化失败

**症状**：
后端日志显示表不存在：
```
PSQLException: ERROR: relation "xxx" does not exist
```

**排查步骤**：

1. **检查初始化脚本是否执行**：
   ```bash
   docker logs assoc-db | grep -i "init"
   ```

2. **手动连接数据库检查**：
   ```bash
   docker exec -it assoc-db psql -U assoc -d assoc

   # 在 psql 中：
   \dt  # 查看所有表
   ```

3. **如需重新初始化**：
   ```bash
   # 删除数据卷
   docker volume rm assoc_pgdata

   # 重新启动服务
   /opt/assoc/start-services.sh
   ```

---

### 问题 4: 前端无法访问

**症状**：
访问 http://1.92.215.158:8003 返回 404 或 502

**排查步骤**：

1. **检查 Nginx 容器状态**：
   ```bash
   docker logs assoc-nginx
   ```

2. **检查前端文件是否存在**：
   ```bash
   docker exec assoc-nginx ls -la /usr/share/nginx/html
   ```

   应该看到：
   ```
   index.html
   assets/
   ```

3. **检查 Nginx 配置**：
   ```bash
   docker exec assoc-nginx cat /etc/nginx/conf.d/default.conf
   docker exec assoc-nginx nginx -t  # 测试配置
   ```

4. **手动测试**：
   ```bash
   # 在服务器上测试
   curl http://localhost:8003
   curl http://localhost:8003/api/public/configs/site
   ```

---

### 问题 5: API 请求失败 (502 Bad Gateway)

**症状**：
前端可以访问，但 API 请求返回 502

**排查步骤**：

1. **检查后端是否运行**：
   ```bash
   docker ps | grep assoc-backend
   curl http://localhost:8004/actuator/health
   ```

2. **检查 Nginx 到后端的连接**：
   ```bash
   docker exec assoc-nginx ping backend
   docker exec assoc-nginx wget -O- http://backend:8080/actuator/health
   ```

3. **检查后端日志**：
   ```bash
   docker logs -f --tail 100 assoc-backend
   ```

---

## 常用管理命令

### 查看服务状态

```bash
# 查看所有容器
ssh root@1.92.215.158 'docker ps'

# 查看容器详细信息
ssh root@1.92.215.158 'docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'

# 查看资源使用情况
ssh root@1.92.215.158 'docker stats --no-stream'
```

### 查看日志

```bash
# 实时查看后端日志
ssh root@1.92.215.158 'docker logs -f assoc-backend'

# 查看最近 100 行日志
ssh root@1.92.215.158 'docker logs --tail 100 assoc-backend'

# 查看所有服务日志
ssh root@1.92.215.158 'docker logs assoc-db && docker logs assoc-backend && docker logs assoc-nginx'
```

### 重启服务

```bash
# 重启所有服务
ssh root@1.92.215.158 '/opt/assoc/start-services.sh'

# 仅重启单个服务
ssh root@1.92.215.158 'docker restart assoc-backend'
ssh root@1.92.215.158 'docker restart assoc-nginx'
```

### 停止服务

```bash
# 停止所有服务
ssh root@1.92.215.158 'docker stop assoc-nginx assoc-backend assoc-db'

# 停止并删除容器
ssh root@1.92.215.158 'docker stop assoc-nginx assoc-backend assoc-db && docker rm assoc-nginx assoc-backend assoc-db'
```

### 数据库管理

```bash
# 连接数据库
ssh root@1.92.215.158 'docker exec -it assoc-db psql -U assoc -d assoc'

# 从本地连接远程数据库
psql -h 1.92.215.158 -p 8005 -U assoc -d assoc

# 备份数据库
ssh root@1.92.215.158 'docker exec assoc-db pg_dump -U assoc assoc' > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
cat backup.sql | ssh root@1.92.215.158 'docker exec -i assoc-db psql -U assoc -d assoc'
```

### 更新应用

```bash
# 仅更新后端
cd /path/to/association-hub/deploy
./build.sh backend
scp apps/wp.jar root@1.92.215.158:/opt/assoc/apps/
ssh root@1.92.215.158 'docker restart assoc-backend'

# 仅更新前端
cd /path/to/association-hub/deploy
./build.sh frontend
scp -r apps/web/* root@1.92.215.158:/opt/assoc/apps/web/
ssh root@1.92.215.158 'docker restart assoc-nginx'

# 更新配置文件
scp conf/nginx.conf root@1.92.215.158:/opt/assoc/conf/
ssh root@1.92.215.158 'docker restart assoc-nginx'
```

### 清理资源

```bash
# 清理停止的容器
ssh root@1.92.215.158 'docker container prune -f'

# 清理未使用的镜像
ssh root@1.92.215.158 'docker image prune -a -f'

# 清理未使用的卷
ssh root@1.92.215.158 'docker volume prune -f'

# 查看磁盘使用
ssh root@1.92.215.158 'docker system df'
```

---

## 安全加固

### 1. 修改默认密码

**管理员账户**：
1. 访问 http://1.92.215.158:8003
2. 使用 `admin` / `123456` 登录
3. 进入"用户管理" → 修改密码

**数据库密码**：
```bash
ssh root@1.92.215.158

# 编辑环境变量
vi /opt/assoc/.env

# 修改以下行（选择强密码）：
POSTGRES_PASSWORD=<强密码>
DB_PASSWORD=<强密码>

# 由于数据库已初始化，需要：
# 1. 停止所有服务
docker stop assoc-nginx assoc-backend assoc-db

# 2. 删除数据库卷（会清空数据！）
docker volume rm assoc_pgdata

# 3. 重新启动（会使用新密码初始化）
/opt/assoc/start-services.sh
```

### 2. 生成安全的 JWT 密钥

```bash
# 生成随机密钥
openssl rand -base64 64

# SSH 到服务器
ssh root@1.92.215.158

# 编辑配置
vi /opt/assoc/.env

# 修改 JWT_SECRET 为生成的密钥
JWT_SECRET=<生成的随机密钥>

# 重启后端
docker restart assoc-backend
```

### 3. 配置防火墙

```bash
ssh root@1.92.215.158

# 查看当前规则
firewall-cmd --list-all

# 确保只开放必要端口
firewall-cmd --permanent --add-port=22/tcp    # SSH
firewall-cmd --permanent --add-port=8003/tcp  # 前端
firewall-cmd --permanent --add-port=8004/tcp  # 后端
firewall-cmd --permanent --add-port=8005/tcp  # 数据库
firewall-cmd --reload
```

### 4. 配置容器自动重启

修改 `/opt/assoc/start-services.sh`，在每个 `docker run` 命令中添加：

```bash
--restart=unless-stopped
```

例如：
```bash
docker run -d \
  --name assoc-db \
  --restart=unless-stopped \  # 添加这一行
  --network assoc_default \
  ...
```

---

## 性能优化

### 调整 JVM 内存

根据服务器资源调整 `/opt/assoc/start-services.sh` 中的 `JAVA_OPTS`：

```bash
# 小型部署 (1-10 用户，1-2GB 内存)
-e JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

# 中型部署 (10-100 用户，2-4GB 内存) - 默认
-e JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"

# 大型部署 (100+ 用户，4GB+ 内存)
-e JAVA_OPTS="-Xms1g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200"
```

### 配置 Nginx 缓存

在 `/opt/assoc/conf/nginx.conf` 中已配置：
- Gzip 压缩
- 静态资源缓存 1 年
- 安全头部

如需调整，修改配置后重启 Nginx：
```bash
docker restart assoc-nginx
```

---

## 监控和维护

### 定期备份

**创建备份脚本** `/opt/assoc/backup.sh`：

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
docker exec assoc-db pg_dump -U assoc assoc > $BACKUP_DIR/db_$DATE.sql

# 备份应用数据
docker run --rm -v assoc_appdata:/data -v $BACKUP_DIR:/backup alpine \
  tar czf /backup/appdata_$DATE.tar.gz -C /data .

# 删除 7 天前的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "备份完成: $BACKUP_DIR"
```

**配置定时任务**：
```bash
# 编辑 crontab
crontab -e

# 添加每天凌晨 2 点备份
0 2 * * * /opt/assoc/backup.sh >> /var/log/assoc-backup.log 2>&1
```

### 日志管理

**查看日志大小**：
```bash
docker exec assoc-backend du -sh /var/log
```

**配置日志轮转**（在 `application-prod.yml` 中）：
```yaml
logging:
  file:
    max-size: 10MB
    max-history: 30
```

---

## 附录

### 远程服务器文件结构

```
/opt/assoc/
├── apps/
│   ├── wp.jar                      # 后端 JAR 包 (57MB)
│   └── web/                        # 前端静态文件
│       ├── index.html
│       └── assets/
├── conf/
│   ├── application-prod.yml        # Spring Boot 生产配置
│   └── nginx.conf                  # Nginx 配置
├── initdb/                          # 数据库初始化脚本
│   └── V*.sql
├── docker-compose.yml               # Docker Compose 配置（未使用）
├── .env                             # 环境变量
└── start-services.sh                # ⭐ 启动脚本（推荐使用）
```

### Docker 资源

```bash
# 卷 (Volumes)
assoc_pgdata    - PostgreSQL 数据
assoc_appdata   - 应用数据（文件上传等）

# 网络 (Networks)
assoc_default   - 容器间通信网络

# 容器 (Containers)
assoc-db        - PostgreSQL 17
assoc-backend   - OpenJDK 17
assoc-nginx     - Nginx Alpine
```

### 访问地址汇总

| 服务 | 地址 | 说明 |
|------|------|------|
| **前端主页** | http://1.92.215.158:8003 | 主要访问入口 |
| **API 接口** | http://1.92.215.158:8003/api/* | 通过 Nginx 代理 |
| **后端健康检查** | http://1.92.215.158:8004/actuator/health | 返回 {"status":"UP"} |
| **API 文档** | http://1.92.215.158:8004/docs | Swagger UI（建议生产环境关闭）|
| **数据库** | 1.92.215.158:8005 | PostgreSQL 直连 |

**默认登录**：
- 用户名: `admin`
- 密码: `123456` （部署后请立即修改）

---

## 相关文档

- [部署指南](./README.md)
- [配置说明](./CONFIGURATION.md)
- [API 访问机制](./API-ACCESS.md)
- [打包说明](./package.md)

---

## 更新日志

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-01-11 | 1.0.0 | 初始版本，支持远程服务器部署 |

---

**文档维护**: 如有问题或改进建议，请更新本文档。
