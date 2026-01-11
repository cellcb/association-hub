# 配置说明文档

## 配置架构

### 1. Spring Boot 配置层次

```
application.yml (开发环境 - 本地开发)
├── 数据库: localhost:5432/assoc
├── Elasticsearch: localhost:9200
└── 嵌入服务: localhost:8081

application-prod.yml (生产环境 - Docker 部署)
├── 数据库: db:5432/assoc
├── Elasticsearch: elasticsearch:9200
└── 嵌入服务: embed:80
```

### 2. 配置文件位置

**源文件**:
- `boot/src/main/resources/application.yml` (开发环境)
- `boot/src/main/resources/application-prod.yml` (生产环境)

**部署文件** (构建时自动生成):
- `deploy/conf/application-prod.yml`

**容器挂载**:
- 宿主机: `./conf/application-prod.yml`
- 容器内: `/app/config/application-prod.yml`

### 3. 配置优先级

Spring Boot 配置优先级（从高到低）：

1. **环境变量** (通过 docker-compose.yml 设置)
2. **外部配置文件** (`/app/config/application-prod.yml`)
3. **JAR 内部配置** (`application.yml`)

## 数据库配置

### Docker Compose 配置

```yaml
db:
  environment:
    POSTGRES_DB: assoc      # 数据库名
    POSTGRES_USER: assoc    # 用户名
    POSTGRES_PASSWORD: assoc # 密码
```

### Spring Boot 配置

**application-prod.yml**:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://db:5432/assoc
    username: ${DB_USERNAME:assoc}
    password: ${DB_PASSWORD:assoc}
```

### 修改数据库密码

**方法 1: 使用 .env 文件**
```bash
# 创建 .env 文件
cat > .env << EOF
POSTGRES_PASSWORD=your_secure_password
DB_PASSWORD=your_secure_password
EOF
```

**方法 2: 修改 docker-compose.yml**
```yaml
db:
  environment:
    POSTGRES_PASSWORD: your_secure_password

backend:
  environment:
    DB_PASSWORD: your_secure_password
```

## JVM 配置

### 默认配置

```yaml
backend:
  environment:
    JAVA_OPTS: -Xms512m -Xmx1024m -XX:+UseG1GC
```

### 性能调优

**小型部署** (1-10 用户):
```bash
JAVA_OPTS=-Xms256m -Xmx512m -XX:+UseG1GC
```

**中型部署** (10-100 用户):
```bash
JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC
```

**大型部署** (100+ 用户):
```bash
JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
```

## 文件存储配置

### 默认路径 (容器内)

```yaml
kb:
  file:
    upload-path: /app/data/kb/files

system:
  file:
    upload-path: /app/data/system/files
```

### 修改存储路径

**使用环境变量**:
```bash
# .env 文件
KB_FILE_UPLOAD_PATH=/custom/path/kb
SYSTEM_FILE_UPLOAD_PATH=/custom/path/system
```

**挂载宿主机目录**:
```yaml
backend:
  volumes:
    - /host/path/data:/app/data
```

## 服务依赖配置

### Elasticsearch

**默认配置**:
```yaml
kb:
  elasticsearch:
    hosts: http://elasticsearch:9200
    index-prefix: kb_chunks_
    indexing-analyzer: ik_max_word
    search-analyzer: ik_smart
```

**修改 Elasticsearch 地址**:
```bash
# .env 文件
KB_ES_HOSTS=http://your-es-host:9200
```

### 嵌入模型服务

**默认配置**:
```yaml
kb:
  embedding:
    api:
      base-url: http://embed:80
      model: bge-small-zh-1.5
```

**使用外部嵌入服务**:
```bash
# .env 文件
KB_EMBEDDING_API_BASE_URL=http://external-embed-service:8081
```

## 日志配置

### 默认日志级别

```yaml
logging:
  level:
    root: INFO
    com.assoc: INFO
    org.hibernate.SQL: WARN
```

### 修改日志级别

**调试模式**:
```bash
# .env 文件
ROOT_LOG_LEVEL=DEBUG
APP_LOG_LEVEL=DEBUG
SQL_LOG_LEVEL=DEBUG
```

**生产模式**:
```bash
# .env 文件
ROOT_LOG_LEVEL=WARN
APP_LOG_LEVEL=INFO
SQL_LOG_LEVEL=WARN
```

## 安全配置

### JWT 配置

**默认配置**:
```yaml
jwt:
  secret: assoc-platform-jwt-secret-key-must-be-at-least-256-bits-long-for-HS256
  access-token-expiration: 7200000  # 2 小时
  refresh-token-expiration: 604800000  # 7 天
```

**生产环境建议**:
```bash
# 生成随机密钥
openssl rand -base64 64

