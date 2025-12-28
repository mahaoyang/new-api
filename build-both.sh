#!/bin/bash

# 构建双前端脚本

set -e

echo "================================"
echo "构建 New API 双前端版本"
echo "================================"

# 构建管理后台
echo ""
echo "[1/3] 构建管理后台前端 (web)..."
cd web
bun install
bun run build
cd ..

# 构建用户前端
echo ""
echo "[2/3] 构建用户前端 (web-user)..."
cd web-user
bun install
bun run build
cd ..

# 构建 Go 后端
echo ""
echo "[3/3] 构建 Go 后端..."
go build -ldflags "-s -w" -o new-api main.go

echo ""
echo "================================"
echo "✅ 构建完成!"
echo "================================"
echo ""
echo "运行: ./new-api"
echo ""
echo "访问:"
echo "  - 用户前端: http://localhost:3000/"
echo "  - 管理后台: http://localhost:3000/console"
echo ""
