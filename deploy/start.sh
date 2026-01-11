#!/bin/bash

# Association Hub - 快速启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Association Hub 快速启动${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查必需文件
echo -e "${YELLOW}>>> 检查必需文件...${NC}"

MISSING_FILES=()

if [ ! -f "$DEPLOY_DIR/apps/wp.jar" ]; then
    MISSING_FILES+=("apps/wp.jar (后端应用)")
fi

if [ ! -d "$DEPLOY_DIR/apps/web" ] || [ -z "$(ls -A $DEPLOY_DIR/apps/web)" ]; then
    MISSING_FILES+=("apps/web (前端应用)")
fi

if [ ! -f "$DEPLOY_DIR/conf/application-prod.yml" ]; then
    MISSING_FILES+=("conf/application-prod.yml (生产配置)")
fi

if [ ! -f "$DEPLOY_DIR/conf/nginx.conf" ]; then
    MISSING_FILES+=("conf/nginx.conf (Nginx 配置)")
fi

if [ ${#MISSING_FILES[@]} -ne 0 ]; then
    echo -e "${RED}错误: 缺少必需文件:${NC}"
    for file in "${MISSING_FILES[@]}"; do
        echo -e "  ${RED}✗${NC} $file"
    done
    echo ""
    echo -e "${YELLOW}请先运行构建脚本:${NC}"
    echo -e "  ${GREEN}./build.sh all${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ 所有必需文件检查通过${NC}"
echo ""

# 检查 .env 文件
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    echo -e "${YELLOW}⚠ 未找到 .env 文件，使用默认配置${NC}"
    echo -e "${YELLOW}  可复制 .env.example 为 .env 并自定义配置${NC}"
    echo ""
fi

# 检查 Docker 和 Docker Compose
echo -e "${YELLOW}>>> 检查 Docker 环境...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: 未找到 Docker${NC}"
    echo -e "${YELLOW}请先安装 Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: 未找到 Docker Compose${NC}"
    echo -e "${YELLOW}请先安装 Docker Compose${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker 环境检查通过${NC}"
echo ""

# 停止旧容器（如果存在）
echo -e "${YELLOW}>>> 停止旧容器（如果存在）...${NC}"
cd "$DEPLOY_DIR"
docker compose down 2>/dev/null || true
echo ""

# 启动服务
echo -e "${YELLOW}>>> 启动服务...${NC}"
docker compose up -d

echo ""
echo -e "${YELLOW}>>> 等待服务启动...${NC}"
sleep 5

# 检查服务状态
echo ""
echo -e "${YELLOW}>>> 检查服务状态...${NC}"
docker compose ps

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}启动完成！${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo -e "  ${GREEN}前端:${NC} http://localhost"
echo -e "  ${GREEN}后端 API:${NC} http://localhost/api"
echo -e "  ${GREEN}后端直连:${NC} http://localhost:8009"
echo -e "  ${GREEN}API 文档:${NC} http://localhost:8009/docs"
echo ""
echo -e "${BLUE}默认账号:${NC}"
echo -e "  ${GREEN}用户名:${NC} admin"
echo -e "  ${GREEN}密码:${NC} 123456"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo -e "  ${GREEN}查看日志:${NC} docker compose logs -f"
echo -e "  ${GREEN}停止服务:${NC} docker compose down"
echo -e "  ${GREEN}重启服务:${NC} docker compose restart"
echo ""
