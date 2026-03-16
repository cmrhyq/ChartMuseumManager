# ChartMuseum 管理控制台

基于 React + Vite 的 ChartMuseum Web 管理端，用于管理部署在 K8s 中的 ChartMuseum：登录使用 ChartMuseum 的 Basic Auth 账号密码，支持图表列表、上传、删除与详情查看。

## 功能

- **登录**：使用 ChartMuseum 的 Basic Auth 用户名/密码登录
- **图表列表**：查看所有 Helm 图表及版本，按名称筛选，支持删除与跳转详情
- **上传**：上传 `.tgz` 打包的 Helm Chart
- **图表详情**：查看单版本描述、App 版本、维护者等
- **设置**：配置 ChartMuseum API 根地址，检测连接（未登录用 `/health`，已登录用 `/api/charts`）

## 开发

```bash
npm install
npm run dev
```

开发时可将 ChartMuseum 请求代理到本地：在 `vite.config.ts` 中已配置 `/api`、`/health`、`/info` 代理到 `http://localhost:8080`，可将前端与 ChartMuseum 同源或自行修改代理目标。

## 构建与预览

```bash
npm run build
npm run preview
```

## 安全说明

- **凭据**：登录后仅将 Basic Auth 令牌存于 `sessionStorage`，不写入 `localStorage`，关闭标签页即失效；不在前端持久化明文密码。
- **错误信息**：登录失败等仅提示「请检查账号密码」，不暴露 401/403 或后端详情。
- **传输**：生产环境请通过 **HTTPS** 访问前端与 ChartMuseum；部署时可在 Web 服务器配置 CSP、HSTS 等安全头。
- **CORS**：若前端与 ChartMuseum 不同源，需在 ChartMuseum 或 Ingress 侧配置允许前端源及凭证（不能使用 `Access-Control-Allow-Origin: *` 带凭证）。
- **依赖**：建议定期执行 `npm audit` 检查依赖漏洞。

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_CHARTMUSEUM_API` | ChartMuseum API 根地址（可选），未设置时可在应用内「设置」页配置 |
