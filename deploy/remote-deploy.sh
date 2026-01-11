#!/bin/bash

###############################################################################
# Association Hub 远程部署脚本
# 用途：自动构建、打包并部署到远程服务器
#
# 使用方法：
#   ./remote-deploy.sh              # 完整部署（构建+传输+启动）
#   ./remote-deploy.sh --no-build   # 跳过构建，仅传输和启动
#   ./remote-deploy.sh --help       # 显示帮助信息
###############################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
REMOTE_HOST="${REMOTE_HOST:-1.92.215.158}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_DIR="${REMOTE_DIR:-/opt/assoc}"
REMOTE_PORT="${REMOTE_PORT:-22}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ARCHIVE="deploy-$(date +%Y%m%d_%H%M%S).tar.gz"

# 功能函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${GREEN}==>${NC} ${BLUE}$1${NC}"
}

show_help() {
    cat << EOF
Association Hub 远程部署脚本

用法：
    $0 [选项]

选项：
    --no-build          跳过构建步骤，仅传输和启动
    --host HOST         远程服务器地址（默认: $REMOTE_HOST）
    --user USER         SSH 用户名（默认: $REMOTE_USER）
    --dir DIR           远程部署目录（默认: $REMOTE_DIR）
    --port PORT         SSH 端口（默认: $REMOTE_PORT）
    --help              显示此帮助信息

环境变量：
    REMOTE_HOST         远程服务器地址
    REMOTE_USER         SSH 用户名
    REMOTE_DIR          远程部署目录
    REMOTE_PORT         SSH 端口

示例：
    # 默认部署
    $0

    # 指定远程主机
    $0 --host 192.168.1.100 --user ubuntu

    # 跳过构建，仅部署
    $0 --no-build

    # 使用环境变量
    REMOTE_HOST=192.168.1.100 REMOTE_USER=ubuntu $0

EOF
    exit 0
}

# 检查前置条件
check_prerequisites() {
    print_step "检查前置条件"

    # 检查必要的命令
    local required_commands=("ssh" "scp" "tar")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            print_error "未找到必需的命令: $cmd"
            exit 1
        fi
    done
    print_success "所有必需命令已安装"

    # 测试 SSH 连接
    print_info "测试 SSH 连接到 ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}..."
    if ssh -p "$REMOTE_PORT" -o ConnectTimeout=10 -o BatchMode=yes "${REMOTE_USER}@${REMOTE_HOST}" "exit" 2>/dev/null; then
        print_success "SSH 连接测试成功"
    else
        print_warning "SSH 连接测试失败，可能需要密码或密钥配置"
        read -p "是否继续？(y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "用户取消操作"
            exit 1
        fi
    fi
}

# 本地构建
build_application() {
    print_step "构建应用程序"

    cd "$SCRIPT_DIR"

    if [ ! -f "./build.sh" ]; then
        print_error "未找到 build.sh 脚本"
        exit 1
    fi

    print_info "执行 ./build.sh all"
    if ./build.sh all; then
        print_success "应用构建成功"
    else
        print_error "应用构建失败"
        exit 1
    fi

    # 验证构建产物
    if [ ! -f "apps/wp.jar" ]; then
        print_error "后端构建产物 apps/wp.jar 不存在"
        exit 1
    fi

    if [ ! -d "apps/web" ] || [ -z "$(ls -A apps/web)" ]; then
        print_error "前端构建产物 apps/web/ 不存在或为空"
        exit 1
    fi

    print_success "构建产物验证通过"
}

# 打包部署文件
package_deployment() {
    print_step "打包部署文件"

    cd "$SCRIPT_DIR"

    print_info "创建部署归档: $DEPLOY_ARCHIVE"

    # 创建临时目录列表
    local files_to_pack=(
        "apps/"
        "conf/"
        "docker-compose.yml"
        "initdb/"
    )

    # 可选文件（如果存在则打包）
    [ -f ".env" ] && files_to_pack+=(".env")
    [ -d "logs" ] || mkdir -p logs/nginx

    # 创建压缩包
    if tar czf "$DEPLOY_ARCHIVE" "${files_to_pack[@]}" 2>/dev/null; then
        local archive_size=$(du -h "$DEPLOY_ARCHIVE" | cut -f1)
        print_success "部署包创建成功 (大小: $archive_size)"
    else
        print_error "创建部署包失败"
        exit 1
    fi
}

