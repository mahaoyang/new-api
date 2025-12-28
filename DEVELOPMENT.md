# New API 本地开发环境启动指南

本指南适用于在 WSL/Linux 环境下进行本地开发。

## 📋 环境要求

### 必需软件

| 软件 | 版本要求 | 说明 |
|------|---------|------|
| **Go** | ≥ 1.21 | 后端开发语言 |
| **Node.js** | ≥ 18.x | 前端运行环境 |
| **Bun** | ≥ 1.0 | 前端包管理器（推荐）或使用 npm |

### 可选软件

| 软件 | 说明 |
|------|------|
| **SQLite** | 默认数据库，Go 自带驱动无需额外安装 |
| **PostgreSQL** | 可选的生产级数据库 |
| **MySQL** | 可选的数据库 |
| **Redis** | 可选的缓存服务，用于性能优化 |

## 🔧 安装开发环境

### 1. 安装 Go

```bash
# 下载 Go (以 1.23 为例)
wget https://go.dev/dl/go1.23.0.linux-amd64.tar.gz

# 解压到 /usr/local
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.23.0.linux-amd64.tar.gz

# 添加到 PATH (添加到 ~/.bashrc 或 ~/.zshrc)
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc

# 重新加载配置
source ~/.bashrc

# 验证安装
go version
```

### 2. 安装 Bun (如果尚未安装)

```bash
curl -fsSL https://bun.sh/install | bash

# 验证安装
bun --version
```

### 3. 配置 Go 代理 (可选，国内推荐)

```bash
go env -w GO111MODULE=on
go env -w GOPROXY=https://goproxy.cn,direct
```

## 🚀 启动项目

### 方式一：前后端分离开发 (推荐)

适合需要频繁修改前端代码的场景，支持热重载。

#### 1. 启动后端服务

```bash
# 在项目根目录
cd /home/ha/workspace/new-api

# 复制环境变量配置文件
cp .env.example .env

# 编辑 .env 文件 (可选，默认使用 SQLite)
# nano .env

# 下载 Go 依赖
go mod download

# 启动后端服务
go run main.go
```

后端服务将在 `http://localhost:3000` 启动。

#### 2. 启动前端开发服务器

打开新终端：

```bash
# 进入前端目录
cd /home/ha/workspace/new-api/web

# 安装依赖 (首次运行)
bun install

# 启动前端开发服务器
bun run dev
```

前端开发服务器将在 `http://localhost:5173` 启动，并自动代理 API 请求到后端。

**访问地址:** `http://localhost:5173`

---

### 方式二：构建前端后运行

适合测试完整构建流程或不需要前端热重载的场景。

```bash
# 1. 构建前端
cd web
bun install
bun run build

# 2. 启动后端（会自动服务前端构建产物）
cd ..
go run main.go
```

**访问地址:** `http://localhost:3000`

---

## ⚙️ 配置说明

### 数据库配置

#### 使用 SQLite (默认，推荐开发环境)

无需额外配置，项目会自动在 `./data/oneapi.db` 创建数据库文件。

#### 使用 PostgreSQL

1. 安装并启动 PostgreSQL：
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

2. 创建数据库：
```bash
sudo -u postgres psql
CREATE DATABASE newapi;
CREATE USER newapi WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE newapi TO newapi;
\q
```

3. 配置 `.env` 文件：
```env
SQL_DSN=postgres://newapi:your_password@localhost:5432/newapi?sslmode=disable
```

#### 使用 MySQL

1. 安装并启动 MySQL：
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

2. 创建数据库：
```bash
sudo mysql
CREATE DATABASE newapi;
CREATE USER 'newapi'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON newapi.* TO 'newapi'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. 配置 `.env` 文件：
```env
SQL_DSN=newapi:your_password@tcp(localhost:3306)/newapi?parseTime=true
```

### Redis 配置 (可选)

```bash
# 安装 Redis
sudo apt update
sudo apt install redis-server

# 启动 Redis
sudo systemctl start redis

# 在 .env 中配置
REDIS_CONN_STRING=redis://localhost:6379
```

### 常用环境变量

编辑 `.env` 文件：

```env
# 服务端口
PORT=3000

# 数据库配置 (SQLite 默认，无需配置)
# SQL_DSN=postgres://user:pass@localhost:5432/newapi
# SQL_DSN=user:pass@tcp(localhost:3306)/newapi?parseTime=true

# Redis 缓存 (可选)
# REDIS_CONN_STRING=redis://localhost:6379

# 开发模式
GIN_MODE=debug
DEBUG=true

# 内存缓存 (无 Redis 时推荐开启)
MEMORY_CACHE_ENABLED=true

