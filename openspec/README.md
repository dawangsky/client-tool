# 基金代销系统 · macOS 客户端 OpenSpec

> 仓库：Tauri 2 + Vue 3 + TypeScript（fund-mac）  
> 产品：公募场外基金代销 · C 端桌面

本目录服务 **macOS 桌面客户端**。契约跟随后端 / Web；桌面专属 UI 规范见 `specs/desktop-ui.md`。

## 沟通语言

**与用户及 Multica issue 评论尽可能使用简体中文**（代码标识符可英文）。

## 目录

```text
openspec/
├── README.md
├── project/                  # V1 范围（与 Web/后端对齐）
├── contracts/                # API 契约副本（跟随后端）
│   ├── api-conventions.md
│   └── modules/
├── specs/
│   ├── architecture.md       # 可参考 Web
│   ├── pages.md
│   └── desktop-ui.md         # 桌面视觉与信息架构（本仓新增）
└── changes/
```

## 与后端 / Web 的关系

| 目录 | 谁维护 | 说明 |
|------|--------|------|
| `contracts/` | **跟随后端** | 勿擅自改路径语义；多端/审计见 WOR-7 |
| `specs/desktop-ui.md` | 仅 Mac | 侧栏壳、主题、与 Web 差异 |
| Web `fund-front` | 业务页参考 | API 层思路可复用，视觉按桌面重做 |

## Sprint 1

- 脚手架可 `tauri:dev`
- 对等 C 端路由骨架 + Mock
- 多端 deviceId / 会话 API 预留、审计本地队列预留