# 传输到远程服务器
transfer_to_remote() {
    print_step "传输文件到远程服务器"

    print_info "目标: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"

    # 在远程创建目录
    print_info "创建远程目录..."
    ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}" || {
        print_error "创建远程目录失败"
        exit 1
    }

    # 传输文件
    print_info "上传部署包 ($DEPLOY_ARCHIVE)..."
    if scp -P "$REMOTE_PORT" "$DEPLOY_ARCHIVE" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"; then
        print_success "文件传输成功"
    else
        print_error "文件传输失败"
        exit 1
    fi

    # 清理本地临时文件
    rm -f "$DEPLOY_ARCHIVE"
    print_info "已清理本地临时文件"
}

# 远程部署
deploy_on_remote() {
    print_step "在远程服务器上部署应用"

    print_info "连接到远程服务器执行部署..."

    ssh -p "$REMOTE_PORT" "${REMOTE_USER}@${REMOTE_HOST}" bash << EOF
set -e

echo "📂 进入部署目录: ${REMOTE_DIR}"
cd ${REMOTE_DIR}

echo "📦 解压部署包..."
tar xzf ${DEPLOY_ARCHIVE}

echo "🗑️  清理部署包..."
rm -f ${DEPLOY_ARCHIVE}

echo "🐳 检查 Docker 和 Docker Compose..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose 未安装"
    exit 1
fi

# 兼容处理：使用 docker compose 或 docker-compose
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

echo "🛑 停止旧容器..."
\$COMPOSE_CMD down || true

echo "🚀 启动新容器..."
\$COMPOSE_CMD up -d

echo "⏳ 等待服务启动..."
sleep 10

echo "📊 检查容器状态..."
\$COMPOSE_CMD ps

echo "✅ 部署完成！"
echo ""
echo "访问地址："
echo "  前端: http://${REMOTE_HOST}:8003"
echo "  后端: http://${REMOTE_HOST}:8004/actuator/health"
echo "  数据库: ${REMOTE_HOST}:8005"
EOF

    if [ $? -eq 0 ]; then
        print_success "远程部署成功"
    else
        print_error "远程部署失败"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    print_step "部署信息"

    cat << EOF

${GREEN}✅ 部署完成！${NC}

${BLUE}访问信息：${NC}
  🌐 前端主页:         http://${REMOTE_HOST}:8003
  🔌 API 接口:         http://${REMOTE_HOST}:8003/api/*
  💓 后端健康检查:     http://${REMOTE_HOST}:8004/actuator/health
  📚 API 文档:         http://${REMOTE_HOST}:8004/docs
  🗄️  数据库连接:       psql -h ${REMOTE_HOST} -p 8005 -U assoc -d assoc

${YELLOW}默认登录账户：${NC}
  用户名: admin
  密码:   123456 ${RED}(请立即修改)${NC}

${BLUE}常用命令：${NC}
  查看日志:   ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && docker-compose logs -f"
  重启服务:   ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && docker-compose restart"
  停止服务:   ssh ${REMOTE_USER}@${REMOTE_HOST} "cd ${REMOTE_DIR} && docker-compose down"

EOF
}

# 主流程
main() {
    local skip_build=false

    # 解析命令行参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-build)
                skip_build=true
                shift
                ;;
            --host)
                REMOTE_HOST="$2"
                shift 2
                ;;
            --user)
                REMOTE_USER="$2"
                shift 2
                ;;
            --dir)
                REMOTE_DIR="$2"
                shift 2
                ;;
            --port)
                REMOTE_PORT="$2"
                shift 2
                ;;
            --help)
                show_help
                ;;
            *)
                print_error "未知选项: $1"
                echo "使用 --help 查看帮助信息"
                exit 1
                ;;
        esac
    done

    echo "${BLUE}"
    echo "╔════════════════════════════════════════════════════╗"
    echo "║   Association Hub 远程部署脚本                     ║"
    echo "╚════════════════════════════════════════════════════╝"
    echo "${NC}"

    print_info "目标服务器: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}"
    print_info "部署目录:   ${REMOTE_DIR}"
    echo ""

    # 执行部署步骤
    check_prerequisites

    if [ "$skip_build" = false ]; then
        build_application
    else
        print_warning "跳过构建步骤"
    fi

    package_deployment
    transfer_to_remote
    deploy_on_remote
    show_deployment_info

    print_success "🎉 所有步骤已完成！"
}

# 脚本入口
main "$@"