# .env 文件
JWT_SECRET=your-randomly-generated-secret-key-at-least-256-bits
JWT_ACCESS_TOKEN_EXPIRATION=3600000  # 1 小时
JWT_REFRESH_TOKEN_EXPIRATION=2592000000  # 30 天
```

## API 文档配置

### Swagger UI

**默认配置**:
```yaml
springdoc:
  swagger-ui:
    enabled: true
    path: /docs
```

**生产环境关闭 Swagger**:
```bash
# .env 文件
SWAGGER_UI_ENABLED=false
API_DOCS_ENABLED=false
```

## 环境变量完整列表

### 数据库
- `POSTGRES_DB` - 数据库名（默认: assoc）
- `POSTGRES_USER` - 数据库用户（默认: assoc）
- `POSTGRES_PASSWORD` - 数据库密码（默认: assoc）
- `DB_USERNAME` - Spring Boot 数据库用户
- `DB_PASSWORD` - Spring Boot 数据库密码

### JVM
- `JAVA_OPTS` - JVM 启动参数

### 应用
- `SPRING_PROFILES_ACTIVE` - Spring Boot Profile（默认: prod）
- `SERVER_PORT` - 服务器端口（默认: 8080）
- `CONTEXT_PATH` - 上下文路径（默认: 空）

### 文件存储
- `KB_FILE_UPLOAD_PATH` - 知识库文件路径
- `SYSTEM_FILE_UPLOAD_PATH` - 系统文件路径
- `KB_FILE_MAX_SIZE` - 文件最大大小（字节）

### 安全
- `JWT_SECRET` - JWT 密钥
- `JWT_ACCESS_TOKEN_EXPIRATION` - 访问令牌过期时间（毫秒）
- `JWT_REFRESH_TOKEN_EXPIRATION` - 刷新令牌过期时间（毫秒）

### 日志
- `ROOT_LOG_LEVEL` - 根日志级别
- `APP_LOG_LEVEL` - 应用日志级别
- `SQL_LOG_LEVEL` - SQL 日志级别

### Elasticsearch
- `KB_ES_HOSTS` - Elasticsearch 主机地址
- `KB_ES_INDEX_PREFIX` - 索引前缀

### AI 模型
- `KB_EMBEDDING_API_BASE_URL` - 嵌入模型 API 地址

### 通知
- `NOTIFICATION_EMAIL_ENABLED` - 启用邮件通知
- `NOTIFICATION_SMS_ENABLED` - 启用短信通知
- `NOTIFICATION_WECHAT_ENABLED` - 启用微信通知

### API 文档
- `API_DOCS_ENABLED` - 启用 API 文档
- `SWAGGER_UI_ENABLED` - 启用 Swagger UI

## 配置验证

### 检查配置是否生效

```bash
# 1. 查看环境变量
docker compose exec backend env | grep -E "SPRING_PROFILES_ACTIVE|DB_|JAVA_OPTS"

# 2. 查看配置文件
docker compose exec backend cat /app/config/application-prod.yml

# 3. 查看数据库连接
docker compose exec db psql -U assoc -d assoc -c "SELECT version();"

# 4. 查看 JVM 参数
docker compose exec backend ps aux | grep java

# 5. 测试健康检查
curl http://localhost:8009/actuator/health
```

## 故障排查

### 配置未生效

**症状**: 应用启动后使用的是错误的配置

**排查步骤**:
1. 检查 Profile 是否正确: `docker compose exec backend env | grep SPRING_PROFILES_ACTIVE`
2. 检查配置文件是否挂载: `docker compose exec backend ls -la /app/config/`
3. 检查环境变量优先级: 环境变量会覆盖配置文件
4. 查看应用日志: `docker compose logs backend`

### 数据库连接失败

**症状**: 应用无法连接数据库

**排查步骤**:
1. 检查数据库是否启动: `docker compose ps db`
2. 检查数据库健康: `docker compose exec db pg_isready -U assoc -d assoc`
3. 检查连接配置: `docker compose exec wp env | grep DATASOURCE`
4. 查看数据库日志: `docker compose logs db`

### 文件上传失败

**症状**: 文件上传返回错误

**排查步骤**:
1. 检查存储路径: `docker compose exec backend ls -la /app/data/`
2. 检查权限: `docker compose exec backend ls -ld /app/data/`
3. 检查配置: `docker compose exec backend env | grep FILE_UPLOAD_PATH`
4. 查看应用日志: `docker compose logs backend | grep -i upload`

## 最佳实践

1. **不要在配置文件中硬编码敏感信息** - 使用环境变量
2. **生产环境使用强密码** - 修改默认的数据库和 JWT 密钥
3. **合理设置 JVM 内存** - 根据服务器资源调整
4. **定期备份数据** - 数据库和文件存储
5. **监控日志** - 及时发现问题
6. **关闭不必要的功能** - 如生产环境的 Swagger UI
7. **使用 HTTPS** - 生产环境配置 SSL 证书
8. **限制访问** - 配置防火墙规则
