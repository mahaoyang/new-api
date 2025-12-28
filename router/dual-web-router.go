package router

import (
	"embed"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// SetDualWebRouter 设置双前端路由
// /console/* -> 管理后台 (admin)
// /* -> 用户前端 (user)
func SetDualWebRouter(router *gin.Engine, adminBuildFS, userBuildFS embed.FS, adminIndexPage, userIndexPage []byte) {
	consoleFS := common.EmbedFolder(adminBuildFS, "web/dist")
	userFS := common.EmbedFolder(userBuildFS, "web-user/dist")

	// 全局中间件处理静态文件
	router.Use(func(c *gin.Context) {
		path := c.Request.URL.Path

		// API路由，跳过
		if strings.HasPrefix(path, "/api/") ||
			strings.HasPrefix(path, "/v1/") ||
			strings.HasPrefix(path, "/mj/") ||
			strings.HasPrefix(path, "/pg/") {
			c.Next()
			return
		}

		// 管理后台相关
		if strings.HasPrefix(path, "/console") {
			if path == "/console" || path == "/console/" {
				c.Data(http.StatusOK, "text/html; charset=utf-8", adminIndexPage)
				c.Abort()
				return
			}

			// /console/xxx -> 去掉前缀后从管理后台读取
			subPath := strings.TrimPrefix(path, "/console")
			c.Request.URL.Path = subPath
			static.Serve("/", consoleFS)(c)

			// SPA fallback
			if c.Writer.Status() == 404 {
				c.Data(http.StatusOK, "text/html; charset=utf-8", adminIndexPage)
			}
			c.Abort()
			return
		}

		// /assets/* 和 /logo.png 等静态资源
		// 优先从管理后台读取（如果是从 /console 跳转过来的）
		// 检查 Referer
		referer := c.Request.Referer()
		if strings.Contains(referer, "/console") {
			// 来自管理后台，从管理后台资源读取
			static.Serve("/", consoleFS)(c)
			if c.Writer.Status() != 404 {
				c.Abort()
				return
			}
		}

		// 用户前端静态文件
		if strings.Contains(path, ".") {
			static.Serve("/", userFS)(c)
			if !c.IsAborted() {
				c.Abort()
			}
			return
		}

		c.Next()
	})

	// NoRoute处理：用户前端的 SPA fallback
	router.NoRoute(func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", userIndexPage)
	})
}
