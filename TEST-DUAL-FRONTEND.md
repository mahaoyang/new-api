# 双前端测试指南

## 当前状态

✅ 用户前端代码已完成
✅ 用户前端已成功构建 (`web-user/dist/`)
✅ 后端代码已修改支持双前端
⏳ 等待 Go 构建测试

## 已完成的工作

### 1. 前端构建

**管理后台** (`web/dist/`):
- 原有的 React + Semi UI 前端
- 完整的管理功能

**用户前端** (`web-user/dist/`):
- Alpine.js + Tailwind CSS
- 简化的用户界面
- 构建产物大小：~250KB (gzip后 ~65KB)

### 2. 后端修改

**文件修改列表**:
- `main.go` - 添加双前端 embed
- `router/main.go` - 修改路由签名
- `router/dual-web-router.go` - 新建双前端路由分发
- `Dockerfile` - 更新构建流程

## 本地测试方法

### 方式1: 使用 Go 命令（推荐）

```bash
cd /home/ha/workspace/new-api

# 1. 确保两个前端都已构建
ls -la web/dist/index.html         # 管理后台
ls -la web-user/dist/index.html    # 用户前端

# 2. 构建并运行
go build -o new-api main.go
./new-api
```

访问测试:
- 用户前端: http://localhost:3000/
- 管理后台: http://localhost:3000/console
- API: http://localhost:3000/api/status

### 方式2: 使用 Docker

#### 准备工作

确保网络连接正常，能访问 Docker Hub。

#### 构建镜像

```bash
cd /home/ha/workspace/new-api

# 构建 Docker 镜像
docker build -t new-api:dual-frontend .
```

#### 运行容器

```bash
# 使用 docker-compose
docker-compose up -d

# 或手动运行
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/data \
  --name new-api-test \
  new-api:dual-frontend
```

#### 查看日志

```bash
docker logs -f new-api-test
```

### 方式3: 开发模式

```bash
# 终端1: 启动后端
cd /home/ha/workspace/new-api
go run main.go

# 终端2: 启动用户前端（开发服务器）
cd web-user
bun run dev
# 访问 http://localhost:5174
```

## 测试清单

### ✅ 前端构建测试

```bash
# 用户前端构建
cd web-user
bun install
bun run build
ls -la dist/  # 应该看到 index.html 和 assets/

# 检查构建产物
ls dist/src/pages/*.html  # 应该有3个页面
```

### ⏳ 后端集成测试

需要 Go 环境执行以下测试：

1. **编译测试**
   ```bash
   go build -o new-api main.go
   # 应该成功编译，无错误
   ```

2. **启动测试**
   ```bash
   ./new-api
   # 应该看到双前端embed成功的日志
   ```

3. **路由测试**
   ```bash
   # 测试用户前端
   curl http://localhost:3000/ | grep "New API"

   # 测试管理后台
   curl http://localhost:3000/console | grep "console"

   # 测试API
   curl http://localhost:3000/api/status
   ```

4. **浏览器测试**
   - 访问 `/` → 应该看到用户登录页
   - 访问 `/console` → 应该看到管理后台
   - 检查开发者工具网络面板，确认静态文件正确加载

### 🔍 功能测试

登录后测试以下功能：

#### 用户前端功能

1. **登录**
   - [ ] 输入用户名密码
   - [ ] 成功登录
   - [ ] 显示用户余额

2. **Token管理** (`/src/pages/tokens.html`)
   - [ ] 查看Token列表
   - [ ] 创建新Token（默认支持所有模型）
   - [ ] 复制Token密钥
   - [ ] 删除Token

3. **使用统计** (`/src/pages/dashboard.html`)
   - [ ] 查看今天/7天/30天统计
   - [ ] 显示总消耗、RPM、TPM
   - [ ] 自定义时间范围

4. **使用记录** (`/src/pages/usage.html`)
   - [ ] 查看调用记录
   - [ ] 按时间筛选
   - [ ] 分页浏览

#### 管理后台功能

- [ ] 访问 `/console` 正常
- [ ] 所有原有功能不受影响

## 故障排查

### 问题1: 编译错误

**现象**: `go build` 失败

**排查**:
```bash
# 检查 Go 版本
go version  # 应该 >= 1.21

# 检查文件是否存在
ls router/dual-web-router.go
ls web/dist/index.html
ls web-user/dist/index.html

# 检查语法
go fmt ./...
go vet ./...
```

### 问题2: 前端不显示

**现象**: 访问网页是空白或404

**排查**:
```bash
# 检查embed是否成功
strings new-api | grep "index.html"  # 应该看到两个前端的文件

# 检查路由
curl -v http://localhost:3000/  # 查看响应头
```

### 问题3: API调用失败

**现象**: 前端无法调用API

**排查**:
- 检查浏览器控制台网络面板
- 确认 CORS 配置正确
- 检查 cookies 和 session

### 问题4: 样式不正确

**现象**: 页面布局错乱

**原因**: CSS未正确加载

**解决**:
```bash
# 重新构建用户前端
cd web-user
rm -rf dist
bun run build

# 检查CSS文件
ls dist/assets/*.css
```

## Docker 网络问题

如果遇到 "dial tcp 198.18.0.5:443: i/o timeout" 错误：

```bash
# 方案1: 使用镜像加速
# 编辑 /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com"
  ]
}

sudo systemctl restart docker

# 方案2: 使用代理
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
docker build --build-arg HTTP_PROXY --build-arg HTTPS_PROXY -t new-api:dual-frontend .

# 方案3: 离线构建
# 先pull所需镜像
docker pull oven/bun:latest
docker pull golang:alpine
docker pull alpine:latest

# 然后构建
docker build -t new-api:dual-frontend .
```

## 下一步

1. **完成Go构建测试**
   - 需要Go环境
   - 或者在有Go的Docker容器中测试

2. **性能测试**
   - 测试双前端的加载速度
   - 检查内存占用

3. **压力测试**
   - 并发访问测试
   - 确保路由正确分发

4. **生产部署**
   - 更新部署文档
   - 准备发布

## 文件检查清单

在测试前，确认以下文件都已正确修改/创建：

```bash
# 新增文件
[x] web-user/                   # 用户前端目录
[x] web-user/src/api/*.js       # API客户端
[x] web-user/src/pages/*.html   # 页面
[x] web-user/dist/              # 构建产物
[x] router/dual-web-router.go   # 双前端路由
[x] build-both.sh               # 构建脚本

# 修改文件
[x] main.go                     # 添加 userBuildFS
[x] router/main.go              # 修改 SetRouter
[x] Dockerfile                  # 添加用户前端构建

# 检查构建产物
ls web/dist/index.html          # ✅
ls web-user/dist/index.html     # ✅
ls web-user/dist/src/pages/     # ✅ dashboard.html, tokens.html, usage.html
```

## 总结

**已完成** ✅:
- 用户前端开发（100%）
- 前端构建成功
- 后端代码修改
- Dockerfile更新

**待测试** ⏳:
- Go编译和运行
- 双前端路由测试
- 功能完整性测试

**已知限制**:
- 当前测试环境无Go命令
- Docker registry连接超时

**建议**:
1. 在有Go环境的机器上测试
2. 或使用带Go的Docker容器测试
3. 测试通过后可以commit代码

---

**准备就绪，等待Go构建测试！** 🚀
