---
name: fix-cors-proxy
overview: 在vite.config.ts中添加代理配置，将/api/cloud请求转发到https://openapi.qvcloud.net，同时更新cloud-api.ts中的请求地址使用代理路径，解决跨域问题。
todos:
  - id: add-vite-proxy
    content: 在 vite.config.ts 的 server 中添加 /api/cloud 代理到 https://openapi.qvcloud.net
    status: completed
  - id: update-api-base
    content: 将 cloud-api.ts 中 CLOUD_API_BASE 改为 /api/cloud 相对路径
    status: completed
---

## 问题概述

设备连接时报错 "Network Error"，原因是浏览器直接请求 `https://openapi.qvcloud.net/dev_exe_cmd` 被浏览器 CORS 策略拦截。`localhost:5173` 向 `openapi.qvcloud.net` 发起跨域请求，目标服务器未返回允许的 CORS 头。

## 核心需求

配置 Vite 开发代理，将前端对 `/api/cloud` 的请求转发到 `https://openapi.qvcloud.net`，绕过浏览器 CORS 限制，使设备连接功能正常工作。

## 技术方案

### 代理配置

在 `vite.config.ts` 的 `server` 中添加 `proxy`，将 `/api/cloud` 路径前缀的请求代理到 `https://openapi.qvcloud.net`，并移除路径前缀（`rewrite`）。

### API 基础地址切换

在 `cloud-api.ts` 中，将 `CLOUD_API_BASE` 从绝对地址 `https://openapi.qvcloud.net` 改为相对路径 `/api/cloud`，这样开发环境请求会走 Vite 代理，不触发跨域。

### 实现细节

- Vite proxy 仅在开发环境生效，`vite preview` 也可以使用
- 生产部署时需要通过 nginx 等反向代理配置同样的路由规则
- `changeOrigin: true` 确保代理请求的 `Host` 头设置为目标域名，避免服务端拒绝

### 影响范围

仅修改 2 个文件：`vite.config.ts` 和 `src/api/cloud-api.ts`，改动极小，不影响其他模块。