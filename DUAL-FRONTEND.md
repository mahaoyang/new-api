# New API 双前端架构说明

本项目现在支持双前端架构：**管理后台** 和 **用户前端**。

## 架构概览

```
New API
├── 管理后台 (web/)              访问: /console
│   ├── 完整的管理功能
│   ├── 用户管理、渠道管理
│   ├── 系统设置、模型配置
│   └── 全局统计和日志
│
├── 用户前端 (web-user/)        访问: /
│   ├── 简化的用户界面
│   ├── API 密钥管理（简化版）
│   ├── 个人使用统计
│   └── 使用记录查询
│
└── 后端 API (Go)                访问: /api
    └── 统一的 REST API
```

## 功能对比

| 功能 | 用户前端 (/) | 管理后台 (/console) |
|------|-------------|-------------------|
| **认证** | ✅ 登录/登出 | ✅ 登录/登出 |
| **API密钥管理** | ✅ 简化版（一键全模型） | ✅ 完整版（可限制模型） |
| **使用统计** | ✅ 个人统计 | ✅ 全局统计 |
| **使用记录** | ✅ 个人记录 | ✅ 所有记录 |
| **用户管理** | ❌ | ✅ |
| **渠道管理** | ❌ | ✅ |
| **模型配置** | ❌ | ✅ |
| **系统设置** | ❌ | ✅ |
| **目标用户** | 普通用户 | 管理员 |

## 核心特性

### 用户前端特性

1. **简化的 Token 创建**
   - 默认支持所有可用模型
   - 无需配置模型限制
   - 一键创建，立即可用

2. **清晰的使用统计**
   - 时间范围筛选（今天/7天/30天/自定义）
   - 总消耗、请求次数、Token 数
   - 实时更新

3. **详细的使用记录**
   - 按时间筛选
   - 查看每次调用详情
   - 分页浏览

### 技术亮点

- **Alpine.js**: 轻量级，无需构建步骤即可开发
- **Lily UI**: 你的自制组件库，完美集成
- **Vite**: 快速的开发和构建
- **Tailwind CSS 4**: 现代化的样式方案

## 开发指南

### 1. 前端开发

#### 开发用户前端

```bash
cd web-user
bun install
bun run dev
```

访问 http://localhost:5174

#### 开发管理后台

```bash
cd web
bun install
bun run dev
```

访问 http://localhost:5173

### 2. 后端开发

```bash
# 启动后端（监听 3000 端口）
go run main.go
```

### 3. 完整开发环境

使用 tmux 同时运行：

```bash
# 终端1: 后端
go run main.go

# 终端2: 管理后台前端
cd web && bun run dev

# 终端3: 用户前端
cd web-user && bun run dev
```

## 构建和部署

### 单命令构建

```bash
./build-both.sh
```

这会：
1. 构建管理后台前端 (`web/dist`)
2. 构建用户前端 (`web-user/dist`)
3. 将两个前端打包进 Go 二进制文件

### 手动构建

```bash
# 1. 构建管理后台
cd web
bun run build
cd ..

# 2. 构建用户前端
cd web-user
bun run build
cd ..

# 3. 构建 Go 后端（会自动 embed 两个前端）
go build -o new-api main.go
```

### 运行

```bash
./new-api
```

访问：
- **用户前端**: http://localhost:3000/
- **管理后台**: http://localhost:3000/console
- **API**: http://localhost:3000/api

## 路由规则

### 后端路由分发逻辑

```
请求进入
  ↓
是 /api/* ?  ────── 是 ──→ API 处理
  ↓ 否
是 /console/* ? ─── 是 ──→ 管理后台
  ↓ 否
其他所有请求 ──────────→ 用户前端
```

### 详细规则

