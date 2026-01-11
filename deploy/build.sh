#!/bin/bash

# Association Hub - 自动构建脚本
# 用于构建后端和前端并准备部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEPLOY_DIR="$PROJECT_ROOT/deploy"

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Association Hub 构建脚本${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# 函数：显示使用说明
function show_help() {
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  all       构建后端和前端（默认）"
    echo "  backend   仅构建后端"
    echo "  frontend  仅构建前端"
    echo "  clean     清理构建产物"
    echo "  help      显示此帮助信息"
    echo ""
}

# 函数：构建后端
function build_backend() {
    echo -e "${YELLOW}>>> 构建后端 Spring Boot 应用...${NC}"
    cd "$PROJECT_ROOT"

    if [ ! -f "mvnw" ]; then
        echo -e "${RED}错误: 找不到 mvnw 文件${NC}"
        exit 1
    fi

    ./mvnw clean package -DskipTests

    # 复制 JAR 文件
    mkdir -p "$DEPLOY_DIR/apps"
    JAR_FILE=$(find "$PROJECT_ROOT/boot/target" -name "*.jar" -type f | head -1)

    if [ -z "$JAR_FILE" ]; then
        echo -e "${RED}错误: 未找到构建的 JAR 文件${NC}"
        exit 1
    fi

    cp "$JAR_FILE" "$DEPLOY_DIR/apps/wp.jar"
    echo -e "${GREEN}✓ 后端构建完成: wp.jar${NC}"

    # 复制生产配置文件
    mkdir -p "$DEPLOY_DIR/conf"
    PROD_CONFIG="$PROJECT_ROOT/boot/src/main/resources/application-prod.yml"
    if [ -f "$PROD_CONFIG" ]; then
        cp "$PROD_CONFIG" "$DEPLOY_DIR/conf/application-prod.yml"
        echo -e "${GREEN}✓ 生产配置文件已复制${NC}"
    else
        echo -e "${YELLOW}⚠ 警告: 未找到 application-prod.yml${NC}"
    fi
    echo ""
}

# 函数：构建前端
function build_frontend() {
    echo -e "${YELLOW}>>> 构建前端 React 应用...${NC}"
    cd "$PROJECT_ROOT/web"

    if [ ! -f "package.json" ]; then
        echo -e "${RED}错误: 找不到 package.json 文件${NC}"
        exit 1
    fi

    # 检查并安装依赖
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装依赖...${NC}"
        npm install
    fi

    # 构建前端
    npm run build

    # 复制构建产物
    mkdir -p "$DEPLOY_DIR/apps/web"
    rm -rf "$DEPLOY_DIR/apps/web"/*
    cp -r dist/* "$DEPLOY_DIR/apps/web/"

    echo -e "${GREEN}✓ 前端构建完成: apps/web/${NC}"
    echo ""
}

# 函数：清理构建产物
function clean_build() {
    echo -e "${YELLOW}>>> 清理构建产物...${NC}"

    # 清理后端
    cd "$PROJECT_ROOT"
    ./mvnw clean

    # 清理前端
    cd "$PROJECT_ROOT/web"
    rm -rf dist node_modules

    # 清理部署目录
    rm -rf "$DEPLOY_DIR/apps/wp.jar"
    rm -rf "$DEPLOY_DIR/apps/web"
    rm -rf "$DEPLOY_DIR/conf/application-prod.yml"

    echo -e "${GREEN}✓ 清理完成${NC}"
    echo ""
}

# 主逻辑
COMMAND=${1:-all}

case $COMMAND in
    all)
        build_backend
        build_frontend
        echo -e "${GREEN}================================${NC}"
        echo -e "${GREEN}构建完成！${NC}"
        echo -e "${GREEN}================================${NC}"
        echo ""
        echo "下一步："
        echo "  cd deploy"
        echo "  docker-compose up -d"
        echo ""
        echo "访问地址："
        echo "  前端: http://localhost"
        echo "  后端: http://localhost:8009"
        ;;
    backend)
        build_backend
        ;;
    frontend)
        build_frontend
        ;;
    clean)
        clean_build
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}未知命令: $COMMAND${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
