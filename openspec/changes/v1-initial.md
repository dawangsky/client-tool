# V1 初始规格（前端仓）

| 日期 | 说明 |
|------|------|
| 2026-07-16 | 基于《基金代销系统-V1最小功能模块.md》建立前端 OpenSpec |
| 2026-07-16 | 与后端拆分为独立 `openspec/`（前后端分仓） |

## 范围

- 10 大模块 `contracts/`（跟随后端权威副本）
- `specs/`：前端架构、C 端 + 运营后台路由页面
- `project/`：V1 范围与 5 个 Sprint

## 待实现期补充

- [ ] UI 组件库最终选型（Element Plus / Ant Design Vue）
- [ ] 与后端 `contracts/` 的同步方式（PR 说明 / 脚本拷贝）

## 变更规则

1. API 变更以**后端仓** `contracts/` 为准，同步到本仓后再改 `api/` 与页面
2. 纯前端交互变更只改 `specs/`，在 `changes/` 追加记录
