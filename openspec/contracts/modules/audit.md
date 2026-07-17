# 模块：操作审计（预留，对齐后端 WOR-7）

> 后端契约落地后以服务端为准覆盖本文件。

## API（规划）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/audit/events` | C 端补报 UI/操作事件（需鉴权） |

## 客户端事件（至少）

- `LOGIN_SUCCESS` / `LOGIN_FAIL`
- `LOGOUT`
- `PURCHASE` / `REDEEM` / `CANCEL_ORDER`

## 客户端实现

- `src/api/audit.ts`：先入本地队列，再尝试上报；失败保留队列待 `flushAuditQueue`
