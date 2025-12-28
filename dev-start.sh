#!/bin/bash

# New API 本地开发环境快速启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
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

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 未安装！请先安装 $1"
        echo "查看 DEVELOPMENT.md 了解安装方法"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    cat << EOF
${GREEN}New API 本地开发环境启动脚本${NC}

用法:
    ./dev-start.sh [选项]

选项:
    backend         仅启动后端服务
    frontend        仅启动前端开发服务器
    both            同时启动前后端（在新终端中）
    build           构建前端并启动后端
    install         安装前后端依赖
    clean           清理构建产物和依赖
    check           检查开发环境
    help            显示此帮助信息

示例:
    ./dev-start.sh backend          # 启动后端
    ./dev-start.sh frontend         # 启动前端
    ./dev-start.sh both             # 同时启动（推荐）
    ./dev-start.sh install          # 安装依赖
    ./dev-start.sh check            # 检查环境

EOF
}

# 检查开发环境
check_environment() {
    print_info "检查开发环境..."

    local has_error=0

    # 检查 Go
    if command -v go &> /dev/null; then
        GO_VERSION=$(go version | awk '{print $3}')
        print_success "Go 已安装: $GO_VERSION"
    else
        print_error "Go 未安装"
        has_error=1
    fi

    # 检查 Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js 已安装: $NODE_VERSION"
    else
        print_warning "Node.js 未安装（如果使用 Bun 可忽略）"
    fi

    # 检查 Bun
    if command -v bun &> /dev/null; then
        BUN_VERSION=$(bun --version)
        print_success "Bun 已安装: v$BUN_VERSION"
    else
        print_warning "Bun 未安装"
        if ! command -v npm &> /dev/null; then
            print_error "npm 也未安装，至少需要安装 Bun 或 npm 之一"
            has_error=1
        else
            NPM_VERSION=$(npm --version)
            print_success "npm 已安装: v$NPM_VERSION"
        fi
    fi

    # 检查数据库文件
    if [ -f "./one-api.db" ] || [ -f "./data/oneapi.db" ]; then
        print_success "SQLite 数据库文件存在"
    else
        print_info "SQLite 数据库文件不存在（首次启动会自动创建）"
    fi

    # 检查 .env 文件
    if [ -f ".env" ]; then
        print_success ".env 文件存在"
    else
        print_warning ".env 文件不存在"
        if [ -f ".env.example" ]; then
            print_info "可以从 .env.example 复制: cp .env.example .env"
        fi
    fi

    if [ $has_error -eq 1 ]; then
        print_error "环境检查失败，请先安装必要的工具"
        echo "查看 DEVELOPMENT.md 了解详细安装步骤"
        exit 1
    else
        print_success "环境检查通过！"
    fi
}

# 安装依赖
install_dependencies() {
    print_info "安装项目依赖..."

    # 后端依赖
    print_info "下载 Go 依赖..."
    check_command go
    go mod download
    print_success "Go 依赖安装完成"

    # 前端依赖
    print_info "安装前端依赖..."
    cd web

    if command -v bun &> /dev/null; then
        print_info "使用 Bun 安装依赖..."
        bun install
    elif command -v npm &> /dev/null; then
        print_info "使用 npm 安装依赖..."
        npm install
    else
        print_error "Bun 和 npm 都未安装"
        exit 1
    fi

    cd ..
    print_success "前端依赖安装完成"
}

# 启动后端
start_backend() {
    print_info "启动后端服务..."
    check_command go

    # 检查 .env 文件
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        print_warning ".env 文件不存在，从 .env.example 复制"
        cp .env.example .env
        print_success "已创建 .env 文件"
    fi

    # 确保数据目录存在
    mkdir -p data logs

    export GIN_MODE=debug
    print_success "后端服务启动中..."
    print_info "访问地址: ${GREEN}http://localhost:3000${NC}"
    print_info "按 Ctrl+C 停止服务"
    echo ""

    go run main.go
}