| 路径模式 | 处理方式 |
|---------|---------|
| `/api/*` | 后端 API |
| `/v1/*` | OpenAI 兼容 API |
| `/mj/*` | Midjourney API |
| `/pg/*` | Playground API |
| `/console/*` | 管理后台 (React) |
| `/console` | 管理后台首页 |
| `/` | 用户前端首页 |
| `/src/pages/*.html` | 用户前端页面 |
| 其他 | 用户前端 |

## API 端点

两个前端共用相同的后端 API，但权限不同。

### 用户前端使用的 API

```javascript
// 认证
POST   /api/user/login
GET    /api/user/logout
GET    /api/user/self

// Token 管理
GET    /api/token/              // 获取列表
POST   /api/token/              // 创建（简化）
DELETE /api/token/:id           // 删除

// 使用统计
GET    /api/log/self            // 个人日志
GET    /api/log/self/stat       // 个人统计
```

### 简化的 Token 创建

用户前端创建 Token 时自动配置：

```javascript
{
  name: "用户输入",
  remain_quota: 用户输入,
  expired_time: 用户选择,
  model_limits_enabled: false,  // ← 关键：不限制模型
  model_limits: ""              // ← 空 = 所有模型可用
}
```

## 实现原理

### 1. Go Embed 双前端

```go
//go:embed web/dist
var adminBuildFS embed.FS

//go:embed web-user/dist
var userBuildFS embed.FS
```

### 2. 路由分发

`router/dual-web-router.go` 实现了智能路由：

- `/console/*` → 管理后台静态文件
- 其他 → 用户前端静态文件
- 避免冲突，API 优先

### 3. 前端独立开发

- 管理后台：React + Semi UI + Vite (端口 5173)
- 用户前端：Alpine.js + Tailwind + Vite (端口 5174)
- 两者通过代理连接后端 (端口 3000)

## 常见问题

### Q: 为什么需要两个前端？

A:
- **用户前端**: 简化的界面，让普通用户更容易使用
- **管理后台**: 完整的功能，供管理员配置系统

### Q: 用户前端能做哪些管理后台不能做的？

A: 两者功能是包含关系，管理后台功能更全。用户前端的优势是简洁、易用。

### Q: 如何自定义用户前端？

A: 修改 `web-user/` 目录下的文件：
- `src/pages/*.html` - 页面
- `src/style.css` - 样式
- `src/api/*.js` - API 调用
- `src/stores/*.js` - 状态管理

### Q: 部署时需要两个服务器吗？

A: 不需要。构建后只有一个二进制文件，两个前端都打包在里面。

### Q: 可以只用管理后台吗？

A: 可以。访问 `/console` 即可，用户前端不影响原有功能。

### Q: lily-ui 如何集成？

A: 在 `web-user/src/style.css` 中导入：

```css
@import '../../lily-ui/src/input.css';
```

然后在 HTML 中使用 lily-ui 的样式类。

## 后续扩展

### 预留的功能接口

1. **支付功能** (TODO)
   - API 已就绪: `/api/user/self/pay`
   - 前端页面: 创建 `src/pages/payment.html`

2. **个人设置** (TODO)
   - API: `/api/user/self/setting`
   - 前端页面: 创建 `src/pages/settings.html`

3. **通知中心** (TODO)
   - 可以添加系统通知、额度提醒等

## 文件清单

### 新增文件

```
web-user/                      # 用户前端目录
├── src/
│   ├── api/                   # API 客户端
│   ├── pages/                 # HTML 页面
│   ├── stores/                # Alpine stores
│   ├── utils/                 # 工具函数
│   └── style.css             # 样式
├── index.html                # 主页
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md

router/
└── dual-web-router.go        # 双前端路由

build-both.sh                 # 构建脚本
DUAL-FRONTEND.md             # 本文档
```

### 修改文件

```
main.go                       # 添加 userBuildFS
router/main.go               # 修改 SetRouter 签名
```

## 许可证

GNU AGPL-3.0

---

**开发愉快！** 🚀

如有问题，请查阅：
- 用户前端文档: `web-user/README.md`
- 原项目文档: `DEVELOPMENT.md`
