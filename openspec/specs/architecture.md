# 前端架构规格

## 技术栈

| 项 | 选型 |
|----|------|
| 框架 | Vue 3（Composition API） |
| 语言 | TypeScript |
| 构建 | Vite |
| 路由 | Vue Router |
| 状态 | Pinia |
| HTTP | Axios（封装统一响应、错误码、幂等 Header） |
| UI | Element Plus 或 Ant Design Vue（实现期选定一种） |

## 应用划分

| 应用 | 用户 | 路由前缀 | 说明 |
|------|------|----------|------|
| `fund-web` | C 端投资者 | `/` | H5 或 Web，当前 Sprint 重点打磨 UI |
| `fund-admin` | 运营 | `/admin/*` | 后台管理，二期实现功能 |

**V1 部署策略（已采纳）**：单 Vite 工程、双布局（`UserLayout` / `AdminLayout`），C 端与运营共用 Axios 封装与 `/api/v1` 后端。运营路由仅占位，与 C 端视觉与导航完全隔离。

**二期可选演进**：拆为 monorepo（`apps/fund-web` + `apps/fund-admin` + `packages/shared-api`）或双仓库；API 层与类型定义可抽到 `shared-api` 复用。

## 目录建议（C 端）

```text
src/
├── api/           # 按 contracts 模块分文件
├── views/         # 页面
├── components/
├── stores/        # Pinia
├── router/
├── utils/         # 金额/份额格式化、鉴权
└── types/         # 与 contracts 对齐的 TS 类型
```

## 横切

- **鉴权**：Bearer token，401 跳登录
- **金额展示**：分 → 元，份额 4 位小数
- **错误码**：`42201` 适当性 → 引导风测；`42204` → 撤单不可用提示
- **幂等**：下单类接口自动生成 `Idempotency-Key`

## 契约来源

API 路径与字段以 `contracts/` 为准；类型可手写或 OpenAPI 生成（后续补充 `contracts/openapi.yaml`）。
