# 🚀 快速开始本地开发

## 📖 文档

- **完整开发指南**: 查看 [`DEVELOPMENT.md`](./DEVELOPMENT.md)
- **快速启动脚本**: 使用 `dev-start.sh`

## ⚡ 快速启动

### 1. 检查环境

```bash
./dev-start.sh check
```

### 2. 安装依赖（首次运行）

```bash
./dev-start.sh install
```

### 3. 启动开发环境

#### 推荐方式：同时启动前后端（使用 tmux）

```bash
./dev-start.sh both
```

这会在 tmux 会话中同时启动前后端服务。

**tmux 常用快捷键：**
- `Ctrl+b d` - 分离会话（服务继续运行）
- `Ctrl+b n` - 切换到下一个窗口
- `Ctrl+b p` - 切换到上一个窗口
- `Ctrl+b 0` - 切换到后端窗口
- `Ctrl+b 1` - 切换到前端窗口

**重新连接到会话：**
```bash
tmux attach -t new-api-dev
```

**停止所有服务：**
```bash
tmux kill-session -t new-api-dev
```

#### 方式二：手动启动（需要两个终端）

**终端 1 - 启动后端：**
```bash
./dev-start.sh backend
```

**终端 2 - 启动前端：**
```bash
./dev-start.sh frontend
```

#### 方式三：构建后启动

```bash
./dev-start.sh build
```

构建前端并启动后端，访问 http://localhost:3000

## 🌐 访问地址

- **前端开发服务器**: http://localhost:5173 （支持热重载）
- **后端 API 服务**: http://localhost:3000
- **生产模式**: http://localhost:3000 （需先构建前端）

## 🔧 其他命令

```bash
# 显示帮助
./dev-start.sh help

# 清理构建产物
./dev-start.sh clean
```

## 📝 开发流程

1. **首次启动**：
   ```bash
   ./dev-start.sh check    # 检查环境
   ./dev-start.sh install  # 安装依赖
   ./dev-start.sh both     # 启动开发环境
   ```

2. **日常开发**：
   ```bash
   ./dev-start.sh both     # 启动前后端
   # 修改代码，前端自动热重载
   # 后端修改需要重启服务（Ctrl+C 后重新运行）
   ```

3. **提交代码前**：
   ```bash
   cd web
   bun run lint:fix        # 格式化前端代码
   ```

## ⚙️ 环境配置

编辑 `.env` 文件配置后端：

```bash
# 复制示例配置
cp .env.example .env

# 编辑配置
nano .env
```

**常用配置：**
```env
# 端口
PORT=3000

# 开发模式
GIN_MODE=debug

# 数据库（默认 SQLite，无需配置）
# SQL_DSN=postgres://user:pass@localhost/dbname

# Redis（可选）
# REDIS_CONN_STRING=redis://localhost:6379

# 内存缓存（无 Redis 时推荐）
MEMORY_CACHE_ENABLED=true
```

## 🐛 故障排查

### Go 未安装

```bash
# 安装 Go
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc
```

### tmux 未安装

```bash
# 安装 tmux
sudo apt update
sudo apt install tmux
```

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :3000
lsof -i :5173

# 或修改端口
# 后端：编辑 .env 中的 PORT
# 前端：bun run dev --port 5174
```

### 依赖安装失败

```bash
# Go 依赖问题
go env -w GOPROXY=https://goproxy.cn,direct
go mod download

# 前端依赖问题
cd web
rm -rf node_modules bun.lock
bun install
```

## 📚 更多信息

详细的开发指南、配置说明、数据库设置等，请查看：

- **完整文档**: [`DEVELOPMENT.md`](./DEVELOPMENT.md)
- **官方文档**: https://docs.newapi.pro/
- **API 文档**: https://docs.newapi.pro/api

---

**祝开发愉快！** 🎉

如有问题，请查看 [Issues](https://github.com/Calcium-Ion/new-api/issues)