# 启动前端
start_frontend() {
    print_info "启动前端开发服务器..."

    cd web

    # 检查依赖是否已安装
    if [ ! -d "node_modules" ]; then
        print_warning "依赖未安装，正在安装..."
        if command -v bun &> /dev/null; then
            bun install
        else
            check_command npm
            npm install
        fi
    fi

    print_success "前端开发服务器启动中..."
    print_info "访问地址: ${GREEN}http://localhost:5173${NC}"
    print_info "API 代理到: http://localhost:3000"
    print_info "按 Ctrl+C 停止服务"
    echo ""

    if command -v bun &> /dev/null; then
        bun run dev
    else
        check_command npm
        npm run dev
    fi
}

# 同时启动前后端
start_both() {
    print_info "同时启动前后端开发环境..."

    # 检查是否在 tmux 或 screen 中
    if command -v tmux &> /dev/null; then
        print_info "使用 tmux 启动前后端..."

        # 创建新的 tmux 会话
        SESSION="new-api-dev"

        # 如果会话已存在，先关闭
        tmux has-session -t $SESSION 2>/dev/null && tmux kill-session -t $SESSION

        # 创建新会话并启动后端
        tmux new-session -d -s $SESSION -n backend
        tmux send-keys -t $SESSION:backend "cd $(pwd) && ./dev-start.sh backend" C-m

        # 创建新窗口启动前端
        tmux new-window -t $SESSION -n frontend
        tmux send-keys -t $SESSION:frontend "cd $(pwd) && ./dev-start.sh frontend" C-m

        print_success "前后端已在 tmux 会话中启动"
        print_info "使用 'tmux attach -t $SESSION' 连接到会话"
        print_info "使用 'tmux kill-session -t $SESSION' 停止所有服务"
        print_info ""
        print_info "tmux 快捷键:"
        print_info "  Ctrl+b d     - 分离会话（服务继续运行）"
        print_info "  Ctrl+b n     - 切换到下一个窗口"
        print_info "  Ctrl+b p     - 切换到上一个窗口"
        print_info "  Ctrl+b 0-9   - 切换到指定窗口"
        print_info ""

        # 连接到会话
        sleep 2
        tmux attach -t $SESSION

    else
        print_warning "tmux 未安装"
        print_info "请手动在两个终端中分别运行:"
        echo ""
        echo "  终端 1: ./dev-start.sh backend"
        echo "  终端 2: ./dev-start.sh frontend"
        echo ""
        print_info "或安装 tmux: sudo apt install tmux"
    fi
}

# 构建前端并启动
build_and_start() {
    print_info "构建前端..."

    cd web

    # 检查依赖
    if [ ! -d "node_modules" ]; then
        print_warning "依赖未安装，正在安装..."
        if command -v bun &> /dev/null; then
            bun install
        else
            check_command npm
            npm install
        fi
    fi

    # 构建前端
    if command -v bun &> /dev/null; then
        DISABLE_ESLINT_PLUGIN=true bun run build
    else
        check_command npm
        DISABLE_ESLINT_PLUGIN=true npm run build
    fi

    print_success "前端构建完成"

    cd ..

    # 启动后端
    start_backend
}

# 清理
clean() {
    print_warning "清理构建产物和依赖..."

    read -p "确定要清理吗？这将删除 node_modules 和构建产物 (y/N): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "清理前端..."
        rm -rf web/node_modules
        rm -rf web/dist
        rm -rf web/bun.lock
        rm -rf web/package-lock.json

        print_info "清理日志..."
        rm -rf logs/*

        print_success "清理完成"
    else
        print_info "已取消清理"
    fi
}

# 主函数
main() {
    # 显示标题
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   New API 本地开发环境启动脚本   ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════╝${NC}"
    echo ""

    # 如果没有参数，显示帮助
    if [ $# -eq 0 ]; then
        show_help
        exit 0
    fi

    # 处理命令
    case "$1" in
        backend)
            check_environment
            start_backend
            ;;
        frontend)
            check_environment
            start_frontend
            ;;
        both)
            check_environment
            start_both
            ;;
        build)
            check_environment
            build_and_start
            ;;
        install)
            check_environment
            install_dependencies
            ;;
        clean)
            clean
            ;;
        check)
            check_environment
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