# 同步频率（秒）
SYNC_FREQUENCY=60

# 批量更新
BATCH_UPDATE_ENABLED=true
BATCH_UPDATE_INTERVAL=5

# 会话密钥 (多机部署必须)
# SESSION_SECRET=your_random_secret_string

# 流式响应超时（秒）
# STREAMING_TIMEOUT=300
```

## 📁 项目结构

```
new-api/
├── web/                    # 前端项目
│   ├── src/               # 前端源代码
│   ├── public/            # 静态资源
│   ├── dist/              # 构建输出目录
│   ├── package.json       # 前端依赖
│   └── vite.config.js     # Vite 配置
├── controller/            # 控制器
├── model/                 # 数据模型
├── router/                # 路由
├── service/               # 业务逻辑
├── middleware/            # 中间件
├── common/                # 公共代码
├── main.go                # 后端入口
├── go.mod                 # Go 依赖
├── .env.example           # 环境变量示例
└── docker-compose.yml     # Docker Compose 配置
```

## 🛠️ 开发工具命令

### 后端

```bash
# 运行后端
go run main.go

# 构建后端
go build -o new-api

# 运行构建的二进制文件
./new-api

# 格式化代码
go fmt ./...

# 运行测试
go test ./...

# 更新依赖
go mod tidy
```

### 前端

```bash
# 进入前端目录
cd web

# 安装依赖
bun install
# 或使用 npm
npm install

# 启动开发服务器
bun run dev
# 或
npm run dev

# 构建生产版本
bun run build
# 或
npm run build

# 代码格式化
bun run lint:fix
# 或
npm run lint:fix

# ESLint 检查
bun run eslint
# 或
npm run eslint

# 预览构建产物
bun run preview
# 或
npm run preview
```

## 🐛 常见问题

### 1. Go 命令找不到

```bash
# 确保 Go 已添加到 PATH
export PATH=$PATH:/usr/local/go/bin
source ~/.bashrc
```

### 2. 端口冲突

如果 3000 或 5173 端口被占用：

```bash
# 查看占用端口的进程
lsof -i :3000
lsof -i :5173

# 修改后端端口：编辑 .env
PORT=3001

# 修改前端端口：启动时指定
bun run dev --port 5174
```

### 3. 前端无法连接后端

确保：
1. 后端服务已启动在 `http://localhost:3000`
2. 前端 `vite.config.js` 中的 proxy 配置正确
3. 检查防火墙设置

### 4. 数据库连接失败

```bash
# 检查数据库服务状态
sudo systemctl status postgresql  # PostgreSQL
sudo systemctl status mysql       # MySQL

# 检查 .env 中的连接字符串是否正确
# 确保数据库用户有正确的权限
```

### 5. Go 依赖下载失败

```bash
# 使用国内代理
go env -w GOPROXY=https://goproxy.cn,direct

# 清理模块缓存
go clean -modcache

# 重新下载
go mod download
```

### 6. Bun 安装依赖失败

```bash
# 清除缓存
rm -rf node_modules
rm bun.lock

# 重新安装
bun install

# 或使用 npm
npm install
```

## 🔍 调试

### 后端调试

使用 VSCode 的 Go 调试器：

创建 `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Backend",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}",
      "env": {
        "GIN_MODE": "debug"
      },
      "args": []
    }
  ]
}
```

### 前端调试

1. Chrome DevTools (F12)
2. VSCode 浏览器调试扩展
3. React DevTools 浏览器插件

## 📝 开发流程

1. **启动后端**: `go run main.go`
2. **启动前端**: `cd web && bun run dev`
3. **访问**: `http://localhost:5173`
4. **修改代码**: 前端自动热重载，后端需重启服务
5. **提交前**: 运行 `bun run lint:fix` 格式化代码

## 🎯 生产环境构建

```bash
# 1. 构建前端
cd web
bun install
bun run build

# 2. 构建后端
cd ..
go build -ldflags "-s -w -X 'github.com/QuantumNous/new-api/common.Version=v1.0.0'" -o new-api

# 3. 运行
./new-api
```

## 📚 相关文档

- [官方文档](https://docs.newapi.pro/)
- [API 文档](https://docs.newapi.pro/api)
- [环境变量完整说明](https://docs.newapi.pro/installation/environment-variables)
- [部署指南](https://docs.newapi.pro/installation)

## 🆘 获取帮助

- [GitHub Issues](https://github.com/Calcium-Ion/new-api/issues)
- [官方文档](https://docs.newapi.pro/)
- [FAQ](https://docs.newapi.pro/support/faq)

---

**祝开发愉快！** 🎉
