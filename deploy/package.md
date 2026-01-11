# 打包说明

## 说明
应用目录：apps
- `apps/wp.jar` - 后端 Spring Boot 应用
- `apps/web/` - 前端构建产物（由 Vite 生成）

脚本目录：bin
应用配置：conf
- `conf/nginx.conf` - Nginx 反向代理配置
- `conf/application-prod.yml` - Spring Boot 生产环境配置

docker镜像：images
docker compose 配置：docker-compose.yml

## 服务说明
- **db**: PostgreSQL 数据库 (端口 5432)
  - 数据库名: `assoc`
  - 用户名: `assoc`
  - 密码: `assoc`
- **backend**: Spring Boot 后端服务 (端口 8009 映射到容器 8080)
  - 使用 `prod` profile
  - JVM 参数: `-Xms512m -Xmx1024m -XX:+UseG1GC`
- **elasticsearch**: 搜索引擎 (端口 9200)
  - 包含 IK 中文分词插件
- **embed**: 嵌入模型服务 (端口 8081)
  - 模型: BAAI/bge-small-zh-v1.5
- **nginx**: Web 服务器，提供前端页面并代理后端 API (端口 80)

## 构建步骤

### 1. 构建后端
```bash
cd /path/to/association-hub
./mvnw clean package -DskipTests
cp boot/target/*.jar deploy/apps/wp.jar
```

### 2. 构建前端
```bash
cd /path/to/association-hub/web
npm install
npm run build
cp -r dist/* ../deploy/apps/web/
```

### 3. 部署
```bash
cd /path/to/association-hub/deploy
docker-compose up -d
```

访问应用：
- 前端：http://localhost
- 后端 API：http://localhost/api (由 nginx 代理到后端)
- 直接访问后端：http://localhost:8009

### 4. 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f nginx
docker-compose logs -f backend

# Nginx 日志文件
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log
```

## 打包（旧方式）
```
cd /icp/bin/
./service.sh export_images
./service.sh package
```
