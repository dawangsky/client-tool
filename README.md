# FundEase · fund-mac

基金代销系统 **macOS 桌面客户端**（Tauri 2 + Vue 3 + TypeScript）。

功能目标与 Web 用户侧（`fund-front`，本机目录常为 `../font`）对等；同一账号支持多端登录预留；操作审计客户端上报预留（后端见 WOR-7）。

## 环境要求

- macOS + Xcode Command Line Tools
- Node.js 20+（推荐）
- Rust（`rustup`）与 Cargo
- 后端联调时：本机 `fund-back` 监听 `http://localhost:8080`（**不依赖 Docker**）

## 快速启动

```bash
cd /Users/wangda/agent/fund/mac
npm install

# 仅前端（浏览器，默认 Mock）
npm run dev
# 打开 http://localhost:1420

# 桌面客户端（推荐验收）
npm run tauri:dev
```

打包：

```bash
npm run tauri:build
```

## 配置

| 变量 | 说明 | 开发默认 |
|------|------|----------|
| `VITE_USE_MOCK` | `true` 走本地 mock | **`false`（对接 Java）** |
| `VITE_API_BASE_URL` | API 前缀 | `/api/v1` |
| `VITE_API_PROXY_TARGET` | Vite 代理目标 | `http://localhost:8080` |
| `VITE_DEVICE_TYPE` | 设备类型头 | `mac` |

**默认已关闭 Mock**，经 Vite 代理访问本机 `fund-back`（`http://localhost:8080`）。

1. 先启动 Java：`fund-back`（8080）
2. 再 `npm run tauri:dev` 或 `npm run dev`
3. 打开应用会先进入 **登录页**；未登录不可进业务页
4. 无账号可先「注册」（Sprint1 密码任意非空即可）

临时切回 Mock：`.env.development` 设 `VITE_USE_MOCK=true` 后重启。

### 打包注意（`tauri:build`）

开发有 Vite 代理，打包后 **没有**。`.env.production` 已配置：

`VITE_API_BASE_URL=http://127.0.0.1:8080/api/v1`

打包版通过 **Tauri HTTP 插件（Rust 出站）** 访问 Java，避免 WebView CORS；业务编排仍在 Vue。

请保证 `fund-back` 在 8080 运行。抓包请盯 **`127.0.0.1:8080`**（不是 1420）。

## 与 fund-front / fund-back 联调

- API 契约：`openspec/contracts/`（自 Web/后端契约同步；桌面 UI 见 `openspec/specs/desktop-ui.md`）
- 请求自动带：`Authorization`、`Idempotency-Key`（写操作）、`X-Device-Id`、`X-Device-Type`
- 多端会话：`src/api/session.ts` → `/sessions/*`（后端 WOR-7）
- 审计上报：`src/api/audit.ts` → `/audit/events`；未就绪时本地队列

## 主要路由

| 路径 | 说明 |
|------|------|
| `/` | 资产概览 |
| `/funds` | 产品列表 |
| `/purchase/:code` `/redeem/:code` | 申购 / 赎回 |
| `/orders` `/positions` `/messages` | 订单 / 持仓 / 消息 |
| `/risk-quiz` `/kyc` `/open-account` `/bind-card` | 适当性与开户 |
| `/devices` | 登录设备（多端） |
| `/login` `/register` | 认证 |

## 项目结构

```
src/           Vue 前端（API / 视图 / 侧栏壳）
src-tauri/     Rust：窗口 + get_device_id 命令
openspec/      契约与桌面 UI 规范
```

## 演示账号（Mock）

任意手机号 + 密码即可登录；建议走一遍：登录 → KYC → 开户 → 绑卡 → 风测 → 申购。
